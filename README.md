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
- **Persistence**: localStorage by default; optional Supabase for authentication + cloud sync
- **Build Tool**: Vite
- **Deployment**: Netlify (recommended) or any static host. Auth/cloud-sync requires Supabase.

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
- By default (signed out), data is kept in-memory only while the page is open.
- When you sign in, a local cache may be written to browser `localStorage` to improve UX.
- When signed in, your data is also synced to your own Supabase project (see Cloud Sync below).

## Cloud Sync & Authentication (Supabase)
Optional: enable sign-in via email magic link and persist your data in the cloud.

1) Create a Supabase project
- Go to https://supabase.com/ and create a free project.
- Open "SQL Editor" and run the SQL in `supabase/schema.sql` to create the `pf_data` table and secure Row Level Security policies.

2) Configure API keys
- In Supabase: Settings → API. Copy the Project URL and the `anon` public key.
- In this repo: copy `client/.env.example` to `client/.env` and set:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

3) Configure Auth redirect
- In Supabase: Authentication → URL Configuration:
  - Set "Site URL" to your local dev URL during development (http://localhost:5173) and to your production domain after deploy (e.g., https://your-site.netlify.app).
  - If you use additional domains, add them to "Additional Redirect URLs".
- Ensure Email auth is enabled (Authentication → Providers → Email).

4) Run locally
```bash
npm --prefix client install
npm --prefix client run dev
```

When signed in, your data will sync to Supabase in the `pf_data` table keyed by your user id. When signed out, the app continues to use localStorage.

### Data Subject Rights (LGPD/GDPR)
- Export (Portability): Use the "Export Data" button in the app header (available when signed in) to download all your data as JSON.
- Deletion (Erasure): Use the "Delete Data" button in the app header to permanently delete your cloud-stored data in Supabase. The local cache is also cleared.
- Correction: Edit any data directly in the UI forms and it will sync to Supabase.
- Access/Confirmation of Processing: Your signed-in dashboard displays your data and you can export it at any time.

See `client/public/privacy.html` for the Privacy Policy. Update contact details and any organization-specific information before production use.

## Deploy to Netlify (recommended)
1) Push this repository to GitHub/GitLab/Bitbucket.

2) In Netlify → New site from Git:
- Base directory: `client`
- Build command: `npm run build`
- Publish directory: `dist`
- Environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

3) Redirects and SPA
- The repo includes `client/public/_redirects` and `netlify.toml` for SPA fallback routing.

4) Update Supabase Auth URLs
- In Supabase Authentication settings, set Site URL to your Netlify domain (and add it to additional redirect URLs if needed) so magic-link emails redirect back to your site.

After deployment, open your site, request a magic link on the login screen, and you’re in.

## Security & Compliance
- Server: Express is configured with `helmet` to send secure default headers and with `x-powered-by` disabled. See `server/index.js`.
- Database: Supabase Row Level Security policies (see `supabase/schema.sql`) ensure users can only read/write their own row.
- Secrets: Only the public `anon` API key is used in the client. Never expose the `service_role` key in client-side code.
- Cookies/Tracking: The app does not include analytics or tracking cookies by default.
- Cross-border data transfer: Supabase stores data in the region you select. Choose a region appropriate for your users and document this in your Privacy Policy.

## Costs
- **Netlify**: Free tier covers static hosting and generous bandwidth; build minutes are limited but sufficient for small projects.
- **Supabase**: Generous free tier suitable for hobby projects. You only use a single JSON row per user, protected via Row Level Security.

## Notes on Calculations
- **Allocation proportion** = `asset_value / total_portfolio`
- **Allocation gap** = `target% - current%`
- **Wealth projection** uses annual compounding with configurable contribution frequencies
- **FI income** = `net_worth × withdrawal_rate` (default 4%, with safety band 3.5%–4.5%)
- **Years to FI** = first year where FI income ≥ annual expenses
- **Savings rate** = `(monthly_income - monthly_expenses) / monthly_income`

## License
MIT
