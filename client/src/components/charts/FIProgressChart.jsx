import React, { useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useMediaQuery } from '../../lib/useMediaQuery.js'
import { useI18n } from '../../i18n/i18n.jsx'
import { capture } from '../../lib/analytics.js'

export default function FIProgressChart({ data }) {
  if (!data) return null
  const isSmall = useMediaQuery('(max-width: 639px)')
  const { t, locale } = useI18n()
  const currency = locale === 'pt' ? 'BRL' : 'USD'
  const currencyFmt = new Intl.NumberFormat(locale || undefined, { style: 'currency', currency })
  const formatCurrencyShort = (v) => {
    const abs = Math.abs(v)
    if (abs >= 1_000_000_000) return `${currencyFmt.format(v / 1_000_000_000)}B`
    if (abs >= 1_000_000) return `${currencyFmt.format(v / 1_000_000)}M`
    if (abs >= 1_000) return `${currencyFmt.format(v / 1_000)}k`
    return currencyFmt.format(v)
  }
  useEffect(() => { capture('view_fi_progress') }, [])
  return (
    <div className="w-full h-56 sm:h-80">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ left: isSmall ? 0 : 10, right: 12, top: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} />
          <XAxis dataKey="year" label={isSmall ? undefined : { value: t('charts.common.year') || 'Year', position: 'insideBottomRight', offset: -5 }} />
          <YAxis tickFormatter={(v) => formatCurrencyShort(v)} width={isSmall ? 64 : 88} />
          <Tooltip
            formatter={(value) => (value != null ? currencyFmt.format(value) : '')}
            labelFormatter={(label) => `${t('charts.common.year') || 'Year'} ${label}`}
            contentStyle={{ background: '#111827', color: 'white', border: 'none', borderRadius: 6 }}
            wrapperStyle={{ outline: 'none' }}
          />
          {!isSmall && <Legend />}
          <Line type="monotone" dataKey="income35" stroke="#8b5cf6" dot={false} strokeWidth={2.5} name={t('charts.fi.withdraw_35') || 'Withdraw rate at 3.5%'} />
          <Line type="monotone" dataKey="income40" stroke="#0ea5e9" dot={false} strokeWidth={2.5} name={t('charts.fi.withdraw_40') || 'Withdraw rate at 4%'} />
          <Line type="monotone" dataKey="income45" stroke="#22c55e" dot={false} strokeWidth={2.5} name={t('charts.fi.withdraw_45') || 'Withdraw rate at 4.5%'} />
          <ReferenceLine y={data?.[0]?.expenses ?? 0} label={t('charts.fi.expenses') || 'Expenses'} stroke="#ef4444" strokeDasharray="4 4" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
