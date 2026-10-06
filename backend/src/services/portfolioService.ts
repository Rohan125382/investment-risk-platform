import { Request, Response, Router } from 'express';
import { query } from '../db';
import { authenticateToken, authorizeAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticateToken, authorizeAdmin);

router.get('/dashboard', async (_req: Request, res: Response) => {
  const users = await query('SELECT COUNT(*)::int AS count FROM users');
  const portfolios = await query('SELECT COUNT(*)::int AS count FROM portfolios');
  const alerts = await query('SELECT COUNT(*)::int AS count FROM alerts');

  res.json({
    users: Number(users.rows[0].count),
    portfolios: Number(portfolios.rows[0].count),
    alerts: Number(alerts.rows[0].count),
  });
});

export default router;
