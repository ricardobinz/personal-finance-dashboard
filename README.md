# Personal Finance Dashboard

A comprehensive React application for tracking personal finances, investment portfolio, and progress towards financial independence. Built with React + Vite, Tailwind CSS, shadcn/ui components, Recharts, and a minimal Express server.

## Features

### Portfolio Tracking
- Track multiple assets with current values and target allocations
- Visual allocation vs target with interactive pie charts
- Smart suggestions for rebalancing (identifies largest allocation gaps)

### Income & Expense Management
- **Income Tracking**: Add and manage multiple income streams
- **Expense Categories**: Categorize expenses (e.g., housing, groceries, entertainment)
- **Savings Analysis**: Automatic calculation of monthly savings and savings rate
- **One-click Setup**: Easily set your monthly savings as your investment contribution

### Financial Independence Planning
- **4% Rule Calculator**: Project safe withdrawal amounts
- **FI Progress**: Visual indicator of progress toward financial independence
- **Multiple Scenarios**: Compare pessimistic/realistic/optimistic return scenarios

### Wealth Projection
- Interactive charts showing net worth growth over time
- Adjustable contribution amounts and frequencies
- Visualize different market return scenarios

### Net Worth Tracking
- Manual snapshot system to track net worth over time
- Historical net worth visualization
- Undo functionality for accidental snapshots

## Tech Stack
- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Data Visualization**: Recharts
- **State Management**: React Context API + Hooks
- **Persistence**: localStorage (client-side only, no backend required)
- **Build Tool**: Vite
- **Deployment**: GitHub Pages (ready to deploy)

## Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ricardobinz/personal-finance-dashboard.git
   cd personal-finance-dashboard
   ```

2. Install dependencies:
   ```bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   ```

3. Start the development server:
   ```bash
   # From the client directory
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
personal-finances/
├── client/                 # Frontend React application
│   ├── public/             # Static files
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── charts/     # Data visualization components
│   │   │   └── forms/      # Form components
│   │   ├── context/        # React context providers
│   │   ├── pages/          # Page components
│   │   └── utils/          # Utility functions
│   └── package.json        # Frontend dependencies
│
├── server/                 # Minimal Express server (optional)
│   ├── index.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## Development

### Available Scripts

In the project directory, you can run:

```bash
# Start both client and server in development mode
npm run dev

# Client runs at: http://localhost:5173
# Server runs at: http://localhost:4000

# Run them independently:

# Start just the client
npm --prefix client run dev

# Start just the server
npm run dev:server
```

## Data Persistence
- This application uses browser `localStorage` for all app data (assets, assumptions, expenses, incomes, and history).
- No authentication or database is required - all data stays in your browser.

## Notes on Calculations
- **Allocation proportion** = `asset_value / total_portfolio`
- **Allocation gap** = `target% - current%`
- **Wealth projection** uses annual compounding with configurable contribution frequencies
- **FI income** = `net_worth × withdrawal_rate` (default 4%, with safety band 3.5%–4.5%)
- **Years to FI** = first year where FI income ≥ annual expenses
- **Savings rate** = `(monthly_income - monthly_expenses) / monthly_income`

## License
MIT
