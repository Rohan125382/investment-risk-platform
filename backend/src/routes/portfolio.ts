import { Request, Response, Router } from 'express';
import { query } from '../db';
import { authenticateToken } from '../middleware/auth';
import { calculateCurrentValue, calculatePercentReturn, calculateUnrealizedPnL } from '../utils/portfolio';

const router = Router();

router.get('/', authenticateToken, async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await query(
    `SELECT * FROM portfolios WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  res.json(result.rows);
});

router.post('/', authenticateToken, async (req: Request, res: Response) => {
  const { name, description, virtualCash } = req.body;
  const userId = (req as any).user.id;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ message: 'Portfolio name is required.' });
  }

  const result = await query(
    `INSERT INTO portfolios (user_id, name, description, virtual_cash) VALUES ($1, $2, $3, $4) RETURNING *`,
    [userId, name, description || '', Number(virtualCash || 100000)]
  );

  res.status(201).json(result.rows[0]);
});

router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.id;

  const portfolioResult = await query(
    `SELECT * FROM portfolios WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );

  if (!portfolioResult.rows[0]) {
    return res.status(404).json({ message: 'Portfolio not found.' });
  }

  const assetResult = await query(
    `SELECT p.*, a.name as asset_name, a.category, a.exchange, a.current_price
     FROM portfolio_assets p
     JOIN assets a ON a.symbol = p.asset_symbol
     WHERE p.portfolio_id = $1`,
    [id]
  );

  const positions = assetResult.rows.map((row: any) => {
    const currentValue = calculateCurrentValue(Number(row.current_price), Number(row.quantity));
    const unrealizedPnl = calculateUnrealizedPnL(Number(row.current_price), Number(row.average_cost), Number(row.quantity));
    const returnPercent = calculatePercentReturn(Number(row.current_price), Number(row.average_cost));

    return {
      symbol: row.asset_symbol,
      assetName: row.asset_name,
      category: row.category,
      quantity: Number(row.quantity),
      averageCost: Number(row.average_cost),
      currentPrice: Number(row.current_price),
      currentValue,
      unrealizedPnl,
      returnPercent,
    };
  });

  res.json({
    portfolio: portfolioResult.rows[0],
    positions,
  });
});

router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, virtualCash } = req.body;
  const userId = (req as any).user.id;

  const result = await query(
    `UPDATE portfolios SET name = COALESCE($1, name), description = COALESCE($2, description), virtual_cash = COALESCE($3, virtual_cash), updated_at = NOW() WHERE id = $4 AND user_id = $5 RETURNING *`,
    [name || null, description || null, virtualCash !== undefined ? Number(virtualCash) : null, id, userId]
  );

  if (!result.rows[0]) {
    return res.status(404).json({ message: 'Portfolio not found.' });
  }

  res.json(result.rows[0]);
});

router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.id;

  const result = await query(
    `DELETE FROM portfolios WHERE id = $1 AND user_id = $2 RETURNING id`,
    [id, userId]
  );

  if (!result.rows[0]) {
    return res.status(404).json({ message: 'Portfolio not found.' });
  }

  res.json({ message: 'Portfolio deleted successfully.' });
});

export default router;
