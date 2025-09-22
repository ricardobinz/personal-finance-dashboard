import React from 'react'
import { useApp } from '../../context/AppContext.jsx'
import { Button } from '../ui/button.jsx'
import { Tooltip } from '../ui/tooltip.jsx'
import { useI18n } from '../../i18n/i18n.jsx'

export default function ExpensesForm() {
  const { expenses, setExpenses } = useApp()
  const { locale, t } = useI18n()
  const currency = locale === 'pt' ? 'BRL' : 'USD'
  const currencyFmt = new Intl.NumberFormat(locale || undefined, { style: 'currency', currency })
  const currencySymbol = currencyFmt.formatToParts(0).find((p) => p.type === 'currency')?.value || '$'
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
        <div className="font-medium flex items-center gap-2">
          <span>Monthly Expenses</span>
          <Tooltip content={t('forms.expenses.help') || 'Track your monthly expense categories.'}>
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-gray-700 text-[10px]">?</span>
          </Tooltip>
        </div>
        <Button type="button" onClick={handleAdd}>{t('forms.expenses.add_category') || 'Add category'}</Button>
      </div>

      <div className="space-y-2">
        {categories.length === 0 && (
          <div className="text-sm text-gray-500">{t('forms.expenses.no_categories') || 'No categories yet. Add your first expense.'}</div>
        )}
        {categories.map((c) => (
          <div key={c.id} className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-6">
              <label className="block text-sm mb-1 flex items-center gap-1">{t('forms.common.name') || 'Name'}
                <Tooltip content={t('forms.expenses.tooltips.name') || 'Category name (e.g., Housing, Food).'}>
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-gray-700 text-[10px]">?</span>
                </Tooltip>
              </label>
              <input className="w-full border rounded-md px-3 py-2" value={c.name} onChange={(e) => handleChange(c.id, 'name', e.target.value)} placeholder="e.g., Housing" />
            </div>
            <div className="col-span-4">
              <label className="block text-sm mb-1 flex items-center gap-1">{t('forms.expenses.amount_label') || 'Amount ($/mo)'}
                <Tooltip content={t('forms.expenses.tooltips.amount') || 'Monthly amount for this category.'}>
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-gray-700 text-[10px]">?</span>
                </Tooltip>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">{currencySymbol}</span>
                <input type="number" step="0.01" className="w-full border rounded-md pl-6 pr-2 py-2 text-right" value={c.amount} onChange={(e) => handleChange(c.id, 'amount', e.target.value)} />
              </div>
            </div>
            <div className="col-span-2">
              <Button type="button" variant="outline" className="w-full" onClick={() => handleRemove(c.id)}>{t('actions.remove') || 'Remove'}</Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-700">
        <div>{t('summary.total') || 'Total'}</div>
        <div>{currencyFmt.format(total)}</div>
      </div>
    </div>
  )
}
