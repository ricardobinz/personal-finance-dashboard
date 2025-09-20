import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import en from './locales/en.json'
import pt from './locales/pt.json'

const MESSAGES = { en, pt }
const DEFAULT_LOCALE = 'en'
const STORAGE_KEY = 'pf_locale'

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved && MESSAGES[saved]) return saved
    } catch {}
    const nav = typeof navigator !== 'undefined' ? navigator.language || '' : ''
    return nav.toLowerCase().startsWith('pt') ? 'pt' : DEFAULT_LOCALE
  })

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, locale) } catch {}
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale
    }
  }, [locale])

  const messages = MESSAGES[locale] || MESSAGES[DEFAULT_LOCALE]

  const t = useMemo(() => {
    const fn = (key, vars = {}) => {
      const str = key.split('.').reduce((acc, k) => (acc && acc[k] != null ? acc[k] : null), messages) || key
      return String(str).replace(/\{(.*?)\}/g, (_, v) => (vars?.[v] != null ? vars[v] : `{${v}}`))
    }
    return fn
  }, [messages])

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
