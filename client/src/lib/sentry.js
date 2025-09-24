// Minimal Sentry browser loader via CDN. No-ops unless VITE_SENTRY_DSN is set and in production
// Usage:
//   import { initSentry, reportError } from './lib/sentry.js'
//   initSentry()
//   reportError(err, { where: 'context' })

const SENTRY_CDN = 'https://browser.sentry-cdn.com/7.120.1/bundle.tracing.min.js'

let sentryTried = false
let sentryReady = false

function loadScript(src, { id } = {}) {
  return new Promise((resolve, reject) => {
    if (id && document.getElementById(id)) return resolve()
    const s = document.createElement('script')
    if (id) s.id = id
    s.src = src
    s.async = true
    s.crossOrigin = 'anonymous'
    s.onload = () => resolve()
    s.onerror = () => reject(new Error(`Failed to load: ${src}`))
    document.head.appendChild(s)
  })
}

export function initSentry(opts = {}) {
  if (sentryTried) return
  sentryTried = true
  const dsn = opts.dsn ?? import.meta.env.VITE_SENTRY_DSN
  const enabled = Boolean(dsn) && (opts.enabled ?? import.meta.env.PROD)
  if (!enabled) return
  loadScript(SENTRY_CDN, { id: 'sentry-sdk' })
    .then(() => {
      const Sentry = window.Sentry
      if (!Sentry) return
      Sentry.init({
        dsn,
        environment: import.meta.env.MODE || 'production',
        release: import.meta.env.VITE_APP_VERSION || undefined,
        tracesSampleRate: 0.1,
      })
      sentryReady = true
    })
    .catch(() => {})
}

export function reportError(err, context = {}) {
  try {
    const Sentry = window.Sentry
    if (Sentry && sentryReady) {
      Sentry.withScope((scope) => {
        Object.entries(context || {}).forEach(([k, v]) => scope.setExtra(k, v))
        Sentry.captureException(err)
      })
    }
  } catch {}
}
