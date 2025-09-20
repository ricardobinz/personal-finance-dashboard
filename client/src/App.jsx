import React from 'react'
import { AppProvider } from './context/AppContext.jsx'
import Dashboard from './pages/Dashboard.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { I18nProvider } from './i18n/i18n.jsx'

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <AppProvider>
          <Dashboard />
        </AppProvider>
      </AuthProvider>
    </I18nProvider>
  )
}
