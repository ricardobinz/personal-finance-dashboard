import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useMediaQuery } from '../../lib/useMediaQuery.js'
import { useI18n } from '../../i18n/i18n.jsx'

export default function WealthProjectionChart({ scenarios }) {
  if (!scenarios) return null
  const isSmall = useMediaQuery('(max-width: 639px)')
  const { t, locale } = useI18n()
  const currency = locale === 'pt' ? 'BRL' : 'USD'
  const currencyFmt = new Intl.NumberFormat(locale || undefined, { style: 'currency', currency })
  const formatCurrencyShort = (v) => {
    const abs = Math.abs(v)
    if (abs >= 1_000_000_000) return `${currencyFmt.format(v / 1_000_000_000)}B` // locale currency then suffix
    if (abs >= 1_000_000) return `${currencyFmt.format(v / 1_000_000)}M`
    if (abs >= 1_000) return `${currencyFmt.format(v / 1_000)}k`
    return currencyFmt.format(v)
  }
  const { pessimistic = [], realistic = [], optimistic = [] } = scenarios
  const maxLen = Math.max(pessimistic.length, realistic.length, optimistic.length)
  const data = Array.from({ length: maxLen }).map((_, i) => ({
    year: i,
    pessimistic: pessimistic[i]?.value ?? null,
    realistic: realistic[i]?.value ?? null,
    optimistic: optimistic[i]?.value ?? null,
  }))

  return (
    <div className="w-full h-56 sm:h-80">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} />
          <XAxis dataKey="year" label={isSmall ? undefined : { value: t('charts.common.year') || 'Year', position: 'insideBottomRight', offset: -5 }} />
          <YAxis tickFormatter={(v) => formatCurrencyShort(v)} width={isSmall ? 48 : 64} />
          <Tooltip
            formatter={(value) => (value != null ? currencyFmt.format(value) : '')}
            labelFormatter={(label) => `${t('charts.common.year') || 'Year'} ${label}`}
            contentStyle={{ background: '#111827', color: 'white', border: 'none', borderRadius: 6 }}
            wrapperStyle={{ outline: 'none' }}
          />
          {!isSmall && <Legend />}
          <Line type="monotone" dataKey="pessimistic" name={t('charts.wealth.pessimistic') || 'Pessimistic'} stroke="#ef4444" strokeWidth={2.5} dot={false} activeDot={{ r: 3 }} />
          <Line type="monotone" dataKey="realistic" name={t('charts.wealth.realistic') || 'Realistic'} stroke="#0ea5e9" strokeWidth={2.5} dot={false} activeDot={{ r: 3 }} />
          <Line type="monotone" dataKey="optimistic" name={t('charts.wealth.optimistic') || 'Optimistic'} stroke="#22c55e" strokeWidth={2.5} dot={false} activeDot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
