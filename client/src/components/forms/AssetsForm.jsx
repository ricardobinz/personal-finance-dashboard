import React, { useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext.jsx'
import { Button } from '../ui/button.jsx'
import { calculateAllocation } from '../../utils/finance.js'
import { useI18n } from '../../i18n/i18n.jsx'

export default function AssetsForm() {
  const { assets, addAsset, updateAsset, removeAsset } = useApp()
  const [newAsset, setNewAsset] = useState({ name: '', value: '', targetPercent: '' })
  const { t } = useI18n()

  const { items, toBuy, total } = useMemo(() => calculateAllocation(assets), [assets])

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
    const parsed = field === 'name' ? value : Number(value)
    updateAsset(id, { [field]: parsed })
  }

  const handleRemove = (id) => {
    removeAsset(id)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="grid grid-cols-12 gap-2 items-end">
        <div className="col-span-4">
          <label className="block text-sm mb-1">{t('forms.assets.asset_label')}</label>
          <input className="w-full border rounded-md px-3 py-2" value={newAsset.name} onChange={(e) => setNewAsset((s) => ({ ...s, name: e.target.value }))} placeholder={t('forms.assets.asset_placeholder')} />
        </div>
        <div className="col-span-4">
          <label className="block text-sm mb-1">{t('forms.assets.value_label')}</label>
          <input type="number" className="w-full border rounded-md px-3 py-2" value={newAsset.value} onChange={(e) => setNewAsset((s) => ({ ...s, value: e.target.value }))} />
        </div>
        <div className="col-span-3">
          <label className="block text-sm mb-1">{t('forms.assets.target_label')}</label>
          <input type="number" className="w-full border rounded-md px-3 py-2" value={newAsset.targetPercent} onChange={(e) => setNewAsset((s) => ({ ...s, targetPercent: e.target.value }))} />
        </div>
        <div className="col-span-1">
          <Button type="submit" className="w-full">{t('forms.assets.add')}</Button>
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">{t('forms.assets.asset')}</th>
              <th className="py-2 pr-4 w-32 sm:w-40">{t('forms.assets.value')} ($)</th>
              <th className="py-2 pr-4">{t('forms.assets.target_percent')}</th>
              <th className="py-2 pr-4">{t('forms.assets.current_percent')}</th>
              <th className="py-2 pr-4">{t('forms.assets.gap')}</th>
              <th className="py-2 pr-4"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id} className="border-b">
                <td className="py-2 pr-4">
                  <input className="w-full border rounded-md px-2 py-1" value={a.name} onChange={(e) => handleChangeAsset(a.id, 'name', e.target.value)} />
                </td>
                <td className="py-2 pr-4">
                  <input type="number" className="w-full min-w-[8rem] border rounded-md px-2 py-1" value={a.value} onChange={(e) => handleChangeAsset(a.id, 'value', e.target.value)} />
                </td>
                <td className="py-2 pr-4">
                  <input type="number" className="w-full border rounded-md px-2 py-1" value={a.targetPercent} onChange={(e) => handleChangeAsset(a.id, 'targetPercent', e.target.value)} />
                </td>
                <td className="py-2 pr-4">{(a.currentPercent * 100).toFixed(1)}%</td>
                <td className="py-2 pr-4">{(a.gap * 100).toFixed(1)}%</td>
                <td className="py-2 pr-4">
                  <Button variant="outline" size="sm" className="w-8 h-8 p-0" aria-label={t('actions.remove')} title={t('actions.remove')} onClick={() => handleRemove(a.id)}>-</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-gray-600">
        <div>{t('summary.total')}: {total.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</div>
        <div>{t('portfolio.what_to_buy_next')}: {toBuy ? `${toBuy.name} (${(toBuy.gap * 100).toFixed(1)}% ${t('portfolio.under_target')})` : t('portfolio.on_target')}</div>
      </div>
    </div>
  )
}
