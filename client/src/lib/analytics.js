// Lightweight analytics wrapper for PostHog + Web Vitals (CDN-loaded)
// - Safe no-ops when env not configured or network blocked
// - Avoids bundler dependency installs
//
// Env (Vite):
//   VITE_POSTHOG_KEY  (required to enable)
//   VITE_POSTHOG_HOST (optional, defaults to US cloud)
//
// Usage:
//   import { initAnalytics, capture, identifyUser, resetIdentity, setSuperProps, trackWebVitals } from './lib/analytics.js'
//   initAnalytics(); trackWebVitals();

const PH_CDN = 'https://unpkg.com/posthog-js@1.151.3/dist/posthog.umd.js'
const WV_CDN = 'https://unpkg.com/web-vitals@3/dist/web-vitals.iife.js'

let initialized = false
let posthogReady = false
let webVitalsReady = false
let queued = []
let phEnabled = false

function loadScript(src, { id } = {}) {
  return new Promise((resolve, reject) => {
    if (id && document.getElementById(id)) return resolve()
    const s = document.createElement('script')
    if (id) s.id = id
    s.src = src
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error(`Failed to load: ${src}`))
    document.head.appendChild(s)
  })
}

function safePH(cb) {
  try {
    const ph = window.posthog
    if (ph && posthogReady) return cb(ph)
  } catch {}
  // If analytics is not enabled, drop silently
  if (!phEnabled) return
  // queue until ready
  queued.push(cb)
}

export function initAnalytics(opts = {}) {
  if (initialized) return
  initialized = true
  const key = opts.key ?? import.meta.env.VITE_POSTHOG_KEY
  const host = opts.host ?? import.meta.env.VITE_POSTHOG_HOST ?? 'https://us.i.posthog.com'
  const enabled = Boolean(key) && (opts.enabled ?? import.meta.env.PROD)
  phEnabled = enabled

  if (!enabled) {
    // keep no-ops; still allow setSuperProps to cache locally for future init
    return
  }

  loadScript(PH_CDN, { id: 'ph-sdk' })
    .then(() => {
      if (!window.posthog) throw new Error('PostHog SDK missing after load')
      window.posthog.init(key, {
        api_host: host,
        autocapture: true,
        capture_pageview: true,
        capture_pageleave: true,
        disable_session_recording: true,
      })
      posthogReady = true
      // flush queue
      const q = queued.splice(0, queued.length)
      q.forEach((cb) => {
        try { cb(window.posthog) } catch {}
      })
    })
    .catch(() => {
      // stay in no-op mode
    })
}

export function capture(event, properties = {}) {
  safePH((ph) => ph.capture(event, properties))
}

export function setSuperProps(props = {}) {
  safePH((ph) => ph.register(props))
}

export function identifyUser({ id, email }) {
  // Avoid sending raw email; attach domain only for segmentation
  const emailDomain = typeof email === 'string' && email.includes('@') ? email.split('@')[1] : undefined
  safePH((ph) => {
    const traits = {}
    if (emailDomain) traits.email_domain = emailDomain
    if (id) {
      ph.identify(id, traits)
    } else if (Object.keys(traits).length) {
      ph.register(traits)
    }
  })
}

export function resetIdentity() {
  safePH((ph) => ph.reset())
}

export function optIn() {
  safePH((ph) => ph.opt_in_capturing && ph.opt_in_capturing())
}

export function optOut() {
  safePH((ph) => ph.opt_out_capturing && ph.opt_out_capturing())
}

export function trackWebVitals(extraProps = {}) {
  if (webVitalsReady) return
  webVitalsReady = true
  loadScript(WV_CDN, { id: 'wv-sdk' })
    .then(() => {
      const wv = window.webVitals
      if (!wv) return
      const report = (metric) => {
        capture('web_vital', {
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          path: window.location?.pathname,
          ...extraProps,
        })
      }
      try {
        wv.onLCP(report)
        wv.onINP(report)
        wv.onCLS(report)
        wv.onTTFB(report)
      } catch {}
    })
    .catch(() => {})
}

// Small helper to bucket numbers without revealing precise values
export function bucketizeNumber(n) {
  if (typeof n !== 'number' || !isFinite(n)) return 'unknown'
  const abs = Math.abs(n)
  if (abs < 100) return '<100'
  if (abs < 500) return '100-499'
  if (abs < 1000) return '500-999'
  if (abs < 5000) return '1k-4.9k'
  if (abs < 10000) return '5k-9.9k'
  if (abs < 50000) return '10k-49k'
  if (abs < 100000) return '50k-99k'
  if (abs < 500000) return '100k-499k'
  if (abs < 1000000) return '500k-999k'
  return '1M+'
}
