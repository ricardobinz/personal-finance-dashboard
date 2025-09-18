export function sumAssetsValue(assets) {
  return assets.reduce((sum, a) => sum + (Number(a.value) || 0), 0)
}

export function calculateAllocation(assets) {
  const total = sumAssetsValue(assets)
  const withMetrics = assets.map((a) => {
    const current = total > 0 ? (a.value || 0) / total : 0
    const target = (a.targetPercent || 0) / 100
    const gap = target - current
    return {
      ...a,
      currentPercent: current,
      gap,
    }
  })
  const toBuy = withMetrics
    .filter((a) => a.gap > 0)
    .sort((a, b) => b.gap - a.gap)[0] || null
  return { total, items: withMetrics, toBuy }
}

export function annualizeContribution(amount, frequency) {
  if (!amount) return 0
  return frequency === 'monthly' ? amount * 12 : amount
}

export function projectWealth(currentValue, annualContribution, years, rate) {
  const data = []
  let value = Number(currentValue) || 0
  data.push({ year: 0, value })
  for (let y = 1; y <= years; y++) {
    value = (value + annualContribution) * (1 + rate)
    data.push({ year: y, value })
  }
  return data
}

export function projectScenarios({
  currentValue,
  contributionAmount,
  contributionFrequency,
  years,
  pessimistic,
  realistic,
  optimistic,
}) {
  const annual = annualizeContribution(contributionAmount, contributionFrequency)
  return {
    pessimistic: projectWealth(currentValue, annual, years, pessimistic),
    realistic: projectWealth(currentValue, annual, years, realistic),
    optimistic: projectWealth(currentValue, annual, years, optimistic),
  }
}

export function fiIncome(netWorth, withdrawalRate = 0.04) {
  return netWorth * withdrawalRate
}

export function yearsToFI({ projection, annualExpenses, withdrawalRate = 0.04 }) {
  for (const p of projection) {
    const income = fiIncome(p.value, withdrawalRate)
    if (income >= annualExpenses) return p.year
  }
  return null
}

export function buildFIIncomeSeries(projection, rates = [0.035, 0.04, 0.045], annualExpenses) {
  return projection.map((p) => ({
    year: p.year,
    income35: fiIncome(p.value, rates[0]),
    income40: fiIncome(p.value, rates[1]),
    income45: fiIncome(p.value, rates[2]),
    expenses: annualExpenses,
  }))
 }

// Expenses helpers
export function totalMonthlyExpenses(expenses) {
  if (!expenses) return 0
  if (Array.isArray(expenses.categories)) {
    return expenses.categories.reduce((sum, c) => sum + (Number(c.amount) || 0), 0)
  }
  // legacy fallback
  return Number(expenses.monthly) || 0
}

export function totalMonthlyIncomes(incomes) {
  if (!incomes) return 0
  if (Array.isArray(incomes.categories)) {
    return incomes.categories.reduce((sum, c) => sum + (Number(c.amount) || 0), 0)
  }
  return Number(incomes.monthly) || 0
}

export function calcSavings(incomes, expenses) {
  const monthlyIncome = totalMonthlyIncomes(incomes)
  const monthlyExpenses = totalMonthlyExpenses(expenses)
  const monthlySavings = monthlyIncome - monthlyExpenses
  const savingsRate = monthlyIncome > 0 ? monthlySavings / monthlyIncome : null
  return { monthlyIncome, monthlyExpenses, monthlySavings, savingsRate }
}
