import React, { useMemo } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card.jsx'
import { Button } from '../components/ui/button.jsx'
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
  const { assets, assumptions, expenses, incomes, netWorth, history, snapshotNetWorth, undoLastSnapshot, setAssumptions } = useApp()

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
        <div className="text-sm text-gray-600">Net Worth: {netWorth.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</div>
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
            <CardTitle>FI Progress (4% Rule)</CardTitle>
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

      <footer className="text-xs text-gray-500">MVP • Local storage only • No authentication</footer>
    </div>
  )
}
