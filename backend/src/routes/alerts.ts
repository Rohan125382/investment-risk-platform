import { Request, Response, Router } from 'express';
import { query } from '../db';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await query(
    `SELECT w.id, w.name, array_agg(wa.asset_symbol) AS symbols
     FROM watchlists w
     LEFT JOIN watchlist_assets wa ON wa.watchlist_id = w.id
     WHERE w.user_id = $1
     GROUP BY w.id, w.name`,
    [userId]
  );

  res.json(result.rows);
});

router.post('/', authenticateToken, async (req: Request, res: Response) => {
  const { symbol } = req.body;
  const userId = (req as any).user.id;

  if (!symbol) return res.status(400).json({ message: 'Symbol is required.' });

  const watchlist = await query('SELECT id FROM watchlists WHERE user_id = $1 ORDER BY created_at ASC LIMIT 1', [userId]);
  if (!watchlist.rows[0]) return res.status(404).json({ message: 'Watchlist not found.' });

  const exists = await query('SELECT 1 FROM watchlist_assets WHERE watchlist_id = $1 AND asset_symbol = $2', [watchlist.rows[0].id, String(symbol).toUpperCase()]);
  if (exists.rows[0]) return res.status(409).json({ message: 'Asset already in watchlist.' });

  const asset = await query('SELECT symbol FROM assets WHERE symbol = $1', [String(symbol).toUpperCase()]);
  if (!asset.rows[0]) return res.status(404).json({ message: 'Asset not found.' });

  const result = await query(
    'INSERT INTO watchlist_assets (watchlist_id, asset_symbol) VALUES ($1, $2) RETURNING *',
    [watchlist.rows[0].id, String(symbol).toUpperCase()]
  );

  res.status(201).json(result.rows[0]);
});

router.delete('/:symbol', authenticateToken, async (req: Request, res: Response) => {
  const { symbol } = req.params;
  const userId = (req as any).user.id;

  const watchlist = await query('SELECT id FROM watchlists WHERE user_id = $1 ORDER BY created_at ASC LIMIT 1', [userId]);
  if (!watchlist.rows[0]) return res.status(404).json({ message: 'Watchlist not found.' });

  const result = await query(
    'DELETE FROM watchlist_assets WHERE watchlist_id = $1 AND asset_symbol = $2 RETURNING *',
    [watchlist.rows[0].id, String(symbol).toUpperCase()]
  );

  if (!result.rows[0]) return res.status(404).json({ message: 'Asset not in watchlist.' });
  res.json({ message: 'Asset removed from watchlist.' });
});

export default router;
