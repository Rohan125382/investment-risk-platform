CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS portfolios (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  virtual_cash NUMERIC(12,2) DEFAULT 100000,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assets (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  exchange VARCHAR(100),
  currency VARCHAR(20) DEFAULT 'USD',
  current_price NUMERIC(12,2) DEFAULT 0,
  day_change NUMERIC(12,2) DEFAULT 0,
  percent_change NUMERIC(8,4) DEFAULT 0,
  volume BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS portfolio_assets (
  id SERIAL PRIMARY KEY,
  portfolio_id INTEGER NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  asset_symbol VARCHAR(20) NOT NULL REFERENCES assets(symbol),
  quantity NUMERIC(12,4) NOT NULL DEFAULT 0,
  average_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (portfolio_id, asset_symbol)
);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  portfolio_id INTEGER NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  asset_symbol VARCHAR(20) NOT NULL REFERENCES assets(symbol),
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('BUY', 'SELL')),
  quantity NUMERIC(12,4) NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL,
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS watchlists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) DEFAULT 'Default',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS watchlist_assets (
  id SERIAL PRIMARY KEY,
  watchlist_id INTEGER NOT NULL REFERENCES watchlists(id) ON DELETE CASCADE,
  asset_symbol VARCHAR(20) NOT NULL REFERENCES assets(symbol),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (watchlist_id, asset_symbol)
);

CREATE TABLE IF NOT EXISTS market_data (
  id SERIAL PRIMARY KEY,
  asset_symbol VARCHAR(20) NOT NULL REFERENCES assets(symbol),
  price NUMERIC(12,2) NOT NULL,
  volume BIGINT DEFAULT 0,
  price_change NUMERIC(12,2) DEFAULT 0,
  percent_change NUMERIC(8,4) DEFAULT 0,
  captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  portfolio_id INTEGER REFERENCES portfolios(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'medium',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS risk_metrics (
  id SERIAL PRIMARY KEY,
  portfolio_id INTEGER NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  risk_score NUMERIC(5,2) DEFAULT 0,
  volatility NUMERIC(8,4) DEFAULT 0,
  sharpe_ratio NUMERIC(8,4) DEFAULT 0,
  max_drawdown NUMERIC(8,4) DEFAULT 0,
  var_95 NUMERIC(12,2) DEFAULT 0,
  diversification_score NUMERIC(8,4) DEFAULT 0,
  concentration_risk NUMERIC(8,4) DEFAULT 0,
  summary TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_portfolio_id ON transactions(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_assets_watchlist_id ON watchlist_assets(watchlist_id);
CREATE INDEX IF NOT EXISTS idx_market_data_asset_symbol ON market_data(asset_symbol);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
