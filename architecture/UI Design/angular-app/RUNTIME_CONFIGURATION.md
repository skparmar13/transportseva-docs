# Runtime configuration

The Angular bundle reads `public/runtime-config.js` before bootstrapping. Configure the API without rebuilding the application:

Local development is currently switched to backend mode with mock payments:

```js
window.TRANSPORTSEVA_CONFIG = {
  apiBaseUrl: 'http://localhost:8080/api',
  useBackend: true,
  paymentProvider: 'mock'
};
```

Use `paymentProvider: 'mock'` only with the Laravel API configured as `TS_PAYMENT_PROVIDER=mock`. For Cashfree sandbox or production, use `cashfree` and keep all credentials on the backend.

The Laravel API should set `CORS_ALLOWED_ORIGINS` to the exact Angular origins used by local, staging, and production deployments.

## Local Windows API performance

Use the process-scoped cached launcher from this Angular workspace:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\start-local-api.ps1 -ApiPath 'C:\laragon\www\ts\transportseva-api' -Port 8080
```

The execution-policy override applies only to that PowerShell process. The
launcher enables PHP OPcache only for its server process, keeps timestamp
validation enabled with no revalidation delay, and binds to loopback. It does
not edit `php.ini`, change the machine execution policy, run migrations, or
modify the database. Restart it after changing the backend `.env`.

Stop the existing, verified TransportSeva API process before launching it:
the script refuses an occupied port and never kills another process itself.
This remains PHP's single-process **development** server, not a production
deployment or a substitute for real concurrent database tests.

Booking lists accept `per_page` from 1 to 100 and positive `page` values. The
list batches token, settlement, and latest-dispute data instead of issuing
three queries for each booking. Successful workflow/POD responses update the
affected booking directly; explicit Refresh, disputes, and token reconciliation
still fetch current server data. The existing 30-second timeout and Retry
remain a fallback, not the performance fix.
