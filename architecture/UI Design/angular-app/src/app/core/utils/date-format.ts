/** UI date policy: DD/MM/YYYY and DD/MM/YYYY hh:mm AM/PM. */
export function formatDate(value: string | Date | null | undefined): string {
  const date = parseDate(value);
  if (!date) return value ? String(value) : '—';
  const parts = new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).formatToParts(date);
  return `${part(parts, 'day')}/${part(parts, 'month')}/${part(parts, 'year')}`;
}

export function formatDateTime(value: string | Date | null | undefined): string {
  const date = parseDate(value);
  if (!date) return value ? String(value) : '—';
  const parts = new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).formatToParts(date);
  const hour = part(parts, 'hour').padStart(2, '0');
  return `${part(parts, 'day')}/${part(parts, 'month')}/${part(parts, 'year')} ${hour}:${part(parts, 'minute')} ${part(parts, 'dayPeriod').toUpperCase()}`;
}

function parseDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) return new Date(+dateOnly[1], +dateOnly[2] - 1, +dateOnly[3]);
  const sqlDateTime = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?(?:\s*(AM|PM))?$/i.exec(value);
  if (sqlDateTime) {
    let hours = +sqlDateTime[4];
    const period = sqlDateTime[7]?.toUpperCase();
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return new Date(+sqlDateTime[1], +sqlDateTime[2] - 1, +sqlDateTime[3], hours, +sqlDateTime[5], +(sqlDateTime[6] ?? 0));
  }
  const relative = /^(?:about\s+)?(\d+)\s+(minute|hour|day)s?\s+ago$/i.exec(value.trim());
  if (relative) {
    const units = relative[2].toLowerCase();
    const milliseconds = units.startsWith('minute') ? 60_000 : units.startsWith('hour') ? 3_600_000 : 86_400_000;
    return new Date(Date.now() - Number(relative[1]) * milliseconds);
  }
  if (/^just now$/i.test(value.trim())) return new Date();
  if (/^today$/i.test(value.trim())) return new Date();
  if (/^yesterday$/i.test(value.trim())) return new Date(Date.now() - 86_400_000);
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function part(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): string {
  return parts.find((item) => item.type === type)?.value ?? '';
}
