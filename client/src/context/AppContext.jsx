import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { getJSON, setJSON } from '../utils/storage.js'
import { sumAssetsValue } from '../utils/finance.js'
import { useAuth } from './AuthContext.jsx'
import { loadUserData, saveUserData, deleteUserData } from '../utils/cloudSync.js'
import { capture } from '../lib/analytics.js'

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

// Demo data to show when users are logged out (never persisted)
const demoAssets = [
  { id: 'demo-a1', name: 'Emergency Fund', value: 10000, targetPercent: 10 },
  { id: 'demo-a2', name: 'Stocks', value: 30000, targetPercent: 60 },
  { id: 'demo-a3', name: 'International Stocks', value: 12000, targetPercent: 20 },
  { id: 'demo-a4', name: 'Bonds', value: 8000, targetPercent: 10 },
]
const demoAssumptions = {
  pessimistic: 0.03,
  realistic: 0.07,
  optimistic: 0.10,
  contributionAmount: 800,
  contributionFrequency: 'monthly',
  years: 25,
}
const demoExpenses = {
  categories: [
    { id: 'demo-e1', name: 'Housing', amount: 1500 },
    { id: 'demo-e2', name: 'Food', amount: 600 },
    { id: 'demo-e3', name: 'Transportation', amount: 300 },
    { id: 'demo-e4', name: 'Utilities', amount: 200 },
    { id: 'demo-e5', name: 'Leisure', amount: 250 },
  ],
}
const demoIncomes = {
  categories: [
    { id: 'demo-i1', name: 'Salary', amount: 5200 },
    { id: 'demo-i2', name: 'Side Hustle', amount: 400 },
  ],
}
const demoHistory = [
  { date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(), netWorth: 54000 },
  { date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(), netWorth: 57000 },
  { date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), netWorth: 60000 },
]

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const { user } = useAuth()
  // Show demo data for unauthenticated users; real data loads when authenticated
  const [assets, setAssetsState] = useState(user ? defaultAssets : demoAssets)
  const [assumptions, setAssumptionsState] = useState(user ? defaultAssumptions : demoAssumptions)
  const [expenses, setExpensesState] = useState(user ? defaultExpenses : demoExpenses)
  const [incomes, setIncomesState] = useState(user ? defaultIncomes : demoIncomes)
  const [history, setHistory] = useState(user ? defaultHistory : demoHistory)
  const [hydratedFromCloud, setHydratedFromCloud] = useState(false)
  const lastSavedRef = useRef(null)

  // Persist to localStorage ONLY when authenticated (acts as client cache)
  useEffect(() => { if (user) setJSON(STORAGE_KEYS.assets, assets) }, [user, assets])
  useEffect(() => { if (user) setJSON(STORAGE_KEYS.assumptions, assumptions) }, [user, assumptions])
  useEffect(() => { if (user) setJSON(STORAGE_KEYS.expenses, expenses) }, [user, expenses])
  useEffect(() => { if (user) setJSON(STORAGE_KEYS.incomes, incomes) }, [user, incomes])
  useEffect(() => { if (user) setJSON(STORAGE_KEYS.history, history) }, [user, history])

  // On sign-out: set demo data and clear localStorage
  useEffect(() => {
    if (!user) {
      setAssetsState(demoAssets)
      setAssumptionsState(demoAssumptions)
      setExpensesState(demoExpenses)
      setIncomesState(demoIncomes)
      setHistory(demoHistory)
      try {
        localStorage.removeItem(STORAGE_KEYS.assets)
        localStorage.removeItem(STORAGE_KEYS.assumptions)
        localStorage.removeItem(STORAGE_KEYS.expenses)
        localStorage.removeItem(STORAGE_KEYS.incomes)
        localStorage.removeItem(STORAGE_KEYS.history)
      } catch (e) {}
    }
  }, [user])

  // Hydrate from Supabase on login
  useEffect(() => {
    let canceled = false
    async function run() {
      if (!user) {
        setHydratedFromCloud(false)
        return
      }
      try {
        // Optionally hydrate from local cache while remote loads to reduce UI flicker
        const cachedAssets = getJSON(STORAGE_KEYS.assets, null)
        const cachedAssumptions = getJSON(STORAGE_KEYS.assumptions, null)
        const cachedExpenses = getJSON(STORAGE_KEYS.expenses, null)
        const cachedIncomes = getJSON(STORAGE_KEYS.incomes, null)
        const cachedHistory = getJSON(STORAGE_KEYS.history, null)
        if (
          cachedAssets || cachedAssumptions || cachedExpenses || cachedIncomes || cachedHistory
        ) {
          setAssetsState(cachedAssets ?? defaultAssets)
          setAssumptionsState(cachedAssumptions ?? defaultAssumptions)
          setExpensesState(cachedExpenses ?? defaultExpenses)
          setIncomesState(cachedIncomes ?? defaultIncomes)
          setHistory(cachedHistory ?? defaultHistory)
        }

        const remote = await loadUserData(user.id)
        if (canceled) return
        if (remote) {
          setAssetsState(remote.assets ?? defaultAssets)
          setAssumptionsState(remote.assumptions ?? defaultAssumptions)
          setExpensesState(remote.expenses ?? defaultExpenses)
          setIncomesState(remote.incomes ?? defaultIncomes)
          setHistory(remote.history ?? defaultHistory)
        } else {
          // Initialize remote with current local data
          const payload = { assets, assumptions, expenses, incomes, history }
          try {
            await saveUserData(user.id, payload)
            lastSavedRef.current = JSON.stringify(payload)
          } catch (e) {
            console.warn('Failed to initialize remote data', e)
            capture('cloud_init_save_error')
          }
        }
      } catch (e) {
        console.warn('Cloud sync load error', e)
        capture('cloud_sync_load_error')
      } finally {
        if (!canceled) setHydratedFromCloud(true)
      }
    }
    run()
    return () => {
      canceled = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Debounced save to Supabase when authenticated and hydrated
  useEffect(() => {
    if (!user || !hydratedFromCloud) return
    const payload = { assets, assumptions, expenses, incomes, history }
    const json = JSON.stringify(payload)
    if (lastSavedRef.current === json) return
    const handle = setTimeout(() => {
      saveUserData(user.id, payload)
        .then(() => {
          lastSavedRef.current = json
        })
        .catch((e) => { console.warn('Cloud save error', e); capture('cloud_sync_save_error') })
    }, 600)
    return () => clearTimeout(handle)
  }, [user, hydratedFromCloud, assets, assumptions, expenses, incomes, history])

  const netWorth = useMemo(() => sumAssetsValue(assets), [assets])

  const snapshotNetWorth = () => {
    const now = new Date().toISOString()
    setHistory((prev) => [...prev, { date: now, netWorth }])
  }

  const undoLastSnapshot = () => {
    setHistory((prev) => (prev && prev.length ? prev.slice(0, -1) : prev))
  }

  // LGPD: Data portability
  const exportData = () => {
    const payload = { assets, assumptions, expenses, incomes, history }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'personal-finances-data.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // LGPD: Right to erasure (delete stored cloud data and clear local cache/state)
  const eraseRemoteData = async () => {
    if (!user) return false
    await deleteUserData(user.id)
    // Temporarily disable cloud save to cancel any pending timers and avoid immediate re-save
    setHydratedFromCloud(false)
    // Reset local state and cache
    setAssets(defaultAssets)
    setAssumptions(defaultAssumptions)
    setExpenses(defaultExpenses)
    setIncomes(defaultIncomes)
    setHistory(defaultHistory)
    try {
      localStorage.removeItem(STORAGE_KEYS.assets)
      localStorage.removeItem(STORAGE_KEYS.assumptions)
      localStorage.removeItem(STORAGE_KEYS.expenses)
      localStorage.removeItem(STORAGE_KEYS.incomes)
      localStorage.removeItem(STORAGE_KEYS.history)
    } catch (e) {}
    // Prevent immediate re-save by marking defaults as last saved
    lastSavedRef.current = JSON.stringify({
      assets: defaultAssets,
      assumptions: defaultAssumptions,
      expenses: defaultExpenses,
      incomes: defaultIncomes,
      history: defaultHistory,
    })
    // Re-enable cloud saves now that state and lastSavedRef are aligned with defaults
    setHydratedFromCloud(true)
    return true
  }

  // Asset actions
  const addAsset = (asset) => {
    setAssetsState((prev) => {
      const nextAsset = { id: crypto.randomUUID(), name: '', value: 0, targetPercent: 0, ...asset }
      const next = [...prev, nextAsset]
      capture('asset_added', { total_assets_after: next.length, has_target_percent: Boolean(nextAsset.targetPercent) })
      return next
    })
    // snapshot triggered via effect pattern by caller to avoid double snapshots
  }
  const updateAsset = (id, patch) => {
    setAssetsState((prev) => {
      const before = prev.find((a) => a.id === id) || {}
      const changed_fields = Object.keys(patch).filter((k) => before[k] !== patch[k])
      const next = prev.map((a) => (a.id === id ? { ...a, ...patch } : a))
      if (changed_fields.length) capture('asset_updated', { changed_fields })
      return next
    })
  }
  const removeAsset = (id) => {
    setAssetsState((prev) => {
      const next = prev.filter((a) => a.id !== id)
      capture('asset_removed', { total_assets_after: next.length })
      return next
    })
  }

  // Wrap setters to capture changes (avoid sending raw values)
  const setAssumptions = (updater) => {
    setAssumptionsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      const changed_fields = Object.keys(next).filter((k) => next[k] !== prev[k])
      if (changed_fields.length) capture('assumptions_changed', { changed_fields })
      return next
    })
  }
  const setExpenses = (updater) => {
    setExpensesState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      const prevCount = Array.isArray(prev?.categories) ? prev.categories.length : 0
      const nextCount = Array.isArray(next?.categories) ? next.categories.length : 0
      if (prevCount !== nextCount) capture('expenses_changed', { categories_count: nextCount })
      return next
    })
  }
  const setIncomes = (updater) => {
    setIncomesState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      const prevCount = Array.isArray(prev?.categories) ? prev.categories.length : 0
      const nextCount = Array.isArray(next?.categories) ? next.categories.length : 0
      if (prevCount !== nextCount) capture('incomes_changed', { categories_count: nextCount })
      return next
    })
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
    setAssets: setAssetsState,
    snapshotNetWorth,
    undoLastSnapshot,
    setHistory,
    exportData,
    eraseRemoteData,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
