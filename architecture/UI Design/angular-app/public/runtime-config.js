// Deployment-specific overrides. Keep production secrets out of this file.
// Example:
window.TRANSPORTSEVA_CONFIG = {
  apiBaseUrl: 'http://localhost:8000/api',
  useBackend: true,
  paymentProvider: 'mock',
  ...window.TRANSPORTSEVA_CONFIG,
};
