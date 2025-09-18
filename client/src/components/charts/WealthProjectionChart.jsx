import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function WealthProjectionChart({ scenarios }) {
  if (!scenarios) return null
  const { pessimistic = [], realistic = [], optimistic = [] } = scenarios
  const maxLen = Math.max(pessimistic.length, realistic.length, optimistic.length)
  const data = Array.from({ length: maxLen }).map((_, i) => ({
    year: i,
    pessimistic: pessimistic[i]?.value ?? null,
    realistic: realistic[i]?.value ?? null,
    optimistic: optimistic[i]?.value ?? null,
  }))

  return (
    <div className="w-full h-80">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" label={{ value: 'Year', position: 'insideBottomRight', offset: -5 }} />
          <YAxis tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
          <Tooltip formatter={(value) => value != null ? value.toLocaleString(undefined, { style: 'currency', currency: 'USD' }) : ''} />
          <Legend />
          <Line type="monotone" dataKey="pessimistic" stroke="#ef4444" dot={false} />
          <Line type="monotone" dataKey="realistic" stroke="#0ea5e9" dot={false} />
          <Line type="monotone" dataKey="optimistic" stroke="#22c55e" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
