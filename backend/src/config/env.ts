import dotenv from 'dotenv';

dotenv.config({ path: ['.env.local', '.env', '../.env'] });

export const env = {
  port: Number(process.env.PORT || 5000),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/investment_intel',
  jwtSecret: process.env.JWT_SECRET || 'aegis-dev-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
  demoMarketData: process.env.DEMO_MARKET_DATA !== 'false',
};
