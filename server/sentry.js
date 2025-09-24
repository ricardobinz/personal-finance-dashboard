// Optional Sentry initialization for Node (server). No-ops unless SENTRY_DSN is set and the package is installed.
// Usage in index.js:
//   import { initSentry, reportError } from './sentry.js'
//   initSentry(app)
//   process.on('unhandledRejection', (reason) => reportError(reason))
//   process.on('uncaughtException', (err) => reportError(err))

let Sentry = null

export async function initSentry(app) {
  try {
    if (!process.env.SENTRY_DSN) return
    // Dynamically import only if available to avoid breaking without dependency
    const mod = await import('@sentry/node')
    Sentry = mod?.default || mod
    if (!Sentry) return
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'production',
      tracesSampleRate: 0.1,
    })
    // Request handler creates a separate execution context using domains, so that every
    // transaction/span/breadcrumb is attached to its own Hub instance
    app.use(Sentry.Handlers.requestHandler())
    // Error handler must be before any other error middleware and after all controllers
    app.use(Sentry.Handlers.errorHandler())
    // eslint-disable-next-line no-console
    console.log('Sentry initialized on server')
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Sentry not initialized on server:', e?.message || e)
  }
}

export function reportError(err) {
  try {
    if (Sentry && err) Sentry.captureException(err)
  } catch {}
}
