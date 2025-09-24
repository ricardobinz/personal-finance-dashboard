import React, { useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useMediaQuery } from '../../lib/useMediaQuery.js'
import { useI18n } from '../../i18n/i18n.jsx'
import { capture } from '../../lib/analytics.js'

export default function NetWorthHistoryChart({ history = [] }) {
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
  const data = history.map((h) => ({
    date: new Date(h.date).toLocaleDateString(),
    netWorth: h.netWorth,
  }))
  useEffect(() => { capture('view_net_worth_history') }, [])
  return (
    <div className="w-full h-56 sm:h-72">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ left: isSmall ? 0 : 10, right: 12, top: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={(v) => formatCurrencyShort(v)} width={isSmall ? 64 : 88} />
          <Tooltip
            formatter={(value) => (value != null ? currencyFmt.format(value) : '')}
            contentStyle={{ background: '#111827', color: 'white', border: 'none', borderRadius: 6 }}
            wrapperStyle={{ outline: 'none' }}
          />
          {!isSmall && <Legend />}
          <Line type="monotone" dataKey="netWorth" stroke="#0ea5e9" strokeWidth={2.5} dot={false} activeDot={{ r: 3 }} name={t('charts.net_worth.net_worth') || 'Net Worth'} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
