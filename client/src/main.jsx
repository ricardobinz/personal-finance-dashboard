import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { initAnalytics, trackWebVitals } from './lib/analytics.js'
import { initSentry } from './lib/sentry.js'
import { setSuperProps } from './lib/analytics.js'
import { capture } from './lib/analytics.js'

// Initialize analytics (no-ops in development or when env is missing)
let consentGranted = false
try { consentGranted = (localStorage.getItem('pf_consent') === 'granted') } catch {}
if (consentGranted) {
  initAnalytics()
  trackWebVitals()
  // One-time log of consent
  try {
    const k = 'pf_consent_logged_v1'
    if (!localStorage.getItem(k)) {
      capture('consent_status', { status: 'granted' })
      localStorage.setItem(k, '1')
    }
  } catch {}
}
initSentry()
setSuperProps({ app_version: import.meta.env.VITE_APP_VERSION || undefined })

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
