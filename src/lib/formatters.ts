export const formatUSD = (n: number): string => {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatINR = (n: number): string => {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatField = (raw: any, fieldCur: string, dispCur: string, rate: number): string => {
  const n = parseFloat(raw) || 0;
  if (fieldCur === "INR") {
    return dispCur === "INR" ? formatINR(n) : formatUSD(n / rate);
  }
  return dispCur === "INR" ? formatINR(n * rate) : formatUSD(n);
};

export const toUsdInr = (raw: any, fieldCurrency: string, rate: number): { usd: number; inr: number } => {
  const n = parseFloat(raw) || 0;
  if (fieldCurrency === "INR") return { usd: n / rate, inr: n };
  return { usd: n, inr: n * rate };
};