import React, { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card.jsx'
import { Button } from '../components/ui/button.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import PortfolioPieChart from '../components/charts/PortfolioPieChart.jsx'
import WealthProjectionChart from '../components/charts/WealthProjectionChart.jsx'
import FIProgressChart from '../components/charts/FIProgressChart.jsx'
import NetWorthHistoryChart from '../components/charts/NetWorthHistoryChart.jsx'
import AssetsForm from '../components/forms/AssetsForm.jsx'
import AssumptionsForm from '../components/forms/AssumptionsForm.jsx'
import ExpensesForm from '../components/forms/ExpensesForm.jsx'
import IncomesForm from '../components/forms/IncomesForm.jsx'
import { calculateAllocation, projectScenarios, buildFIIncomeSeries, annualizeContribution, totalMonthlyExpenses, calcSavings } from '../utils/finance.js'

export default function Dashboard() {
  const { assets, assumptions, expenses, incomes, netWorth, history, snapshotNetWorth, undoLastSnapshot, setAssumptions, exportData, eraseRemoteData } = useApp()
  const { user, signOut, signInWithEmail, signInWithGoogle } = useAuth()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [error, setError] = useState('')

  const allocation = useMemo(() => calculateAllocation(assets), [assets])

  const scenarios = useMemo(() => projectScenarios({
    currentValue: netWorth,
    contributionAmount: assumptions.contributionAmount,
    contributionFrequency: assumptions.contributionFrequency,
    years: assumptions.years,
    pessimistic: assumptions.pessimistic,
    realistic: assumptions.realistic,
    optimistic: assumptions.optimistic,
  }), [netWorth, assumptions])

  const fiData = useMemo(() => {
    const annualExpenses = totalMonthlyExpenses(expenses) * 12
    const realistic = scenarios.realistic || []
    return buildFIIncomeSeries(realistic, [0.035, 0.04, 0.045], annualExpenses)
  }, [scenarios, expenses])

  const pieData = useMemo(() => assets.map((a) => ({ name: a.name || 'Unnamed', value: Number(a.value) || 0 })), [assets])

  const annualContribution = useMemo(() => annualizeContribution(assumptions.contributionAmount, assumptions.contributionFrequency), [assumptions])

  const savings = useMemo(() => calcSavings(incomes, expenses), [incomes, expenses])

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Personal Investment & FI Dashboard</h1>
        {user ? (
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600 hidden sm:block">{user?.email}</div>
            <div className="text-sm text-gray-600">Net Worth: {netWorth.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</div>
            <Button variant="outline" onClick={() => {
              try {
                exportData()
              } catch (e) {
                alert('Export failed')
              }
            }}>Export Data</Button>
            <Button variant="outline" onClick={async () => {
              if (!window.confirm('Delete your cloud data permanently? This action cannot be undone.')) return
              try {
                await eraseRemoteData()
                alert('Your data has been deleted.')
              } catch (e) {
                alert('Delete failed')
              }
            }}>Delete Data</Button>
            <Button variant="outline" onClick={signOut}>Sign out</Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <form
              className="flex items-center gap-2"
              onSubmit={async (e) => {
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
              }}
            >
              <div className="hidden sm:block text-sm text-gray-600">Sync: sign in</div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-48 sm:w-64 rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
              <Button type="submit" disabled={status === 'sending'}>Send link</Button>
            </form>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">or</span>
              <Button onClick={() => signInWithGoogle()}>Continue with Google</Button>
            </div>
            {status === 'sent' && <div className="text-xs text-green-700">Check your email</div>}
            {error && <div className="text-xs text-red-600 max-w-[12rem] truncate" title={error}>{error}</div>}
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <PortfolioPieChart data={pieData} />
            <div className="text-sm text-gray-700">What to buy next: {allocation.toBuy ? `${allocation.toBuy.name} (${(allocation.toBuy.gap * 100).toFixed(1)}% under target)` : 'On target'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wealth Projection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 mb-2">Annual Contribution: {annualContribution.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</div>
            <WealthProjectionChart scenarios={scenarios} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Independence Progress (4% Rule)</CardTitle>
          </CardHeader>
          <CardContent>
            <FIProgressChart data={fiData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Net Worth History</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={undoLastSnapshot}>Undo last</Button>
              <Button onClick={snapshotNetWorth}>Save snapshot</Button>
            </div>
          </CardHeader>
          <CardContent>
            <NetWorthHistoryChart history={history} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <AssetsForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assumptions & Contributions</CardTitle>
          </CardHeader>
          <CardContent>
            <AssumptionsForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpensesForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Income Streams</CardTitle>
          </CardHeader>
          <CardContent>
            <IncomesForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Income & Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm grid grid-cols-2 gap-2">
              <div className="text-gray-600">Monthly Income</div>
              <div className="text-right">{savings.monthlyIncome.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</div>
              <div className="text-gray-600">Monthly Expenses</div>
              <div className="text-right">{savings.monthlyExpenses.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</div>
              <div className="text-gray-600">Monthly Savings</div>
              <div className={`text-right ${savings.monthlySavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>{savings.monthlySavings.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</div>
              <div className="text-gray-600">Savings Rate</div>
              <div className="text-right">{savings.savingsRate != null ? `${(savings.savingsRate * 100).toFixed(1)}%` : '—'}</div>
            </div>
            <div className="mt-3">
              <Button
                disabled={savings.monthlySavings <= 0}
                onClick={() => setAssumptions((prev) => ({ ...prev, contributionAmount: Math.max(0, Math.round(savings.monthlySavings)), contributionFrequency: 'monthly' }))}
              >
                Set contribution to monthly savings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <footer className="text-xs text-gray-500">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>Privacy-focused • Your data is stored in your Supabase account with RLS.</div>
          <a href="/privacy.html" className="underline text-gray-700">Privacy Policy</a>
        </div>
      </footer>
    </div>
  )
}
