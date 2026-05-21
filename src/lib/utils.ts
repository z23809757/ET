import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// From Claude (with tailwind-merge)
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Your existing formatters (keep these)
export function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatINR(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatField(
  value: number,
  currency: string | undefined,
  displayCurrency: 'USD' | 'INR',
  exchangeRate: number
): string {
  if (currency === 'INR') {
    return formatINR(value);
  }
  const amount = displayCurrency === 'INR' ? value * exchangeRate : value;
  return displayCurrency === 'INR' ? formatINR(amount) : formatUSD(amount);
}