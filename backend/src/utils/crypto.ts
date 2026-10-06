export type User = {
  id: number;
  fullName: string;
  email: string;
  role: string;
};

export type Asset = {
  symbol: string;
  name: string;
  category: string;
  exchange: string;
  currency: string;
  currentPrice: number;
  dayChange: number;
  percentChange: number;
  volume: number;
};

export type PortfolioAsset = {
  id: number;
  portfolioId: number;
  assetSymbol: string;
  quantity: number;
  averageCost: number;
};

export type AlertSeverity = 'low' | 'medium' | 'high';
