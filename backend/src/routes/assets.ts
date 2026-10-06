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

  const portfolio = await query(`SELECT * FROM portfolios WHERE id = $1 AND user_id = $2`, [id, userId]);
  if (!portfolio.rows[0]) {
    return res.status(404).json({ message: 'Portfolio not found.' });
  }

  const assets = await query(
    `SELECT p.*, a.name as asset_name, a.category, a.exchange, a.current_price
     FROM portfolio_assets p
     JOIN assets a ON a.symbol = p.asset_symbol
     WHERE p.portfolio_id = $1`,
    [id]
  );

  const positions = assets.rows.map((row: any) => {
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

  res.json({ portfolio: portfolio.rows[0], positions });
});

router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, virtualCash } = req.body;
  const userId = (req as any).user.id;

  const result = await query(
    `UPDATE portfolios SET name = COALESCE($1, name), description = COALESCE($2, description), virtual_cash = COALESCE($3, virtual_cash), updated_at = NOW() WHERE id = $4 AND user_id = $5 RETURNING *`,
    [name || null, description || null, virtualCash !== undefined ? Number(virtualCash) : null, id, userId]
  );

  if (!result.rows[0]) return res.status(404).json({ message: 'Portfolio not found.' });
  res.json(result.rows[0]);
});

router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.id;

  const result = await query(`DELETE FROM portfolios WHERE id = $1 AND user_id = $2 RETURNING id`, [id, userId]);
  if (!result.rows[0]) return res.status(404).json({ message: 'Portfolio not found.' });
  res.json({ message: 'Portfolio deleted successfully.' });
});

router.post('/:id/transactions', authenticateToken, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { symbol, quantity, price, type, notes } = req.body;
  const userId = (req as any).user.id;

  if (!symbol || !quantity || !price || !type) {
    return res.status(400).json({ message: 'Symbol, quantity, price, and type are required.' });
  }

  const portfolioExists = await query('SELECT id FROM portfolios WHERE id = $1 AND user_id = $2', [id, userId]);
  if (!portfolioExists.rows[0]) return res.status(404).json({ message: 'Portfolio not found.' });

  const asset = await query('SELECT * FROM assets WHERE symbol = $1', [String(symbol).toUpperCase()]);
  if (!asset.rows[0]) return res.status(404).json({ message: 'Asset not found.' });

  const transactionType = String(type).toUpperCase();
  const qty = Number(quantity);
  const tradePrice = Number(price);
  const totalAmount = qty * tradePrice;

  if (transactionType === 'BUY') {
    const existing = await query(
      'SELECT * FROM portfolio_assets WHERE portfolio_id = $1 AND asset_symbol = $2',
      [id, String(symbol).toUpperCase()]
    );

    if (existing.rows[0]) {
      const currentQty = Number(existing.rows[0].quantity);
      const currentAvg = Number(existing.rows[0].average_cost);
      const newQty = currentQty + qty;
      const newAverage = ((currentQty * currentAvg) + (qty * tradePrice)) / newQty;

      await query(
        'UPDATE portfolio_assets SET quantity = $1, average_cost = $2, updated_at = NOW() WHERE portfolio_id = $3 AND asset_symbol = $4',
        [newQty, newAverage, id, String(symbol).toUpperCase()]
      );
    } else {
      await query(
        'INSERT INTO portfolio_assets (portfolio_id, asset_symbol, quantity, average_cost) VALUES ($1, $2, $3, $4)',
        [id, String(symbol).toUpperCase(), qty, tradePrice]
      );
    }
  }

  if (transactionType === 'SELL') {
    const existing = await query(
      'SELECT * FROM portfolio_assets WHERE portfolio_id = $1 AND asset_symbol = $2',
      [id, String(symbol).toUpperCase()]
    );

    if (!existing.rows[0]) return res.status(400).json({ message: 'Asset not held in this portfolio.' });

    const currentQty = Number(existing.rows[0].quantity);
    const remainingQty = currentQty - qty;
    if (remainingQty < 0) return res.status(400).json({ message: 'Cannot sell more than current holding.' });

    if (remainingQty === 0) {
      await query('DELETE FROM portfolio_assets WHERE portfolio_id = $1 AND asset_symbol = $2', [id, String(symbol).toUpperCase()]);
    } else {
      await query(
        'UPDATE portfolio_assets SET quantity = $1, updated_at = NOW() WHERE portfolio_id = $2 AND asset_symbol = $3',
        [remainingQty, id, String(symbol).toUpperCase()]
      );
    }
  }

  const transaction = await query(
    `INSERT INTO transactions (portfolio_id, user_id, asset_symbol, transaction_type, quantity, price, total_amount, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [id, userId, String(symbol).toUpperCase(), transactionType, qty, tradePrice, totalAmount, notes || '']
  );

  res.status(201).json(transaction.rows[0]);
});

export default router;
