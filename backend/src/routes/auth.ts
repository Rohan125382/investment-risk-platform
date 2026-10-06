type PortfolioSummary = {
  portfolioId: number;
  totalValue: number;
  totalCost: number;
  positions: Array<{ symbol: string; quantity: number; averageCost: number; currentPrice: number; value: number; weight: number; pnl: number }>;
};

function calculateMean(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function calculateStdDev(values: number[]) {
  if (!values.length) return 0;
  const mean = calculateMean(values);
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function computeRiskMetrics(summary: PortfolioSummary) {
  const weights = summary.positions.map((p) => p.weight);
  const volatility = calculateStdDev(weights.length ? weights.map((w) => w * 100) : [0]) / 100;
  const sharpeRatio = (summary.totalValue > 0 ? (summary.totalValue / 100000) - 0.04 : 0) / (volatility || 1);
  const maxDrawdown = Math.min(0.32, Math.max(0.06, volatility * 2.6));
  const var95 = summary.totalValue * (0.015 + volatility * 0.6);
  const diversification = Math.max(15, 100 - (weights.length ? weights.reduce((acc, w) => acc + Math.abs(w - 1 / weights.length), 0) * 80 : 0));
  const concentration = Math.max(0, 100 - diversification);
  const riskScoreRaw = (volatility * 100) * 0.35 + concentration * 0.35 + maxDrawdown * 100 * 0.2 + (var95 / Math.max(summary.totalValue, 1)) * 150;
  const riskScore = Math.min(100, Math.max(0, riskScoreRaw));

  let category = 'Low Risk';
  if (riskScore > 80) category = 'Very High Risk';
  else if (riskScore > 60) category = 'High Risk';
  else if (riskScore > 30) category = 'Moderate Risk';

  const summaryText = `Portfolio risk score is ${riskScore.toFixed(1)} / 100. ${category}. This assessment is educational and does not predict future returns.`;

  return {
    riskScore: Number(riskScore.toFixed(2)),
    volatility: Number(volatility.toFixed(4)),
    sharpeRatio: Number(sharpeRatio.toFixed(4)),
    maxDrawdown: Number(maxDrawdown.toFixed(4)),
    var95: Number(var95.toFixed(2)),
    diversificationScore: Number(diversification.toFixed(2)),
    concentrationRisk: Number(concentration.toFixed(2)),
    category,
    summary: summaryText
  };
}

export function computePortfolioHealth(summary: PortfolioSummary) {
  const largestWeight = summary.positions.reduce((max, item) => Math.max(max, item.weight), 0);
  const topCorrelated = summary.positions.filter((item) => item.weight > 0.2).length;
  const avgReturn = summary.positions.reduce((sum, item) => sum + item.pnl / Math.max(item.value, 1), 0) / Math.max(summary.positions.length, 1);

  const narrative: string[] = [];
  if (largestWeight > 0.45) {
    narrative.push(`Technology and major holdings represent ${Math.round(largestWeight * 100)}% of the portfolio, creating concentration risk.`);
  }
  if (topCorrelated > 2) {
    narrative.push('Several holdings show strong overlap in sector exposure, which may reduce diversification benefit.');
  }
  if (avgReturn > 0.08) {
    narrative.push('The portfolio is currently showing positive market performance, though volatility should still be monitored.');
  } else {
    narrative.push('The portfolio is under pressure relative to recent market changes, so monitoring volatility and allocation is important.');
  }

  return narrative;
}
