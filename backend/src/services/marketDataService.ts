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

export async function getMarketSnapshots(): Promise<MarketSnapshot[]> {
  const result = await query<any>(`SELECT symbol, name, category, current_price, day_change, percent_change, volume FROM assets ORDER BY symbol`);
  return result.rows.map((row: any) => ({
    symbol: row.symbol,
    name: row.name,
    category: row.category,
    price: Number(row.current_price),
    dayChange: Number(row.day_change),
    percentChange: Number(row.percent_change),
    volume: Number(row.volume),
  }));
}

export async function getMarketSummary() {
  const result = await query<any>(`SELECT symbol, current_price, percent_change FROM assets`);
  const gainers = result.rows.filter((r: any) => Number(r.percent_change) > 0).length;
  const losers = result.rows.filter((r: any) => Number(r.percent_change) < 0).length;

  return {
    marketStatus: 'Stable',
    gainers,
    losers,
    totalTracked: result.rows.length,
    note: 'DEMO MARKET DATA - educational use only'
  };
}

export async function refreshDemoMarketData() {
  const snapshots = await getMarketSnapshots();

  for (const item of snapshots) {
    const drift = (Math.random() - 0.5) * 0.04;
    const nextPrice = Math.max(10, item.price * (1 + drift));
    const nextChange = Number((nextPrice - item.price).toFixed(2));
    const nextPercent = Number(((nextChange / item.price) * 100).toFixed(4));

    await query(`UPDATE assets SET current_price = $1, day_change = $2, percent_change = $3, volume = volume + $4 WHERE symbol = $5;`, [nextPrice, nextChange, nextPercent, Math.floor(Math.random() * 500000), item.symbol]);
    await query(`INSERT INTO market_data (asset_symbol, price, volume, price_change, percent_change) VALUES ($1,$2,$3,$4,$5);`, [item.symbol, nextPrice, Math.floor(Math.random() * 500000), nextChange, nextPercent]);
  }

  return getMarketSnapshots();
}
