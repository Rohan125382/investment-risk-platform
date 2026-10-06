import { Request, Response } from 'express';
import { query } from '../db';
import { getMarketSnapshots, getMarketSummary, refreshDemoMarketData } from '../services/marketDataService';
import { authenticateToken } from '../middleware/auth';

const router = require('express').Router();

router.get('/health', async (_req: Request, res: Response) => {
  res.json({ status: 'OK', service: 'Aegis backend' });
});

router.get('/assets', authenticateToken, async (_req: Request, res: Response) => {
  const result = await query<any>(`SELECT * FROM assets ORDER BY symbol`);
  res.json(result.rows);
});

router.get('/assets/:symbol', authenticateToken, async (req: Request, res: Response) => {
  const { symbol } = req.params;
  const result = await query<any>(`SELECT * FROM assets WHERE symbol = $1`, [symbol.toUpperCase()]);
  if (!result.rows[0]) return res.status(404).json({ message: 'Asset not found.' });
  res.json(result.rows[0]);
});

router.get('/market-data', authenticateToken, async (_req: Request, res: Response) => {
  res.json(await getMarketSnapshots());
});

router.get('/market-data/:symbol', authenticateToken, async (req: Request, res: Response) => {
  const { symbol } = req.params;
  const result = await query<any>(`SELECT * FROM assets WHERE symbol = $1`, [symbol.toUpperCase()]);
  if (!result.rows[0]) return res.status(404).json({ message: 'Market data not found.' });
  res.json(result.rows[0]);
});

router.get('/market-summary', authenticateToken, async (_req: Request, res: Response) => {
  res.json(await getMarketSummary());
});

router.get('/market-stream', authenticateToken, async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const send = async () => {
    const snapshots = await refreshDemoMarketData();
    res.write(`data: ${JSON.stringify(snapshots)}\n\n`);
  };

  await send();
  const interval = setInterval(send, 5000);
  req.on('close', () => clearInterval(interval));
});

export default router;
