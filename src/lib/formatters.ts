export const formatUSD = (value: number): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '$0';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatINR = (value: number): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '₹0';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Safely parse numbers from:
 * 1000
 * "1000"
 * "1,000"
 * "$1,000"
 * "₹1,00,000"
 */
const parseSafeNumber = (value: any): number => {
  if (value === undefined || value === null) {
    return 0;
  }

  if (typeof value === 'number') {
    return isNaN(value) ? 0 : value;
  }

  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.-]+/g, '');
    const parsed = parseFloat(cleaned);

    return isNaN(parsed) ? 0 : parsed;
  }

  if (typeof value === 'object' && value.value !== undefined) {
    return parseSafeNumber(value.value);
  }

  return 0;
};

/**
 * Convert amount into both USD and INR
 */
export const toUsdInr = (
  amount: any,
  currency: string | undefined,
  rate: number
): { usd: number; inr: number } => {

  const numAmount = parseSafeNumber(amount);

  const safeRate =
    rate && !isNaN(rate) && rate > 0
      ? rate
      : 85.4;

  const normalizedCurrency =
    currency?.trim().toUpperCase() || 'USD';

  // Amount already in INR
  if (normalizedCurrency === 'INR') {
    return {
      usd: numAmount / safeRate,
      inr: numAmount,
    };
  }

  // Default assume USD
  return {
    usd: numAmount,
    inr: numAmount * safeRate,
  };
};

/**
 * Format field according to display currency
 */
export const formatField = (
  value: any,
  currency: string | undefined,
  displayCurrency: string,
  exchangeRate: number
): string => {

  const numValue = parseSafeNumber(value);

  const safeRate =
    exchangeRate && !isNaN(exchangeRate) && exchangeRate > 0
      ? exchangeRate
      : 85.4;

  const normalizedCurrency =
    currency?.trim().toUpperCase() || 'USD';

  const normalizedDisplayCurrency =
    displayCurrency?.trim().toUpperCase() || 'USD';

  // Original value stored in INR
  if (normalizedCurrency === 'INR') {

    // Display INR
    if (normalizedDisplayCurrency === 'INR') {
      return formatINR(numValue);
    }

    // Convert INR -> USD
    return formatUSD(numValue / safeRate);
  }

  // Original value stored in USD

  // Display INR
  if (normalizedDisplayCurrency === 'INR') {
    return formatINR(numValue * safeRate);
  }

  // Display USD
  return formatUSD(numValue);
};