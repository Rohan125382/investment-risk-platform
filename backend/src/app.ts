import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/error';
import { notFoundHandler } from './middleware/notFound';
import authRoutes from './routes/auth';
import portfolioRoutes from './routes/portfolio';
import assetRoutes from './routes/assets';
import marketRoutes from './routes/market';
import analyticsRoutes from './routes/analytics';
import watchlistRoutes from './routes/watchlist';
import alertRoutes from './routes/alerts';
import adminRoutes from './routes/admin';
import { env } from './config/env';

const app = express();

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Aegis backend', environment: env.nodeEnv });
});

app.use('/api/auth', authRoutes);
app.use('/api/portfolios', portfolioRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
