import React from 'react'
import { useApp } from '../../context/AppContext.jsx'
import { Button } from '../ui/button.jsx'

export default function IncomesForm() {
  const { incomes, setIncomes } = useApp()
  const categories = Array.isArray(incomes?.categories) ? incomes.categories : []

  const handleAdd = () => {
    const next = [...categories, { id: crypto.randomUUID(), name: '', amount: 0 }]
    setIncomes({ categories: next })
  }

  const handleChange = (id, field, value) => {
    const next = categories.map((c) => (c.id === id ? { ...c, [field]: field === 'amount' ? Number(value) : value } : c))
    setIncomes({ categories: next })
  }

  const handleRemove = (id) => {
    const next = categories.filter((c) => c.id !== id)
    setIncomes({ categories: next })
  }

  const total = categories.reduce((sum, c) => sum + (Number(c.amount) || 0), 0)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-medium">Monthly Income</div>
        <Button type="button" onClick={handleAdd}>Add stream</Button>
      </div>

      <div className="space-y-2">
        {categories.length === 0 && (
          <div className="text-sm text-gray-500">No income streams yet. Add your first one.</div>
        )}
        {categories.map((c) => (
          <div key={c.id} className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-6">
              <label className="block text-sm mb-1">Name</label>
              <input className="w-full border rounded-md px-3 py-2" value={c.name} onChange={(e) => handleChange(c.id, 'name', e.target.value)} placeholder="e.g., Salary" />
            </div>
            <div className="col-span-4">
              <label className="block text-sm mb-1">Amount ($/mo)</label>
              <input type="number" className="w-full border rounded-md px-3 py-2" value={c.amount} onChange={(e) => handleChange(c.id, 'amount', e.target.value)} />
            </div>
            <div className="col-span-2">
              <Button type="button" variant="outline" className="w-full" onClick={() => handleRemove(c.id)}>Remove</Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-700">
        <div>Total</div>
        <div>{total.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</div>
      </div>
    </div>
  )
}
