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
import { Tooltip } from '../components/ui/tooltip.jsx'
import { calculateAllocation, projectScenarios, buildFIIncomeSeries, annualizeContribution, totalMonthlyExpenses, calcSavings, yearsToFI } from '../utils/finance.js'
import { useI18n } from '../i18n/i18n.jsx'
import OnboardingTour from '../components/tour/OnboardingTour.jsx'

export default function Dashboard() {
  const { assets, assumptions, expenses, incomes, netWorth, history, snapshotNetWorth, undoLastSnapshot, setAssumptions, exportData, eraseRemoteData } = useApp()
  const { user, signOut, signInWithEmail, signInWithGoogle } = useAuth()
  const { t, locale, setLocale } = useI18n()
  const currency = locale === 'pt' ? 'BRL' : 'USD'
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('inputs') // 'graphs' | 'inputs'
  const [tourTrigger, setTourTrigger] = useState(0)

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

  const annualExpenses = useMemo(() => totalMonthlyExpenses(expenses) * 12, [expenses])

  const fiData = useMemo(() => {
    const realistic = scenarios.realistic || []
    return buildFIIncomeSeries(realistic, [0.035, 0.04, 0.045], annualExpenses)
  }, [scenarios, annualExpenses])

  const pieData = useMemo(() => assets.map((a) => ({ name: a.name || 'Unnamed', value: Number(a.value) || 0 })), [assets])

  const annualContribution = useMemo(() => annualizeContribution(assumptions.contributionAmount, assumptions.contributionFrequency), [assumptions])

  const savings = useMemo(() => calcSavings(incomes, expenses), [incomes, expenses])

  const yearsToFi = useMemo(() => yearsToFI({ projection: scenarios.realistic || [], annualExpenses }), [scenarios, annualExpenses])

  return (
    <div className="container-page space-y-6">
      <header className="flex items-center justify-between">
        <h1 id="tour-app-title" className="text-2xl font-bold">{t('app.title')}</h1>
        {user ? (
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600 hidden sm:block">{user?.email}</div>
            <Button
              variant="outline"
              size="sm"
              aria-label={locale === 'en' ? t('lang.pt') : t('lang.en')}
              title={locale === 'en' ? t('lang.pt') : t('lang.en')}
              onClick={() => setLocale(locale === 'en' ? 'pt' : 'en')}
            >
              {locale?.toUpperCase?.()}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTourTrigger((v) => v + 1)}
              title={t('actions.show_tour')}
            >
              {t('actions.show_tour')}
            </Button>
            <Button variant="outline" onClick={signOut}>{t('actions.sign_out')}</Button>
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
              <div className="hidden sm:block text-sm text-gray-600">{t('auth.sync_sign_in')}</div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.email_placeholder')}
                className="w-48 sm:w-64 rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
              <Button type="submit" disabled={status === 'sending'}>{t('actions.send_link')}</Button>
            </form>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{t('auth.or')}</span>
              <Button variant="secondary" onClick={() => signInWithGoogle()}>{t('actions.continue_google')}</Button>
            </div>
            {status === 'sent' && <div className="text-xs text-green-700">{t('auth.check_email')}</div>}
            {error && <div className="text-xs text-red-600 max-w-[12rem] truncate" title={error}>{error}</div>}
            <Button
              variant="outline"
              size="sm"
              aria-label={locale === 'en' ? t('lang.pt') : t('lang.en')}
              title={locale === 'en' ? t('lang.pt') : t('lang.en')}
              onClick={() => setLocale(locale === 'en' ? 'pt' : 'en')}
            >
              {locale?.toUpperCase?.()}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTourTrigger((v) => v + 1)}
              title={t('actions.show_tour')}
            >
              {t('actions.show_tour')}
            </Button>
          </div>
        )}
      </header>

      {/* Quick Stats */}
      <div id="tour-quick-stats" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent>
            <div className="text-xs text-gray-600">{t('stats.net_worth')}</div>
            <div className="mt-1 text-2xl font-semibold">{netWorth.toLocaleString(undefined, { style: 'currency', currency })}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-xs text-gray-600">{t('stats.annual_contribution')}</div>
            <div className="mt-1 text-2xl font-semibold">{annualContribution.toLocaleString(undefined, { style: 'currency', currency })}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-xs text-gray-600">{t('stats.years_to_fi')}</div>
            <div className="mt-1 text-2xl font-semibold">{yearsToFi != null ? yearsToFi : '—'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-xs text-gray-600">{t('stats.savings_rate')}</div>
            <div className="mt-1 text-2xl font-semibold">{savings.savingsRate != null ? `${(savings.savingsRate * 100).toFixed(1)}%` : '—'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs header */}
      <div id="tour-tabs" className="flex items-center gap-2">
        <Button
          variant={activeTab === 'inputs' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('inputs')}
          aria-pressed={activeTab === 'inputs'}
        >
          {t('tabs.inputs')}
        </Button>
        <Button
          variant={activeTab === 'graphs' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('graphs')}
          aria-pressed={activeTab === 'graphs'}
        >
          {t('tabs.graphs')}
        </Button>
      </div>

      {activeTab === 'graphs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card id="tour-portfolio-allocation">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>{t('cards.portfolio_allocation')}</CardTitle>
                <Tooltip content={t('cards.portfolio_allocation_help') || t('cards.portfolio_allocation')}>
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-gray-700 text-xs">?</span>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className={`mb-3 rounded-md border px-3 py-2 flex items-center gap-2 ${allocation.toBuy ? 'border-blue-200 bg-blue-50 text-blue-900' : 'border-green-200 bg-green-50 text-green-900'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm.75 15h-1.5v-6h1.5Zm0-8h-1.5V7h1.5Z" />
                </svg>
                <div className="font-medium">{t('portfolio.what_to_buy_next')}</div>
                <div className="ml-auto font-semibold">
                  {allocation.toBuy ? `${allocation.toBuy.name} (${(allocation.toBuy.gap * 100).toFixed(1)}% ${t('portfolio.under_target')})` : t('portfolio.on_target')}
                </div>
              </div>
              <PortfolioPieChart data={pieData} />
            </CardContent>
          </Card>

          <Card id="tour-wealth-projection">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>{t('cards.wealth_projection')}</CardTitle>
                <Tooltip content={t('cards.wealth_projection_help') || t('cards.wealth_projection')}>
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-gray-700 text-xs">?</span>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <WealthProjectionChart scenarios={scenarios} />
            </CardContent>
          </Card>

          <Card id="tour-fi-progress">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>{t('cards.fi_progress')}</CardTitle>
                <Tooltip content={t('cards.fi_progress_help') || t('cards.fi_progress')}>
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-gray-700 text-xs">?</span>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <FIProgressChart data={fiData} />
            </CardContent>
          </Card>

          <Card id="tour-net-worth-history">
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle>{t('cards.net_worth_history')}</CardTitle>
                <Tooltip content={t('cards.net_worth_history_help') || t('cards.net_worth_history')}>
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-gray-700 text-xs">?</span>
                </Tooltip>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={undoLastSnapshot}>{t('actions.undo_last')}</Button>
                <Button onClick={snapshotNetWorth}>{t('actions.save_snapshot')}</Button>
              </div>
            </CardHeader>
            <CardContent>
              <NetWorthHistoryChart history={history} />
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'inputs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card id="tour-assets" className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>{t('forms.assets.title')}</CardTitle>
                <Tooltip content={t('forms.assets.help')}>
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-gray-700 text-xs">?</span>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className={`mb-3 rounded-md border px-3 py-2 flex items-center gap-2 ${allocation.toBuy ? 'border-blue-200 bg-blue-50 text-blue-900' : 'border-green-200 bg-green-50 text-green-900'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm.75 15h-1.5v-6h1.5Zm0-8h-1.5V7h1.5Z" />
                </svg>
                <div className="font-medium">{t('portfolio.what_to_buy_next')}</div>
                <div className="ml-auto font-semibold">
                  {allocation.toBuy ? `${allocation.toBuy.name} (${(allocation.toBuy.gap * 100).toFixed(1)}% ${t('portfolio.under_target')})` : t('portfolio.on_target')}
                </div>
              </div>
              <AssetsForm />
            </CardContent>
          </Card>

          <Card id="tour-assumptions" className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>{t('cards.assumptions')}</CardTitle>
                <Tooltip content={t('forms.assumptions.help') || t('cards.assumptions')}>
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-gray-700 text-xs">?</span>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <AssumptionsForm />
            </CardContent>
          </Card>

          <Card id="tour-incomes">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>{t('cards.incomes')}</CardTitle>
                <Tooltip content={t('forms.incomes.help') || t('cards.incomes')}>
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-gray-700 text-xs">?</span>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <IncomesForm />
            </CardContent>
          </Card>

          <Card id="tour-expenses">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>{t('cards.expenses')}</CardTitle>
                <Tooltip content={t('forms.expenses.help') || t('cards.expenses')}>
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-gray-700 text-xs">?</span>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <ExpensesForm />
            </CardContent>
          </Card>

          <Card id="tour-income-savings">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>{t('cards.income_savings')}</CardTitle>
                <Tooltip content={t('cards.income_savings_help') || t('cards.income_savings')}>
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-gray-700 text-xs">?</span>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm grid grid-cols-2 gap-2">
                <div className="text-gray-600">{t('income.monthly_income')}</div>
                <div className="text-right">{savings.monthlyIncome.toLocaleString(undefined, { style: 'currency', currency })}</div>
                <div className="text-gray-600">{t('income.monthly_expenses')}</div>
                <div className="text-right">{savings.monthlyExpenses.toLocaleString(undefined, { style: 'currency', currency })}</div>
                <div className={`text-gray-600`}>{t('income.monthly_savings')}</div>
                <div className={`text-right ${savings.monthlySavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>{savings.monthlySavings.toLocaleString(undefined, { style: 'currency', currency })}</div>
                <div className="text-gray-600">{t('income.savings_rate')}</div>
                <div className="text-right">{savings.savingsRate != null ? `${(savings.savingsRate * 100).toFixed(1)}%` : '—'}</div>
              </div>
              <div className="mt-3">
                <Button
                  disabled={savings.monthlySavings <= 0}
                  onClick={() => setAssumptions((prev) => ({ ...prev, contributionAmount: Math.max(0, Math.round(savings.monthlySavings)), contributionFrequency: 'monthly' }))}
                >
                  {t('actions.set_contribution_to_monthly_savings')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <footer className="text-xs text-gray-500">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Social links */}
          <div className="flex items-center gap-3">
            <a href="https://www.linkedin.com/in/ricardobinz/" target="_blank" rel="noreferrer noopener" aria-label="LinkedIn" className="text-gray-600 hover:text-gray-900">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM0 8h5v16H0V8zm7.5 0h4.8v2.2h.07c.67-1.2 2.3-2.47 4.74-2.47 5.07 0 6 3.34 6 7.7V24h-5v-7.5c0-1.8-.03-4.12-2.5-4.12-2.5 0-2.88 1.95-2.88 3.98V24h-5V8z"/></svg>
            </a>
            <a href="https://ricardobinz.github.io/personal_website/index.html" target="_blank" rel="noreferrer noopener" aria-label="Website" className="text-gray-600 hover:text-gray-900">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm7.93 9h-3.17c-.15-2.33-.98-4.37-2.18-5.9A8.03 8.03 0 0 1 19.93 11zM12 4.07c1.62 1.7 2.7 4.27 2.93 6.93H9.07C9.3 8.34 10.38 5.77 12 4.07zM4.07 13h3.17c.15 2.33.98 4.37 2.18 5.9A8.03 8.03 0 0 1 4.07 13zM8.1 13h7.8c-.25 2.39-1.2 4.66-2.73 6.12-.42.4-.89.74-1.37 1.02-.48-.28-.95-.62-1.37-1.02A9.93 9.93 0 0 1 8.1 13zM14.83 5.1c1.2 1.53 2.03 3.57 2.18 5.9h-3.98c.23-2.66 1.31-5.23 2.93-6.93zM12 19.93c-1.62-1.7-2.7-4.27-2.93-6.93h5.86c-.23 2.66-1.31 5.23-2.93 6.93zM11.24 5.1c-1.2 1.53-2.03 3.57-2.18 5.9H5.09c.23-2.66 1.31-5.23 2.93-6.93 1.48-.97 3.41-.97 4.89 0z"/></svg>
            </a>
            <a href="https://github.com/ricardobinz/" target="_blank" rel="noreferrer noopener" aria-label="GitHub" className="text-gray-600 hover:text-gray-900">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M12 2C6.48 2 2 6.58 2 12.26c0 4.51 2.87 8.32 6.86 9.67.5.09.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.79.62-3.38-1.37-3.38-1.37-.45-1.18-1.11-1.49-1.11-1.49-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.57 2.34 1.12 2.91.86.09-.66.35-1.12.64-1.38-2.23-.26-4.58-1.15-4.58-5.13 0-1.13.39-2.06 1.03-2.79-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.06A9.3 9.3 0 0 1 12 7.07c.85 0 1.71.12 2.51.34 1.9-1.34 2.74-1.06 2.74-1.06.55 1.41.2 2.46.1 2.72.64.73 1.03 1.66 1.03 2.79 0 3.99-2.36 4.86-4.61 5.12.36.32.69.95.69 1.92 0 1.39-.01 2.51-.01 2.85 0 .27.18.58.69.48 3.98-1.35 6.85-5.16 6.85-9.67C22 6.58 17.52 2 12 2Z" clipRule="evenodd"/></svg>
            </a>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    try {
                      exportData()
                    } catch (e) {
                      alert('Export failed')
                    }
                  }}
                  className="text-gray-600"
                >
                  {t('actions.export_data')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-600 border-gray-200 hover:bg-red-50 hover:text-red-700"
                  onClick={async () => {
                    if (!window.confirm(t('confirm.delete_permanently'))) return
                    try {
                      await eraseRemoteData()
                      alert('Your data has been deleted.')
                    } catch (e) {
                      alert('Delete failed')
                    }
                  }}
                >
                  {t('actions.delete_data')}
                </Button>
              </>
            )}
            <a href="/privacy.html" className="underline text-gray-700">{t('footer.privacy_policy')}</a>
          </div>
        </div>
      </footer>
      <OnboardingTour controls={{ setActiveTab, trigger: tourTrigger }} />
    </div>
  )
}
