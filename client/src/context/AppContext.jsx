import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getJSON, setJSON } from '../utils/storage.js'
import { sumAssetsValue } from '../utils/finance.js'

const STORAGE_KEYS = {
  assets: 'pf_assets',
  assumptions: 'pf_assumptions',
  expenses: 'pf_expenses',
  incomes: 'pf_incomes',
  history: 'pf_history',
}

const defaultAssets = []
const defaultAssumptions = {
  pessimistic: 0.03,
  realistic: 0.07,
  optimistic: 0.10,
  contributionAmount: 500,
  contributionFrequency: 'monthly', // 'monthly' | 'annual'
  years: 30,
}
const defaultExpenses = { categories: [] } // [{ id, name, amount }]
const defaultIncomes = { categories: [] } // [{ id, name, amount }]
const defaultHistory = [] // { date: ISO, netWorth }

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [assets, setAssets] = useState(() => getJSON(STORAGE_KEYS.assets, defaultAssets))
  const [assumptions, setAssumptions] = useState(() => getJSON(STORAGE_KEYS.assumptions, defaultAssumptions))
  const [expenses, setExpenses] = useState(() => {
    const storedExpenses = getJSON(STORAGE_KEYS.expenses)
    if (storedExpenses && storedExpenses.monthly) {
      return { categories: [{ id: crypto.randomUUID(), name: 'Monthly', amount: storedExpenses.monthly }] }
    }
    return storedExpenses || defaultExpenses
  })
  const [incomes, setIncomes] = useState(() => getJSON(STORAGE_KEYS.incomes, defaultIncomes))
  const [history, setHistory] = useState(() => getJSON(STORAGE_KEYS.history, defaultHistory))

  // Persist to localStorage
  useEffect(() => setJSON(STORAGE_KEYS.assets, assets), [assets])
  useEffect(() => setJSON(STORAGE_KEYS.assumptions, assumptions), [assumptions])
  useEffect(() => setJSON(STORAGE_KEYS.expenses, expenses), [expenses])
  useEffect(() => setJSON(STORAGE_KEYS.incomes, incomes), [incomes])
  useEffect(() => setJSON(STORAGE_KEYS.history, history), [history])

  const netWorth = useMemo(() => sumAssetsValue(assets), [assets])

  const snapshotNetWorth = () => {
    const now = new Date().toISOString()
    setHistory((prev) => [...prev, { date: now, netWorth }])
  }

  const undoLastSnapshot = () => {
    setHistory((prev) => (prev && prev.length ? prev.slice(0, -1) : prev))
  }

  // Asset actions
  const addAsset = (asset) => {
    setAssets((prev) => [...prev, { id: crypto.randomUUID(), name: '', value: 0, targetPercent: 0, ...asset }])
    // snapshot triggered via effect pattern by caller to avoid double snapshots
  }
  const updateAsset = (id, patch) => {
    setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)))
  }
  const removeAsset = (id) => {
    setAssets((prev) => prev.filter((a) => a.id !== id))
  }

  const value = {
    assets,
    assumptions,
    expenses,
    incomes,
    history,
    netWorth,
    setAssumptions,
    setExpenses,
    setIncomes,
    addAsset,
    updateAsset,
    removeAsset,
    setAssets,
    snapshotNetWorth,
    undoLastSnapshot,
    setHistory,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
