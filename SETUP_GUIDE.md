# Aegis – Complete Setup Guide

## Prerequisites

Before you start, install these on your computer:

1. **Node.js** (v18 or later)
   - Download: https://nodejs.org/
   - Verify: Open terminal/command prompt and run:
     ```bash
     node --version
     npm --version
     ```

2. **PostgreSQL** (v14 or later)
   - Download: https://www.postgresql.org/download/
   - Verify installation:
     ```bash
     psql --version
     ```

3. **Docker** (optional, but recommended for database)
   - Download: https://www.docker.com/products/docker-desktop/
   - Verify: 
     ```bash
     docker --version
     ```

4. **Git**
   - Download: https://git-scm.com/
   - Verify:
     ```bash
     git --version
     ```

5. **VS Code**
   - Download: https://code.visualstudio.com/

---

## Step 1: Clone the Repository

1. Open terminal/command prompt
2. Navigate to where you want the project:
   ```bash
   cd Desktop
   # or cd Documents, or any folder you prefer
   ```

3. Clone the repository:
   ```bash
   git clone https://github.com/Rohan125382/investment-risk-platform.git
   cd investment-risk-platform
   ```

4. Open in VS Code:
   ```bash
   code .
   ```

---

## Step 2: Set Up Environment Variables

1. In the root folder (investment-risk-platform), create a `.env` file
   - Copy contents from `.env.example`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and verify:
   ```
   POSTGRES_DB=investment_intel
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/investment_intel

   JWT_SECRET=aegis-dev-secret-change-in-production
   JWT_EXPIRES_IN=7d

   PORT=5000
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development

   DEMO_MARKET_DATA=true
   ```

---

## Step 3: Start PostgreSQL Database

### Option A: Using Docker (Recommended)

1. Make sure Docker is running
2. From the root folder, run:
   ```bash
   docker-compose up -d
   ```

3. Verify it's running:
   ```bash
   docker-compose ps
   ```
   You should see the postgres container as "Up"

### Option B: Using Local PostgreSQL Installation

1. Start PostgreSQL service:
   - **Windows**: Services app → PostgreSQL
   - **Mac**: `brew services start postgresql`
   - **Linux**: `sudo systemctl start postgresql`

2. Create the database:
   ```bash
   psql -U postgres -c "CREATE DATABASE investment_intel;"
   ```

---

## Step 4: Install Dependencies

From the root folder, run:

```bash
npm install --workspaces
```

This will install dependencies for both backend and frontend.

---

## Step 5: Set Up Backend

### 5.1 Navigate to backend folder
```bash
cd backend
```

### 5.2 Initialize database schema
```bash
npm run db:seed
```

You should see: `Aegis seed data loaded successfully.`

This creates tables and demo data.

### 5.3 Start backend development server
```bash
npm run dev
```

You should see:
```
Aegis backend running on http://localhost:5000
```

**Leave this running.** Open a new terminal for the next steps.

---

## Step 6: Set Up Frontend

### 6.1 In a new terminal, navigate to frontend folder
```bash
cd frontend
```

### 6.2 Install frontend dependencies
```bash
npm install
```

### 6.3 Start frontend development server
```bash
npm run dev
```

You should see:
```
Vite v4.x.x ready in Nms

➜  Local:   http://localhost:5173/
```

---

## Step 7: Access the Application

1. Open your browser
2. Go to: `http://localhost:5173`
3. You should see the Aegis landing page

---

## Step 8: Login with Demo Credentials

- **Email**: `admin@aegis.local`
- **Password**: `Aegis@123`

After login, you should see:
- Dashboard with portfolio overview
- Portfolio with sample holdings (AAPL, MSFT, NVDA, XAU, BTC)
- Risk metrics and analysis
- Market data and watchlist

---

## Project Folder Structure (What You Have)

```
investment-risk-platform/
├── backend/                          # Node.js + Express backend
│   ├── src/
│   │   ├── app.ts                   # Express app setup
│   │   ├── server.ts                # Server entry point
│   │   ├── config/
│   │   │   └── env.ts               # Environment variables
│   │   ├── db/
│   │   │   ├── index.ts             # Database connection
│   │   │   └── seed.ts              # Database seed/demo data
│   │   ├── middleware/
│   │   │   ├── auth.ts              # JWT authentication
│   │   │   ├── error.ts             # Error handling
│   │   │   ├── notFound.ts          # 404 handler
│   │   │   └── rateLimit.ts         # Rate limiting
│   │   ├── routes/
│   │   │   ├── auth.ts              # Login/register APIs
│   │   │   ├── portfolio.ts         # Portfolio APIs
│   │   │   ├── assets.ts            # Asset APIs
│   │   │   ├── market.ts            # Market data APIs
│   │   │   ├── analytics.ts         # Analytics & risk APIs
│   │   │   ├── watchlist.ts         # Watchlist APIs
│   │   │   ├── alerts.ts            # Alerts APIs
│   │   │   └── admin.ts             # Admin APIs
│   │   ├── services/
│   │   │   ├── marketDataService.ts # Demo market data provider
│   │   │   ├── riskEngine.ts        # Risk calculations
│   │   │   ├── portfolioService.ts  # Portfolio logic
│   │   │   └── alertService.ts      # Alert generation
│   │   ├── utils/
│   │   │   ├── crypto.ts            # Password hashing & JWT
│   │   │   ├── portfolio.ts         # Portfolio calculations
│   │   │   └── validation.ts        # Input validation
│   │   └── types/
│   │       └── index.ts             # TypeScript types
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                         # React + Vite frontend
│   ├── src/
│   │   ├── main.tsx                 # React entry point
│   │   ├── App.tsx                  # Main app component
│   │   ├── api/
│   │   │   └── client.ts            # API client setup
│   │   ├── components/
│   │   │   ├── layout/              # Sidebar, navbar
│   │   │   ├── ui/                  # Buttons, cards, etc.
│   │   │   └── charts/              # Chart components
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── PortfolioPage.tsx
│   │   │   ├── AssetExplorerPage.tsx
│   │   │   ├── RiskAnalysisPage.tsx
│   │   │   ├── AlertsPage.tsx
│   │   │   ├── WatchlistPage.tsx
│   │   │   └── ... (more pages)
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── usePortfolio.ts
│   │   │   └── useMarket.ts
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx
│   │   │   └── MarketContext.tsx
│   │   ├── utils/
│   │   │   ├── format.ts
│   │   │   └── constants.ts
│   │   └── index.css
│   ├── package.json
│   └── vite.config.ts
│
├── .env.example                      # Example env variables
├── .gitignore
├── docker-compose.yml               # Docker database setup
├── package.json                     # Root package.json (workspaces)
├── README.md
└── PROJECT_REPORT.md
```

---

## Running the Application

### Terminal 1: Database (if using Docker)
```bash
docker-compose up -d
```

### Terminal 2: Backend
```bash
cd backend
npm run dev
```

### Terminal 3: Frontend
```bash
cd frontend
npm run dev
```

Then open: `http://localhost:5173`

---

## Common Commands

### Backend
```bash
cd backend
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Run production build
npm run db:seed      # Re-seed database
```

### Frontend
```bash
cd frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Root
```bash
npm install --workspaces   # Install all dependencies
```

---

## API Endpoints (for reference)

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Current user info

### Portfolio
- `GET /api/portfolios` - List all portfolios
- `POST /api/portfolios` - Create portfolio
- `GET /api/portfolios/:id` - Get portfolio details
- `POST /api/portfolios/:id/transactions` - Buy/sell assets

### Assets & Market
- `GET /api/assets` - All assets
- `GET /api/market/data` - Current market data
- `GET /api/market/stream` - Real-time market updates (SSE)

### Analytics & Risk
- `GET /api/analytics/:portfolioId` - Portfolio analysis

### Watchlist & Alerts
- `GET /api/watchlist` - User's watchlist
- `POST /api/watchlist` - Add to watchlist
- `GET /api/alerts` - User's alerts

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### Database Connection Error
1. Make sure PostgreSQL is running
2. Check `.env` file has correct DATABASE_URL
3. Try seeding again: `npm run db:seed`

### CORS Errors
- Make sure backend is running on port 5000
- Make sure frontend is running on port 5173
- Check `.env` CLIENT_URL matches frontend URL

### Dependencies Not Installing
```bash
rm -rf node_modules package-lock.json
npm install --workspaces
```

---

## Database Schema

The app automatically creates these tables on first run:

- **users** - User accounts with hashed passwords
- **portfolios** - Investment portfolios per user
- **portfolio_assets** - Holdings in each portfolio
- **assets** - Master list of all tradeable assets
- **transactions** - Buy/sell history
- **watchlists** - User watchlists
- **watchlist_assets** - Assets in watchlists
- **market_data** - Historical market data
- **alerts** - User alerts
- **risk_metrics** - Portfolio risk calculations

---

## Demo Data

After seeding, you get:

**Sample Portfolio Holdings:**
- 120 shares of AAPL @ $192.50 average
- 80 shares of MSFT @ $410.00 average
- 150 shares of NVDA @ $98.20 average
- 15 oz of XAU (Gold) @ $2225.00 average
- 0.6 BTC @ $55,000 average

**Available Assets for Trading:**
- AAPL, MSFT, NVDA, AMZN, GOOGL, TSLA (Tech)
- V, JPM (Finance)
- XAU (Gold)
- BTC, ETH (Crypto)
- BND, SPY (Bonds/Index)

---

## Next Steps After Setup

1. **Explore the Dashboard**
   - View portfolio value, P/L, and risk metrics
   - See market summary and recent transactions

2. **Test Portfolio Features**
   - Buy/sell assets in simulation
   - View allocation by category
   - Check risk analysis

3. **Try Risk Analysis**
   - View volatility, Sharpe ratio, drawdown
   - See concentration risk
   - Read portfolio health narrative

4. **Create Alerts**
   - Set price movement alerts
   - Portfolio loss thresholds
   - Risk score alerts

5. **Customize**
   - Add your own assets to the database
   - Create multiple portfolios
   - Use watchlists to track assets

---

## Important Notes

⚠️ **This is DEMO/EDUCATIONAL SOFTWARE:**
- All market data is simulated
- No real financial advice is provided
- Do not use for actual investment decisions
- This is a college mini-project for learning purposes

---

## Getting Help

If you encounter issues:

1. Check the terminal output for error messages
2. Verify all prerequisites are installed
3. Make sure ports 5000 and 5173 are not in use
4. Restart the services (stop and run again)
5. Check the .env file for correct configuration

---

## Support

For questions or issues with the Aegis platform, refer to:
- Backend errors: Check backend terminal
- Frontend errors: Check browser console (F12)
- Database issues: Check PostgreSQL is running

---

You're ready to go! Happy investing with Aegis! 🚀
