import { Request, Response, Router } from 'express';
import { query } from '../db';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await query(
    'SELECT * FROM alerts WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  res.json(result.rows);
});

router.post('/', authenticateToken, async (req: Request, res: Response) => {
  const { portfolioId, type, title, message, severity } = req.body;
  const userId = (req as any).user.id;

  if (!type || !title || !message) {
    return res.status(400).json({ message: 'Alert type, title, and message are required.' });
  }

  const result = await query(
    `INSERT INTO alerts (user_id, portfolio_id, type, title, message, severity)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [userId, portfolioId || null, type, title, message, severity || 'medium']
  );

  res.status(201).json(result.rows[0]);
});

router.put('/:id/read', authenticateToken, async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.id;

  const result = await query(
    `UPDATE alerts SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING *`,
    [id, userId]
  );

  if (!result.rows[0]) return res.status(404).json({ message: 'Alert not found.' });
  res.json(result.rows[0]);
});

export default router;
