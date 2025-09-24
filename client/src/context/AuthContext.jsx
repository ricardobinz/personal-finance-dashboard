import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { identifyUser, resetIdentity, setSuperProps, capture } from '../lib/analytics.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function init() {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (!mounted) return
        if (error) console.warn('getSession error', error)
        setSession(data?.session || null)
        const user = data?.session?.user
        if (user) {
          identifyUser({ id: user.id, email: user.email })
          setSuperProps({ logged_in: true })
        } else {
          resetIdentity()
          setSuperProps({ logged_in: false })
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    init()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess)
      const user = sess?.user
      if (user) {
        identifyUser({ id: user.id, email: user.email })
        setSuperProps({ logged_in: true })
        capture('auth_state_changed', { state: 'signed_in' })
      } else {
        resetIdentity()
        setSuperProps({ logged_in: false })
        capture('auth_state_changed', { state: 'signed_out' })
      }
    })

    return () => {
      mounted = false
      sub?.subscription?.unsubscribe?.()
    }
  }, [])

  const user = useMemo(() => session?.user || null, [session])

  const signInWithEmail = async (email) => {
    capture('login_magic_link_submitted')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    })
    if (error) {
      capture('login_magic_link_error', { code: error?.code || 'unknown' })
      throw error
    }
    return true
  }

  const signOut = async () => {
    capture('sign_out_clicked')
    const { error } = await supabase.auth.signOut()
    if (error) {
      capture('sign_out_error', { code: error?.code || 'unknown' })
      throw error
    }
    resetIdentity()
    setSuperProps({ logged_in: false })
    capture('sign_out')
  }

  const signInWithGoogle = async () => {
    capture('login_google_clicked')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
    if (error) {
      capture('login_google_error', { code: error?.code || 'unknown' })
      throw error
    }
  }

  const value = { session, user, loading, signInWithEmail, signInWithGoogle, signOut }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
