import React from 'react'
import { useApp } from '../../context/AppContext.jsx'
import { Button } from '../ui/button.jsx'

export default function AssumptionsForm() {
  const { assumptions, setAssumptions } = useApp()

  const handleChange = (field, value) => {
    setAssumptions((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form className="grid grid-cols-12 gap-3">
      <div className="col-span-3">
        <label className="block text-sm mb-1">Pessimistic %</label>
        <input type="number" className="w-full border rounded-md px-3 py-2" value={assumptions.pessimistic * 100}
          onChange={(e) => handleChange('pessimistic', Number(e.target.value) / 100)} />
      </div>
      <div className="col-span-3">
        <label className="block text-sm mb-1">Realistic %</label>
        <input type="number" className="w-full border rounded-md px-3 py-2" value={assumptions.realistic * 100}
          onChange={(e) => handleChange('realistic', Number(e.target.value) / 100)} />
      </div>
      <div className="col-span-3">
        <label className="block text-sm mb-1">Optimistic %</label>
        <input type="number" className="w-full border rounded-md px-3 py-2" value={assumptions.optimistic * 100}
          onChange={(e) => handleChange('optimistic', Number(e.target.value) / 100)} />
      </div>
      <div className="col-span-3">
        <label className="block text-sm mb-1">Years</label>
        <input type="number" className="w-full border rounded-md px-3 py-2" value={assumptions.years}
          onChange={(e) => handleChange('years', Number(e.target.value))} />
      </div>

      <div className="col-span-4">
        <label className="block text-sm mb-1">Contribution Amount</label>
        <input type="number" className="w-full border rounded-md px-3 py-2" value={assumptions.contributionAmount}
          onChange={(e) => handleChange('contributionAmount', Number(e.target.value))} />
      </div>
      <div className="col-span-4">
        <label className="block text-sm mb-1">Frequency</label>
        <select className="w-full border rounded-md px-3 py-2" value={assumptions.contributionFrequency}
          onChange={(e) => handleChange('contributionFrequency', e.target.value)}>
          <option value="monthly">Monthly</option>
          <option value="annual">Annual</option>
        </select>
      </div>
      <div className="col-span-4 self-end">
        <Button type="button" onClick={() => setAssumptions({ ...assumptions })}>Save</Button>
      </div>
    </form>
  )
}
