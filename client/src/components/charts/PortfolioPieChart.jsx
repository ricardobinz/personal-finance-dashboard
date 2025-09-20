import React from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#e11d48', '#06b6d4']

export default function PortfolioPieChart({ data = [] }) {
  const total = data.reduce((s, d) => s + (d.value || 0), 0)
  const chartData = data.map((d) => ({ ...d, percent: total ? (d.value / total) * 100 : 0 }))

  return (
    <div className="w-full h-72">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            labelLine={false}
            label={(d) => `${d.name} ${d.percent.toFixed(1)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => value.toLocaleString(undefined, { style: 'currency', currency: 'USD' })} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
