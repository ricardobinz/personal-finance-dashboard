# Personal Investment & Financial Independence (FI) Dashboard

A clean, minimalistic React application to track portfolio allocation, project wealth under multiple scenarios, estimate FI income using the 4% rule, and visualize net worth history. Built with React + Vite, Tailwind CSS, shadcn-style UI components, Recharts, and a minimal Express server.

## Features (MVP)
- Portfolio Tracker
  - Enter assets with current value and target allocation %
  - See current allocation vs target (pie chart)
  - Suggests which asset to buy next (largest positive gap)
- Wealth Projection (3 scenarios)
  - Inputs: pessimistic/realistic/optimistic return rates
  - Inputs: contribution amount (monthly/annual) and time horizon (years)
  - Line chart showing 3 scenario curves
- Financial Independence Estimator (4% Rule)
  - Calculate FI income (4%) and safety band (3.5%–4.5%)
  - Estimate years to FI (when FI income ≥ expenses)
- Expense Tracking
  - Track monthly expenses
  - Projection: when FI income surpasses expenses
- Net Worth History
  - Save snapshot whenever asset values are updated
  - Show past history and projected future (realistic) on a line chart

## Tech Stack
- Frontend: React (Vite) + Tailwind CSS + shadcn-style components
- Charts: Recharts
- State: React Context + hooks
- Persistence: localStorage (no auth / DB for MVP)
- Server: Minimal Node.js + Express (utility only)

## Project Structure
```
personal-finances/
├─ server/
│  ├─ index.js
│  └─ package.json
├─ client/
│  ├─ index.html
│  ├─ package.json
│  ├─ vite.config.js
│  ├─ postcss.config.js
│  ├─ tailwind.config.js
│  └─ src/
│     ├─ main.jsx
│     ├─ App.jsx
│     ├─ index.css
│     ├─ context/
│     │  └─ AppContext.jsx
│     ├─ utils/
│     │  ├─ finance.js
│     │  └─ storage.js
│     ├─ components/
│     │  ├─ ui/
│     │  │  ├─ card.jsx
│     │  │  └─ button.jsx
│     │  ├─ forms/
│     │  │  ├─ AssetsForm.jsx
│     │  │  ├─ AssumptionsForm.jsx
│     │  │  └─ ExpensesForm.jsx
│     │  └─ charts/
│     │     ├─ PortfolioPieChart.jsx
│     │     ├─ WealthProjectionChart.jsx
│     │     ├─ FIProgressChart.jsx
│     │     └─ NetWorthHistoryChart.jsx
│     └─ pages/
│        └─ Dashboard.jsx
├─ package.json
└─ README.md
```

## Getting Started

Prerequisites:
- Node.js 18+ and npm

Install all dependencies:
```
npm install
npm run install:all
```

Run the app (client + server concurrently):
```
npm run dev
```
- Client runs at: http://localhost:5173
- Server runs at: http://localhost:4000

You can also run them independently:
```
# In root (server via root script)
npm run dev:server

# Client
npm --prefix client run dev
```

## Data Persistence
- This MVP uses browser `localStorage` for all app data (assets, assumptions, expenses, history).
- No authentication or database is used.

## Notes on Calculations
- Allocation proportion = `asset_value / total_portfolio`
- Allocation gap = `target% - current%`
- Wealth projection uses annual compounding and annualized contributions. Monthly contributions are converted to annual by multiplying by 12.
- FI income = `net_worth × withdrawal_rate`. Default 4%, plus safety band 3.5%–4.5%.
- Years to FI = first year where FI income ≥ annual expenses.

## License
MIT
