export interface Currency {
  code: string;
  symbol: string;
  label: string;
}

export const CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "PKR", symbol: "₨", label: "Pakistani Rupee" },
  { code: "INR", symbol: "₹", label: "Indian Rupee" },
  { code: "AED", symbol: "د.إ", label: "UAE Dirham" },
  { code: "SAR", symbol: "﷼", label: "Saudi Riyal" },
  { code: "CAD", symbol: "C$", label: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", label: "Australian Dollar" },
  { code: "JPY", symbol: "¥", label: "Japanese Yen" },
  { code: "CNY", symbol: "¥", label: "Chinese Yuan" },
];

export const DEFAULT_CURRENCY = "USD";

export function currencySymbol(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? code;
}

export function calculateCost(elapsedMs: number, hourlyRate: number): number {
  if (!hourlyRate || hourlyRate <= 0) return 0;
  return (elapsedMs / 3_600_000) * hourlyRate;
}

export function formatCost(amount: number, code: string): string {
  const symbol = currencySymbol(code);
  const rounded = Math.round(amount * 100) / 100;
  return `${symbol}${rounded.toFixed(2)}`;
}