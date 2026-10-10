interface TransportSevaRuntimeConfig {
  apiBaseUrl?: string;
  useBackend?: boolean;
  paymentProvider?: 'cashfree' | 'mock';
}

declare global {
  interface Window {
    TRANSPORTSEVA_CONFIG?: TransportSevaRuntimeConfig;
  }
}

const runtimeConfig: TransportSevaRuntimeConfig = typeof window !== 'undefined'
  ? (window.TRANSPORTSEVA_CONFIG ?? {})
  : {};

export const API_CONFIG = {
  baseUrl: runtimeConfig.apiBaseUrl ?? 'http://localhost:8000/api',
  /**
   * Keep the prototype on mock services until an individual vertical slice
   * is explicitly enabled. This prevents a partially integrated screen from
   * silently mixing mock and production data.
   */
  useBackend: runtimeConfig.useBackend ?? false,
  /** Select `mock` only when the Laravel API is running with TS_PAYMENT_PROVIDER=mock. */
  paymentProvider: runtimeConfig.paymentProvider ?? 'cashfree',
} as const;
