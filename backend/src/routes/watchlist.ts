import { Request, Response, Router } from 'express';
import { query } from '../db';
import { authenticateToken } from '../middleware/auth';
import { computeRiskMetrics, computePortfolioHealth } from '../services/riskEngine';

const router = Router();

router.get('/:portfolioId', authenticateToken, async (req: Request, res: Response) => {
  const { portfolioId } = req.params;
  const userId = (req as any).user.id;

  const portfolio = await query('SELECT * FROM portfolios WHERE id = $1 AND user_id = $2', [portfolioId, userId]);
  if (!portfolio.rows[0]) return res.status(404).json({ message: 'Portfolio not found.' });

  const positions = await query(
    `SELECT pa.*, a.current_price, a.name as asset_name, a.category
     FROM portfolio_assets pa
     JOIN assets a ON a.symbol = pa.asset_symbol
     WHERE pa.portfolio_id = $1`,
    [portfolioId]
  );

  const totalValue = positions.rows.reduce((acc: number, row: any) => acc + Number(row.current_price) * Number(row.quantity), 0);
  const totalCost = positions.rows.reduce((acc: number, row: any) => acc + Number(row.average_cost) * Number(row.quantity), 0);

  const mapped = positions.rows.map((row: any) => {
    const currentPrice = Number(row.current_price);
    const quantity = Number(row.quantity);
    const value = currentPrice * quantity;
    const weight = totalValue > 0 ? value / totalValue : 0;
    const pnl = (currentPrice - Number(row.average_cost)) * quantity;
    return { symbol: row.asset_symbol, quantity, averageCost: Number(row.average_cost), currentPrice, value, weight, pnl };
  });

  const risk = computeRiskMetrics({ portfolioId: Number(portfolioId), totalValue, totalCost, positions: mapped });
  const narrative = computePortfolioHealth({ portfolioId: Number(portfolioId), totalValue, totalCost, positions: mapped });

  res.json({
    portfolio: portfolio.rows[0],
    totalValue,
    totalCost,
    positions: mapped,
    risk,
    narrative,
  });
});

export default router;
