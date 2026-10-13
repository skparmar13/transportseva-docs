import { formatDate, formatDateTime } from './date-format';

describe('date formatting policy', () => {
  it('renders date-only values as DD/MM/YYYY', () => {
    expect(formatDate('2026-10-12')).toBe('12/10/2026');
  });

  it('renders local date-times as DD/MM/YYYY hh:mm AM/PM', () => {
    expect(formatDateTime('2026-10-12 15:41:29')).toBe('12/10/2026 03:41 PM');
    expect(formatDateTime('2026-10-12 00:05:00')).toBe('12/10/2026 12:05 AM');
  });

  it('normalizes relative timestamps instead of leaking relative text into the UI', () => {
    expect(formatDateTime('2 hours ago')).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2} (AM|PM)$/);
  });
});
