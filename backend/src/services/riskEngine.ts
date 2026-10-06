import { query } from '../db';

export type MarketSnapshot = {
  symbol: string;
  name: string;
  category: string;
  price: number;
  dayChange: number;
  percentChange: number;
  volume: number;
};

const baseAssets = [
  { symbol: 'AAPL', name: 'Apple Inc.', category: 'Technology', price: 214.36 },
  { symbol: 'MSFT', name: 'Microsoft', category: 'Technology', price: 432.11 },
  { symbol: 'NVDA', name: 'NVIDIA', category: 'Technology', price: 131.72 },
  { symbol: 'AMZN', name: 'Amazon', category: 'Consumer', price: 186.7 },
  { symbol: 'GOOGL', name: 'Alphabet', category: 'Technology', price: 176.3 },
  { symbol: 'TSLA', name: 'Tesla', category: 'Automotive', price: 244.95 },
  { symbol: 'V', name: 'Visa', category: 'Financial', price: 271.4 },
  { symbol: 'JPM', name: 'JPMorgan Chase', category: 'Financial', price: 200.22 },
  { symbol: 'XAU', name: 'Gold', category: 'Commodity', price: 2312.12 },
  { symbol: 'BTC', name: 'Bitcoin', category: 'Crypto', price: 64230.9 },
  { symbol: 'ETH', name: 'Ethereum', category: 'Crypto', price: 3512.16 },
  { symbol: 'BND', name: 'Vanguard Total Bond', category: 'Bonds', price: 70.65 },
  { symbol: 'SPY', name: 'SPDR S&P 500', category: 'Index', price: 544.12 }
];

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export async function getMarketSnapshots() {
  const assets = await query<{ symbol: string; name: string; category: string; current_price: string; percent_change: string; day_change: string; volume: number }>(
    `SELECT symbol, name, category, current_price, percent_change, day_change, volume FROM assets ORDER BY symbol`
  );

  return assets.rows.map((row) => ({
    symbol: row.symbol,
    name: row.name,
    category: row.category,
    price: Number(row.current_price),
    percentChange: Number(row.percent_change),
    dayChange: Number(row.day_change),
    volume: Number(row.volume)
  }));
}

export async function refreshDemoMarketData() {
  const marketSnapshots = await getMarketSnapshots();

  for (const item of marketSnapshots) {
    const drift = randomBetween(-0.018, 0.018);
    const nextPrice = Math.max(5, item.price * (1 + drift));
    const nextChange = Number((nextPrice - item.price).toFixed(2));
    const nextPct = Number(((nextChange / item.price) * 100).toFixed(4));

    await query(
      `UPDATE assets SET current_price = $1, day_change = $2, percent_change = $3, volume = volume + $4 WHERE symbol = $5;`,
      [nextPrice, nextChange, nextPct, Math.floor(randomBetween(1000, 500000)), item.symbol]
    );

    await query(
      `INSERT INTO market_data (asset_symbol, price, volume, price_change, percent_change) VALUES ($1,$2,$3,$4,$5);`,
      [item.symbol, nextPrice, Math.floor(randomBetween(1000, 500000)), nextChange, nextPct]
    );
  }

  return getMarketSnapshots();
}

export async function getMarketSummary() {
  const result = await query<{ symbol: string; current_price: string; percent_change: string }>(`SELECT symbol, current_price, percent_change FROM assets`);
  const gainers = result.rows.filter((r) => Number(r.percent_change) > 0).length;
  const losers = result.rows.filter((r) => Number(r.percent_change) < 0).length;

  return {
    marketStatus: 'Stable',
    gainers,
    losers,
    totalTracked: result.rows.length,
    note: 'DEMO MARKET DATA - educational use only'
  };
}

export function getSeedAssets() {
  return baseAssets;
}

