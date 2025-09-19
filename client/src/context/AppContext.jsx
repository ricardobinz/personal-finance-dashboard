import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { getJSON, setJSON } from '../utils/storage.js'
import { sumAssetsValue } from '../utils/finance.js'
import { useAuth } from './AuthContext.jsx'
import { loadUserData, saveUserData } from '../utils/cloudSync.js'

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
  const { user } = useAuth()
  // Unauthenticated by default: start with empty/default state
  const [assets, setAssets] = useState(defaultAssets)
  const [assumptions, setAssumptions] = useState(defaultAssumptions)
  const [expenses, setExpenses] = useState(defaultExpenses)
  const [incomes, setIncomes] = useState(defaultIncomes)
  const [history, setHistory] = useState(defaultHistory)
  const [hydratedFromCloud, setHydratedFromCloud] = useState(false)
  const lastSavedRef = useRef(null)

  // Persist to localStorage ONLY when authenticated (acts as client cache)
  useEffect(() => { if (user) setJSON(STORAGE_KEYS.assets, assets) }, [user, assets])
  useEffect(() => { if (user) setJSON(STORAGE_KEYS.assumptions, assumptions) }, [user, assumptions])
  useEffect(() => { if (user) setJSON(STORAGE_KEYS.expenses, expenses) }, [user, expenses])
  useEffect(() => { if (user) setJSON(STORAGE_KEYS.incomes, incomes) }, [user, incomes])
  useEffect(() => { if (user) setJSON(STORAGE_KEYS.history, history) }, [user, history])

  // On sign-out: clear in-memory state and localStorage
  useEffect(() => {
    if (!user) {
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
          setAssets(cachedAssets ?? defaultAssets)
          setAssumptions(cachedAssumptions ?? defaultAssumptions)
          setExpenses(cachedExpenses ?? defaultExpenses)
          setIncomes(cachedIncomes ?? defaultIncomes)
          setHistory(cachedHistory ?? defaultHistory)
        }

        const remote = await loadUserData(user.id)
        if (canceled) return
        if (remote) {
          setAssets(remote.assets ?? defaultAssets)
          setAssumptions(remote.assumptions ?? defaultAssumptions)
          setExpenses(remote.expenses ?? defaultExpenses)
          setIncomes(remote.incomes ?? defaultIncomes)
          setHistory(remote.history ?? defaultHistory)
        } else {
          // Initialize remote with current local data
          const payload = { assets, assumptions, expenses, incomes, history }
          try {
            await saveUserData(user.id, payload)
            lastSavedRef.current = JSON.stringify(payload)
          } catch (e) {
            console.warn('Failed to initialize remote data', e)
          }
        }
      } catch (e) {
        console.warn('Cloud sync load error', e)
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
        .catch((e) => console.warn('Cloud save error', e))
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
