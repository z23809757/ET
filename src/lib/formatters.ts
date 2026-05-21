// src/lib/formatters.ts - FIXED VERSION

export const formatUSD = (value: number): string => {
  // Guard against NaN, null, undefined
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
  // Guard against NaN, null, undefined
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

export const toUsdInr = (amount: any, currency: string | undefined, rate: number): { usd: number; inr: number } => {
  // Parse amount safely
  let numAmount = 0;
  if (typeof amount === 'number') {
    numAmount = isNaN(amount) ? 0 : amount;
  } else if (typeof amount === 'string') {
    numAmount = parseFloat(amount) || 0;
  } else {
    numAmount = 0;
  }
  
  // Use fallback rate if rate is invalid
  const safeRate = (rate && !isNaN(rate)) ? rate : 85.4;
  
  if (currency === 'INR') {
    return { usd: numAmount / safeRate, inr: numAmount };
  }
  return { usd: numAmount, inr: numAmount * safeRate };
};

export const formatField = (
  value: any,
  currency: string | undefined,
  displayCurrency: string,
  exchangeRate: number
): string => {
  // Parse value safely
  let numValue = 0;
  if (typeof value === 'number') {
    numValue = isNaN(value) ? 0 : value;
  } else if (typeof value === 'string') {
    numValue = parseFloat(value) || 0;
  } else {
    numValue = 0;
  }
  
  const safeRate = (exchangeRate && !isNaN(exchangeRate)) ? exchangeRate : 85.4;
  
  if (currency === 'INR') {
    if (displayCurrency === 'INR') {
      return formatINR(numValue);
    } else {
      return formatUSD(numValue / safeRate);
    }
  } else {
    if (displayCurrency === 'INR') {
      return formatINR(numValue * safeRate);
    } else {
      return formatUSD(numValue);
    }
  }
};