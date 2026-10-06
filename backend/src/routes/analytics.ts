import { Request, Response, Router } from 'express';
import { query } from '../db';
import { authenticateToken } from '../middleware/auth';
import { refreshDemoMarketData, getMarketSummary } from '../services/marketDataService';

const router = Router();

router.get('/data', authenticateToken, async (_req: Request, res: Response) => {
  const result = await query('SELECT * FROM assets ORDER BY symbol');
  res.json(result.rows);
});

router.get('/summary', authenticateToken, async (_req: Request, res: Response) => {
  const summary = await getMarketSummary();
  res.json(summary);
});

router.get('/stream', authenticateToken, async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendUpdates = async () => {
    const updated = await refreshDemoMarketData();
    res.write(`data: ${JSON.stringify(updated)}\n\n`);
  };

  sendUpdates();
  const id = setInterval(sendUpdates, 5000);
  req.on('close', () => clearInterval(id));
});

export default router;
