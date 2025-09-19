import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card.jsx'
import { Button } from '../components/ui/button.jsx'

export default function Login() {
  const { signInWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    setError('')
    try {
      await signInWithEmail(email)
      setStatus('sent')
    } catch (err) {
      setError(err.message || 'Failed to send magic link')
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in to Personal Finance Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          {status === 'sent' ? (
            <div className="space-y-2 text-sm text-gray-700">
              <p>We've sent a magic login link to:</p>
              <p className="font-medium">{email}</p>
              <p>Open your email and click the link to finish signing in.</p>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="you@example.com"
                />
              </div>
              {error && <div className="text-sm text-red-600">{error}</div>}
              <Button type="submit" disabled={status === 'sending'} className="w-full">
                {status === 'sending' ? 'Sending magic link…' : 'Send magic link'}
              </Button>
              <p className="text-xs text-gray-500">
                You'll receive an email with a link to sign in. No password required.
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
