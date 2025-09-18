import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function NetWorthHistoryChart({ history = [] }) {
  const data = history.map((h) => ({
    date: new Date(h.date).toLocaleDateString(),
    netWorth: h.netWorth,
  }))
  return (
    <div className="w-full h-64">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
          <Tooltip formatter={(value) => (value != null ? value.toLocaleString(undefined, { style: 'currency', currency: 'USD' }) : '')} />
          <Legend />
          <Line type="monotone" dataKey="netWorth" stroke="#0ea5e9" dot={false} name="Net Worth" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
