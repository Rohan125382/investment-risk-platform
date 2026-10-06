import { Request, Response, Router } from 'express';
import { query } from '../db';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, async (_req: Request, res: Response) => {
  const result = await query('SELECT * FROM assets ORDER BY symbol');
  res.json(result.rows);
});

router.get('/:symbol', authenticateToken, async (req: Request, res: Response) => {
  const { symbol } = req.params;
  const result = await query('SELECT * FROM assets WHERE symbol = $1', [String(symbol).toUpperCase()]);

  if (!result.rows[0]) return res.status(404).json({ message: 'Asset not found.' });
  res.json(result.rows[0]);
});

export default router;
