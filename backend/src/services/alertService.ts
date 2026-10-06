import { query } from '../db';

export async function getPortfolioSummary(userId: number, portfolioId: number) {
  const portfolio = await query('SELECT * FROM portfolios WHERE id = $1 AND user_id = $2', [portfolioId, userId]);
  if (!portfolio.rows[0]) return null;

  const positions = await query(
    `SELECT pa.*, a.current_price, a.name AS asset_name, a.category
     FROM portfolio_assets pa
     JOIN assets a ON a.symbol = pa.asset_symbol
     WHERE pa.portfolio_id = $1`,
    [portfolioId]
  );

  const totalValue = positions.rows.reduce((acc: number, row: any) => acc + Number(row.current_price) * Number(row.quantity), 0);
  const totalCost = positions.rows.reduce((acc: number, row: any) => acc + Number(row.average_cost) * Number(row.quantity), 0);

  return {
    portfolio: portfolio.rows[0],
    totalValue,
    totalCost,
    positions: positions.rows,
  };
}
