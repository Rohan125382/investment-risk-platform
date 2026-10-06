export function roundToTwo(value: number) {
  return Number(value.toFixed(2));
}

export function calculateCurrentValue(currentPrice: number, quantity: number) {
  return currentPrice * quantity;
}

export function calculateUnrealizedPnL(currentPrice: number, averageCost: number, quantity: number) {
  return (currentPrice - averageCost) * quantity;
}

export function calculatePercentReturn(currentPrice: number, averageCost: number) {
  if (!averageCost) return 0;
  return ((currentPrice - averageCost) / averageCost) * 100;
}
