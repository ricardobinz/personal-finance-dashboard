import React, { useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext.jsx'
import { Button } from '../ui/button.jsx'
import { Tooltip } from '../ui/tooltip.jsx'
import { calculateAllocation } from '../../utils/finance.js'
import { useI18n } from '../../i18n/i18n.jsx'

export default function AssetsForm() {
  const { assets, addAsset, updateAsset, removeAsset } = useApp()
  const [newAsset, setNewAsset] = useState({ name: '', value: '', targetPercent: '' })
  const [editing, setEditing] = useState({}) // { [id]: { value?: string, targetPercent?: string } }
  const { t, locale } = useI18n()

  const { items, toBuy, total } = useMemo(() => calculateAllocation(assets), [assets])
  const currency = locale === 'pt' ? 'BRL' : 'USD'
  const currencyFmt = useMemo(
    () => new Intl.NumberFormat(locale || undefined, { style: 'currency', currency }),
    [locale, currency]
  )
  const currencyParts = useMemo(() => currencyFmt.formatToParts(0), [currencyFmt])
  const currencySymbol = useMemo(() => currencyParts.find((p) => p.type === 'currency')?.value || '$', [currencyParts])

  const handleAdd = (e) => {
    e.preventDefault()
    if (!newAsset.name || newAsset.value === '') return
    addAsset({
      name: newAsset.name,
      value: Number(newAsset.value) || 0,
      targetPercent: Number(newAsset.targetPercent) || 0,
    })
    setNewAsset({ name: '', value: '', targetPercent: '' })
  }

  const handleChangeAsset = (id, field, value) => {
    let parsed
    if (field === 'name') parsed = value
    else if (field === 'value') parsed = Number(value)
    else parsed = Number(value)
    updateAsset(id, { [field]: parsed })
  }

  const handleRemove = (id) => {
    removeAsset(id)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="grid grid-cols-1 gap-2 items-end sm:flex sm:items-end sm:gap-2">
        <div className="sm:basis-[29%]">
          <label className="block text-sm mb-1">{t('forms.assets.asset_label')}</label>
          <input className="w-full border rounded-md px-3 py-2" value={newAsset.name} onChange={(e) => setNewAsset((s) => ({ ...s, name: e.target.value }))} placeholder={t('forms.assets.asset_placeholder')} />
        </div>
        <div className="sm:basis-[19%]">
          <label className="block text-sm mb-1">{t('forms.assets.value_label')}</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">{currencySymbol}</span>
            <input
              type="number"
              step="0.01"
              className="w-full border rounded-md pl-6 pr-2 py-2 text-right"
              value={newAsset.value}
              onChange={(e) => setNewAsset((s) => ({ ...s, value: e.target.value }))}
              placeholder="0.00"
              aria-label={t('forms.assets.value_label')}
            />
          </div>
        </div>
        <div className="sm:basis-[9%]">
          <label className="block text-sm mb-1">{t('forms.assets.target_label')}</label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              className="w-full border rounded-md pr-6 pl-2 py-2 text-right"
              value={newAsset.targetPercent}
              onChange={(e) => setNewAsset((s) => ({ ...s, targetPercent: e.target.value }))}
              placeholder="0"
              aria-label={t('forms.assets.target_label')}
            />
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">%</span>
          </div>
        </div>
        <div className="sm:basis-[8%]">
          <Button type="submit" className="w-full">{t('forms.assets.add')}</Button>
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm table-fixed">
          <colgroup>
            <col style={{ width: '29%' }} />
            <col style={{ width: '19%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '27%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '8%' }} />
          </colgroup>
          <thead className="relative z-30">
            <tr className="text-left border-b text-xs sm:text-sm">
              <th className="py-2 px-2 whitespace-nowrap">
                <div className="inline-flex items-center gap-1">
                  <span>{t('forms.assets.asset')}</span>
                  <Tooltip content={t('forms.assets.tooltips.asset_name')} side="bottom" align="start">
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-gray-700 text-[10px]">?</span>
                  </Tooltip>
                </div>
              </th>
              <th className="py-2 px-2 whitespace-nowrap">
                <div className="inline-flex items-center gap-1">
                  <span>{t('forms.assets.value')} ({currencySymbol})</span>
                  <Tooltip content={t('forms.assets.tooltips.value')} side="bottom">
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-gray-700 text-[10px]">?</span>
                  </Tooltip>
                </div>
              </th>
              <th className="py-2 px-2 whitespace-nowrap">
                <div className="inline-flex items-center gap-1">
                  <span>{t('forms.assets.target_percent')}</span>
                  <Tooltip content={t('forms.assets.tooltips.target_percent')} side="bottom">
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-gray-700 text-[10px]">?</span>
                  </Tooltip>
                </div>
              </th>
              <th className="py-2 px-2 whitespace-nowrap">
                <div className="inline-flex items-center gap-1">
                  <span>{t('forms.assets.current_percent')}</span>
                  <Tooltip content={t('forms.assets.tooltips.current_percent')} side="bottom">
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-gray-700 text-[10px]">?</span>
                  </Tooltip>
                </div>
              </th>
              <th className="py-2 px-2 whitespace-nowrap">
                <div className="inline-flex items-center gap-1">
                  <span>{t('forms.assets.gap')}</span>
                  <Tooltip content={t('forms.assets.tooltips.gap')} side="bottom" align="end">
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-gray-700 text-[10px]">?</span>
                  </Tooltip>
                </div>
              </th>
              <th className="py-2 px-2 whitespace-nowrap"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id} className="border-b odd:bg-gray-50">
                <td className="py-2 px-2">
                  <input
                    className="w-full border rounded-md px-2 py-1 truncate"
                    value={a.name}
                    onChange={(e) => handleChangeAsset(a.id, 'name', e.target.value)}
                    placeholder={t('forms.assets.asset_placeholder')}
                    title={a.name}
                  />
                </td>
                <td className="py-2 px-2">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">{currencySymbol}</span>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full border rounded-md pl-6 pr-2 py-1 text-right"
                      value={editing[a.id]?.value ?? a.value}
                      onChange={(e) => {
                        const val = e.target.value
                        setEditing((prev) => ({ ...prev, [a.id]: { ...(prev[a.id] || {}), value: val } }))
                        handleChangeAsset(a.id, 'value', val)
                      }}
                      onBlur={() => {
                        setEditing((prev) => {
                          const next = { ...prev }
                          if (next[a.id]) {
                            delete next[a.id].value
                            if (Object.keys(next[a.id]).length === 0) delete next[a.id]
                          }
                          return next
                        })
                      }}
                      aria-label={t('forms.assets.value')}
                    />
                  </div>
                </td>
                <td className="py-2 pr-4 w-[5.5rem]">
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      className="w-full border rounded-md pr-6 pl-2 py-1 text-right"
                      value={editing[a.id]?.targetPercent ?? a.targetPercent}
                      onChange={(e) => {
                        const val = e.target.value
                        setEditing((prev) => ({ ...prev, [a.id]: { ...(prev[a.id] || {}), targetPercent: val } }))
                        handleChangeAsset(a.id, 'targetPercent', val)
                      }}
                      onBlur={() => {
                        setEditing((prev) => {
                          const next = { ...prev }
                          if (next[a.id]) {
                            delete next[a.id].targetPercent
                            if (Object.keys(next[a.id]).length === 0) delete next[a.id]
                          }
                          return next
                        })
                      }}
                      aria-label={t('forms.assets.target_percent')}
                    />
                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                  </div>
                </td>
                <td className="py-2 pr-4">
                  <div className="space-y-1" title={`${t('forms.assets.current_percent')}: ${(a.currentPercent * 100).toFixed(1)}%`}>
                    <div>{(a.currentPercent * 100).toFixed(1)}%</div>
                    <div className="h-4 bg-gray-200 rounded relative" aria-label={t('forms.assets.current_percent')}>
                      <div
                        className="h-4 bg-blue-600 rounded"
                        style={{ width: `${Math.min(100, Math.max(0, a.currentPercent * 100))}%` }}
                      />
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-emerald-600"
                        style={{ left: `${Math.min(100, Math.max(0, a.targetPercent))}%` }}
                        title={t('forms.assets.target_percent')}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-2 pr-4">
                  <span
                    className={`${a.gap > 0 ? 'text-sky-700' : a.gap < 0 ? 'text-rose-600' : 'text-gray-700'} font-medium`}
                    title={t('forms.assets.tooltips.gap')}
                  >
                    {(a.gap * 100).toFixed(1)}%
                  </span>
                </td>
                <td className="py-2 pr-4">
                  <Button variant="outline" size="sm" className="w-8 h-8 p-0" aria-label={t('actions.remove')} title={t('actions.remove')} onClick={() => handleRemove(a.id)}>-</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-gray-600">
        <div>{t('summary.total')}: {currencyFmt.format(total)}</div>
      </div>
    </div>
  )
}
