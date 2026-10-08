/**
 * Dual Currency Formatter for HeartMatch (USD & PKR)
 * 1 USD ~ 280 PKR
 */

export function formatDualPrice(priceUsd: number): string {
  const pkrRate = 280;
  const pkrAmount = Math.round(priceUsd * pkrRate);
  const usdFormatted = Number.isInteger(priceUsd)
    ? `$${priceUsd}`
    : `$${priceUsd.toFixed(2)}`;
  return `${usdFormatted} (Rs. ${pkrAmount.toLocaleString()} PKR)`;
}

export function getPkrAmount(priceUsd: number): number {
  return Math.round(priceUsd * 280);
}
