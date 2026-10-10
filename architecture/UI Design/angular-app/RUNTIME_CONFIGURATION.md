# Runtime configuration

The Angular bundle reads `public/runtime-config.js` before bootstrapping. Configure the API without rebuilding the application:

Local development is currently switched to backend mode with mock payments:

```js
window.TRANSPORTSEVA_CONFIG = {
  apiBaseUrl: 'http://localhost:8000/api',
  useBackend: true,
  paymentProvider: 'mock'
};
```

Use `paymentProvider: 'mock'` only with the Laravel API configured as `TS_PAYMENT_PROVIDER=mock`. For Cashfree sandbox or production, use `cashfree` and keep all credentials on the backend.

The Laravel API should set `CORS_ALLOWED_ORIGINS` to the exact Angular origins used by local, staging, and production deployments.
