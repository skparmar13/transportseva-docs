/** Formats numeric API values consistently. Laravel decimal casts are often
 * serialized as strings (for example, "45000.00"), so callers must not rely
 * on a JavaScript number type check. */
export function formatCurrencyAmount(value: unknown, fallback = '₹0'): string {
  if (value === null || value === undefined || String(value).trim() === '') return fallback;
  const numeric = typeof value === 'number'
    ? value
    : Number(String(value).replace(/[^0-9.-]/g, ''));
  if (!Number.isFinite(numeric)) return fallback;
  return `₹${numeric.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}
