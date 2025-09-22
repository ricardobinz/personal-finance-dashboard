import React from 'react'
import { useApp } from '../../context/AppContext.jsx'
import { Button } from '../ui/button.jsx'
import { Tooltip } from '../ui/tooltip.jsx'
import { useI18n } from '../../i18n/i18n.jsx'

export default function AssumptionsForm() {
  const { assumptions, setAssumptions } = useApp()
  const { locale, t } = useI18n()
  const currency = locale === 'pt' ? 'BRL' : 'USD'
  const currencyFmt = new Intl.NumberFormat(locale || undefined, { style: 'currency', currency })
  const currencySymbol = currencyFmt.formatToParts(0).find((p) => p.type === 'currency')?.value || '$'

  const handleChange = (field, value) => {
    setAssumptions((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form className="grid grid-cols-12 gap-3">
      <div className="col-span-3">
        <label className="block text-sm mb-1 flex items-center gap-1">{t('forms.assumptions.pessimistic') || 'Pessimistic %'}
          <Tooltip content={t('forms.assumptions.tooltips.pessimistic') || 'Annual return for pessimistic scenario (%).'}>
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-gray-700 text-[10px]">?</span>
          </Tooltip>
        </label>
        <div className="relative">
          <input type="number" step="0.1" min="0" max="100" className="w-full border rounded-md pr-6 pl-2 py-2 text-right" value={assumptions.pessimistic * 100}
            onChange={(e) => handleChange('pessimistic', Number(e.target.value) / 100)} />
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">%</span>
        </div>
      </div>
      <div className="col-span-3">
        <label className="block text-sm mb-1 flex items-center gap-1">{t('forms.assumptions.realistic') || 'Realistic %'}
          <Tooltip content={t('forms.assumptions.tooltips.realistic') || 'Annual return for realistic scenario (%).'}>
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-gray-700 text-[10px]">?</span>
          </Tooltip>
        </label>
        <div className="relative">
          <input type="number" step="0.1" min="0" max="100" className="w-full border rounded-md pr-6 pl-2 py-2 text-right" value={assumptions.realistic * 100}
            onChange={(e) => handleChange('realistic', Number(e.target.value) / 100)} />
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">%</span>
        </div>
      </div>
      <div className="col-span-3">
        <label className="block text-sm mb-1 flex items-center gap-1">{t('forms.assumptions.optimistic') || 'Optimistic %'}
          <Tooltip content={t('forms.assumptions.tooltips.optimistic') || 'Annual return for optimistic scenario (%).'}>
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-gray-700 text-[10px]">?</span>
          </Tooltip>
        </label>
        <div className="relative">
          <input type="number" step="0.1" min="0" max="100" className="w-full border rounded-md pr-6 pl-2 py-2 text-right" value={assumptions.optimistic * 100}
            onChange={(e) => handleChange('optimistic', Number(e.target.value) / 100)} />
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">%</span>
        </div>
      </div>
      <div className="col-span-3">
        <label className="block text-sm mb-1 flex items-center gap-1">{t('forms.assumptions.years') || 'Years'}
          <Tooltip content={t('forms.assumptions.tooltips.years') || 'Projection horizon (years).'}>
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-gray-700 text-[10px]">?</span>
          </Tooltip>
        </label>
        <input type="number" className="w-full border rounded-md px-3 py-2" value={assumptions.years}
          onChange={(e) => handleChange('years', Number(e.target.value))} />
      </div>

      <div className="col-span-4">
        <label className="block text-sm mb-1 flex items-center gap-1">{t('forms.assumptions.contribution_amount') || 'Contribution Amount'}
          <Tooltip content={t('forms.assumptions.tooltips.contribution_amount') || 'Recurring contribution amount.'}>
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-gray-700 text-[10px]">?</span>
          </Tooltip>
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">{currencySymbol}</span>
          <input type="number" step="0.01" className="w-full border rounded-md pl-6 pr-2 py-2 text-right" value={assumptions.contributionAmount}
            onChange={(e) => handleChange('contributionAmount', Number(e.target.value))} />
        </div>
      </div>
      <div className="col-span-4">
        <label className="block text-sm mb-1 flex items-center gap-1">{t('forms.assumptions.frequency') || 'Frequency'}
          <Tooltip content={t('forms.assumptions.tooltips.frequency') || 'How often the contribution is made.'}>
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-gray-700 text-[10px]">?</span>
          </Tooltip>
        </label>
        <select className="w-full border rounded-md px-3 py-2" value={assumptions.contributionFrequency}
          onChange={(e) => handleChange('contributionFrequency', e.target.value)}>
          <option value="monthly">Monthly</option>
          <option value="annual">Annual</option>
        </select>
      </div>
      <div className="col-span-4 self-end">
        <Button type="button" onClick={() => setAssumptions({ ...assumptions })}>{t('actions.save') || 'Save'}</Button>
      </div>
    </form>
  )
}
