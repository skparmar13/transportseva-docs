import { formatCurrencyAmount } from './currency-format';

describe('formatCurrencyAmount', () => {
  it('formats Laravel decimal strings instead of treating them as missing', () => {
    expect(formatCurrencyAmount('45000.00')).toBe('₹45,000');
    expect(formatCurrencyAmount(18500)).toBe('₹18,500');
  });

  it('uses a safe fallback for missing or malformed values', () => {
    expect(formatCurrencyAmount(undefined)).toBe('₹0');
    expect(formatCurrencyAmount('not-a-number')).toBe('₹0');
  });
});
