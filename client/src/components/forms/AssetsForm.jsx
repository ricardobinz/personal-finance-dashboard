import React, { useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext.jsx'
import { Button } from '../ui/button.jsx'
import { calculateAllocation } from '../../utils/finance.js'

export default function AssetsForm() {
  const { assets, addAsset, updateAsset, removeAsset } = useApp()
  const [newAsset, setNewAsset] = useState({ name: '', value: '', targetPercent: '' })

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
          <label className="block text-sm mb-1">Asset Name</label>
          <input className="w-full border rounded-md px-3 py-2" value={newAsset.name} onChange={(e) => setNewAsset((s) => ({ ...s, name: e.target.value }))} placeholder="e.g., VTI" />
        </div>
        <div className="col-span-4">
          <label className="block text-sm mb-1">Current Value ($)</label>
          <input type="number" className="w-full border rounded-md px-3 py-2" value={newAsset.value} onChange={(e) => setNewAsset((s) => ({ ...s, value: e.target.value }))} />
        </div>
        <div className="col-span-3">
          <label className="block text-sm mb-1">Target %</label>
          <input type="number" className="w-full border rounded-md px-3 py-2" value={newAsset.targetPercent} onChange={(e) => setNewAsset((s) => ({ ...s, targetPercent: e.target.value }))} />
        </div>
        <div className="col-span-1">
          <Button type="submit" className="w-full">Add</Button>
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Value ($)</th>
              <th className="py-2 pr-4">Target %</th>
              <th className="py-2 pr-4">Current %</th>
              <th className="py-2 pr-4">Gap</th>
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
                  <input type="number" className="w-full border rounded-md px-2 py-1" value={a.value} onChange={(e) => handleChangeAsset(a.id, 'value', e.target.value)} />
                </td>
                <td className="py-2 pr-4">
                  <input type="number" className="w-full border rounded-md px-2 py-1" value={a.targetPercent} onChange={(e) => handleChangeAsset(a.id, 'targetPercent', e.target.value)} />
                </td>
                <td className="py-2 pr-4">{(a.currentPercent * 100).toFixed(1)}%</td>
                <td className="py-2 pr-4">{(a.gap * 100).toFixed(1)}%</td>
                <td className="py-2 pr-4">
                  <Button variant="outline" onClick={() => handleRemove(a.id)}>Remove</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-gray-600">
        <div>Total: {total.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</div>
        <div>What to buy next: {toBuy ? `${toBuy.name} (${(toBuy.gap * 100).toFixed(1)}% under target)` : 'On target'}</div>
      </div>
    </div>
  )
}
