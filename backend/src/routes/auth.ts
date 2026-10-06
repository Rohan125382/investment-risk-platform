import { Request, Response, Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db';
import { authenticateToken } from '../middleware/auth';
import { hashPassword, signToken, comparePassword } from '../utils/crypto';
import { isValidEmail, isNonEmptyString } from '../utils/validation';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  const { fullName, email, password } = req.body;

  if (!isNonEmptyString(fullName) || !isValidEmail(email) || !isNonEmptyString(password) || password.length < 6) {
    return res.status(400).json({ message: 'Valid full name, email, and password (minimum 6 chars) are required.' });
  }

  const existing = await query('SELECT id FROM users WHERE email = $1', [String(email).trim().toLowerCase()]);
  if (existing.rows.length > 0) {
    return res.status(409).json({ message: 'User already exists with this email.' });
  }

  const hashed = await hashPassword(password);
  const result = await query<{ id: number; email: string; role: string; full_name: string }>(
    `INSERT INTO users (full_name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, full_name, email, role`,
    [String(fullName).trim(), String(email).trim().toLowerCase(), hashed, 'user']
  );

  const user = result.rows[0];
  const portfolioResult = await query(
    `INSERT INTO portfolios (user_id, name, description, virtual_cash) VALUES ($1, $2, $3, $4) RETURNING id`,
    [user.id, 'Primary Portfolio', 'Your demo investment portfolio', 100000]
  );

  await query(`INSERT INTO watchlists (user_id, name) VALUES ($1, $2)`, [user.id, 'My Watchlist']);

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  return res.status(201).json({
    token,
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      portfolioId: portfolioResult.rows[0]?.id,
    },
  });
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!isValidEmail(email) || !isNonEmptyString(password)) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const userQuery = await query<{ id: number; full_name: string; email: string; password_hash: string; role: string }>(
    'SELECT * FROM users WHERE email = $1',
    [String(email).trim().toLowerCase()]
  );

  if (userQuery.rows.length === 0) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const user = userQuery.rows[0];
  const valid = await comparePassword(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  return res.json({
    token,
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
    },
  });
});

router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await query<{ id: number; full_name: string; email: string; role: string }>(
    'SELECT id, full_name, email, role FROM users WHERE id = $1',
    [user.id]
  );

  if (!result.rows[0]) {
    return res.status(404).json({ message: 'User not found.' });
  }

  return res.json({ user: result.rows[0] });
});

export default router;
