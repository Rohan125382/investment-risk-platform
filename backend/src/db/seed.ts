import { query } from './index';
import bcrypt from 'bcryptjs';

const ASSET_SEED = [
  { symbol: 'AAPL', name: 'Apple Inc.', category: 'Technology', exchange: 'NASDAQ', current_price: 214.36, day_change: 3.28, percent_change: 1.56, volume: 64230000 },
  { symbol: 'MSFT', name: 'Microsoft', category: 'Technology', exchange: 'NASDAQ', current_price: 432.11, day_change: 7.18, percent_change: 1.69, volume: 21640000 },
  { symbol: 'NVDA', name: 'NVIDIA', category: 'Technology', exchange: 'NASDAQ', current_price: 131.72, day_change: 6.11, percent_change: 4.88, volume: 48290000 },
  { symbol: 'AMZN', name: 'Amazon', category: 'Consumer', exchange: 'NASDAQ', current_price: 186.7, day_change: 2.41, percent_change: 1.31, volume: 31200000 },
  { symbol: 'GOOGL', name: 'Alphabet', category: 'Technology', exchange: 'NASDAQ', current_price: 176.3, day_change: 1.74, percent_change: 1.0, volume: 19400000 },
  { symbol: 'TSLA', name: 'Tesla', category: 'Automotive', exchange: 'NASDAQ', current_price: 244.95, day_change: -5.86, percent_change: -2.34, volume: 52000000 },
  { symbol: 'V', name: 'Visa', category: 'Financial', exchange: 'NYSE', current_price: 271.4, day_change: 2.25, percent_change: 0.84, volume: 6680000 },
  { symbol: 'JPM', name: 'JPMorgan Chase', category: 'Financial', exchange: 'NYSE', current_price: 200.22, day_change: 1.24, percent_change: 0.62, volume: 9410000 },
  { symbol: 'XAU', name: 'Gold', category: 'Commodity', exchange: 'COMEX', current_price: 2312.12, day_change: 10.11, percent_change: 0.44, volume: 1200000 },
  { symbol: 'BTC', name: 'Bitcoin', category: 'Crypto', exchange: 'Crypto', current_price: 64230.9, day_change: 2120.28, percent_change: 3.42, volume: 2860000000 },
  { symbol: 'ETH', name: 'Ethereum', category: 'Crypto', exchange: 'Crypto', current_price: 3512.16, day_change: 127.42, percent_change: 3.77, volume: 1430000000 },
  { symbol: 'BND', name: 'Vanguard Total Bond', category: 'Bonds', exchange: 'NASDAQ', current_price: 70.65, day_change: 0.12, percent_change: 0.17, volume: 7200000 },
  { symbol: 'SPY', name: 'SPDR S&P 500', category: 'Index', exchange: 'NYSE', current_price: 544.12, day_change: 5.23, percent_change: 0.97, volume: 18700000 }
];

async function seedAssets() {
  for (const asset of ASSET_SEED) {
    await query(
      `INSERT INTO assets (symbol, name, category, exchange, currency, current_price, day_change, percent_change, volume)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (symbol) DO UPDATE SET
         name = EXCLUDED.name,
         category = EXCLUDED.category,
         exchange = EXCLUDED.exchange,
         currency = EXCLUDED.currency,
         current_price = EXCLUDED.current_price,
         day_change = EXCLUDED.day_change,
         percent_change = EXCLUDED.percent_change,
         volume = EXCLUDED.volume;`,
      [asset.symbol, asset.name, asset.category, asset.exchange, 'USD', asset.current_price, asset.day_change, asset.percent_change, asset.volume]
    );

    await query(
      `INSERT INTO market_data (asset_symbol, price, volume, price_change, percent_change)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT DO NOTHING;`,
      [asset.symbol, asset.current_price, asset.volume, asset.day_change, asset.percent_change]
    );
  }
}

async function seedUser() {
  const passwordHash = await bcrypt.hash('Aegis@123', 10);
  const userResult = await query<{ id: number }>(
    `INSERT INTO users (full_name, email, password_hash, role)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (email) DO NOTHING
     RETURNING id;`,
    ['Aegis Admin', 'admin@aegis.local', passwordHash, 'admin']
  );

  const id = userResult.rows[0]?.id;
  if (!id) {
    const existing = await query<{ id: number }>(`SELECT id FROM users WHERE email = $1`, ['admin@aegis.local']);
    if (existing.rows[0]) {
      return existing.rows[0].id;
    }
    return null;
  }

  const portfolioExists = await query<{ id: number }>(`SELECT id FROM portfolios WHERE user_id = $1 LIMIT 1`, [id]);
  if (!portfolioExists.rows[0]) {
    await query(`INSERT INTO portfolios (user_id, name, description, virtual_cash) VALUES ($1,$2,$3,$4)`, [id, 'Core Growth Portfolio', 'Demo portfolio for educational analysis', 100000]);
  }

  const watchlistExists = await query<{ id: number }>(`SELECT id FROM watchlists WHERE user_id = $1 LIMIT 1`, [id]);
  if (!watchlistExists.rows[0]) {
    const watchlist = await query<{ id: number }>(`INSERT INTO watchlists (user_id, name) VALUES ($1,$2) RETURNING id`, [id, 'Tech Watchlist']);
    const symbols = ['AAPL', 'MSFT', 'NVDA', 'BTC', 'XAU'];
    for (const symbol of symbols) {
      await query(`INSERT INTO watchlist_assets (watchlist_id, asset_symbol) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [watchlist.rows[0].id, symbol]);
    }
  }

  return id;
}

async function main() {
  await seedAssets();
  const userId = await seedUser();
  console.log('Database seeded successfully for Aegis.');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
