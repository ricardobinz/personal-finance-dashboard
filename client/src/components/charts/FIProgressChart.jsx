import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useMediaQuery } from '../../lib/useMediaQuery.js'

export default function FIProgressChart({ data }) {
  if (!data) return null
  const isSmall = useMediaQuery('(max-width: 639px)')
  return (
    <div className="w-full h-56 sm:h-80">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
          <Tooltip formatter={(value) => value != null ? value.toLocaleString(undefined, { style: 'currency', currency: 'USD' }) : ''} />
          {!isSmall && <Legend />}
          <Line type="monotone" dataKey="income35" stroke="#8b5cf6" dot={false} name="Withdraw rate at 3.5%" />
          <Line type="monotone" dataKey="income40" stroke="#0ea5e9" dot={false} name="Withdraw rate at 4%" />
          <Line type="monotone" dataKey="income45" stroke="#22c55e" dot={false} name="Withdraw rate at 4.5%" />
          <ReferenceLine y={data?.[0]?.expenses ?? 0} label="Expenses" stroke="#ef4444" strokeDasharray="4 4" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
