export const API_CONFIG = {
  baseUrl: 'http://localhost:8000/api',
  /**
   * Keep the prototype on mock services until an individual vertical slice
   * is explicitly enabled. This prevents a partially integrated screen from
   * silently mixing mock and production data.
   */
  useBackend: false,
} as const;
