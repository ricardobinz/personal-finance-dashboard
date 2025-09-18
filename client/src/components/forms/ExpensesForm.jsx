import React from 'react'
import { useApp } from '../../context/AppContext.jsx'
import { Button } from '../ui/button.jsx'

export default function ExpensesForm() {
  const { expenses, setExpenses } = useApp()
  const categories = Array.isArray(expenses.categories) ? expenses.categories : []

  const handleAdd = () => {
    const next = [...categories, { id: crypto.randomUUID(), name: '', amount: 0 }]
    setExpenses({ categories: next })
  }

  const handleChange = (id, field, value) => {
    const next = categories.map((c) => (c.id === id ? { ...c, [field]: field === 'amount' ? Number(value) : value } : c))
    setExpenses({ categories: next })
  }

  const handleRemove = (id) => {
    const next = categories.filter((c) => c.id !== id)
    setExpenses({ categories: next })
  }

  const total = categories.reduce((sum, c) => sum + (Number(c.amount) || 0), 0)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-medium">Monthly Expenses</div>
        <Button type="button" onClick={handleAdd}>Add category</Button>
      </div>

      <div className="space-y-2">
        {categories.length === 0 && (
          <div className="text-sm text-gray-500">No categories yet. Add your first expense.</div>
        )}
        {categories.map((c) => (
          <div key={c.id} className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-6">
              <label className="block text-sm mb-1">Name</label>
              <input className="w-full border rounded-md px-3 py-2" value={c.name} onChange={(e) => handleChange(c.id, 'name', e.target.value)} placeholder="e.g., Housing" />
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
