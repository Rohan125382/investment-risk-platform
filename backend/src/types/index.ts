import { query } from '../db';

export async function generatePortfolioAlerts(userId: number, portfolioId: number) {
  const positions = await query(
    `SELECT pa.*, a.current_price, a.name, a.category
     FROM portfolio_assets pa
     JOIN assets a ON a.symbol = pa.asset_symbol
     WHERE pa.portfolio_id = $1`,
    [portfolioId]
  );

  for (const row of positions.rows) {
    const currentValue = Number(row.current_price) * Number(row.quantity);
    const weight = currentValue / 100000;

    if (weight > 0.5) {
      await query(
        `INSERT INTO alerts (user_id, portfolio_id, type, title, message, severity)
         VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING`,
        [userId, portfolioId, 'concentration', 'High concentration detected', `${row.name} represents a significant portion of the portfolio.`, 'high']
      );
    }
  }
}
