import React from 'react'
import { AppProvider } from './context/AppContext.jsx'
import Dashboard from './pages/Dashboard.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Dashboard />
      </AppProvider>
    </AuthProvider>
  )
}
