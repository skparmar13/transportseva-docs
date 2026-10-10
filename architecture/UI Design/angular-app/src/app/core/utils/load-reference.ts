/** Public load reference; UUIDs remain internal and are never shown to users. */
export function formatLoadReference(load: { load_id?: string; id?: number | string; pickup_city?: string; drop_city?: string; created_at?: string }, fallback?: { pickupCity?: string; dropCity?: string; pickupDate?: string }): string {
  if (load.load_id?.trim()) return `#${load.load_id.replace(/^#/, '')}`;
  const numericId = Number(load.id);
  if (Number.isInteger(numericId) && numericId > 0) return `#LD-${String(numericId).padStart(6, '0')}`;
  const source = cityCode(load.pickup_city ?? fallback?.pickupCity ?? 'LOAD');
  const destination = cityCode(load.drop_city ?? fallback?.dropCity ?? 'REF');
  const date = (load.created_at ?? fallback?.pickupDate ?? '').slice(0, 10).replace(/-/g, '') || '00000000';
  return `#LD-${source}-${destination}-${date}`;
}

function cityCode(city: string): string {
  const letters = city.toUpperCase().replace(/[^A-Z]/g, '');
  return (letters.slice(0, 3) || 'LOC').padEnd(3, 'X');
}
