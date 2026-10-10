# Cashfree sandbox checklist

1. Copy the Cashfree variables from `transportseva-api/.env.example` into the backend `.env`.
2. Use sandbox credentials only; never commit `CASHFREE_CLIENT_SECRET`.
3. Run `php artisan config:clear` after changing `.env`.
4. Set `API_CONFIG.useBackend` to `true` in `src/app/core/api/api-config.ts`. Keep `paymentProvider` as `cashfree`; set it to `mock` only when the backend uses `TS_PAYMENT_PROVIDER=mock`.
5. Confirm the webhook URL is reachable by Cashfree. Local development needs a secure tunnel.
6. Create an accepted marketplace booking and a token order.
7. Launch checkout using the returned `payment_session_id`.
8. Verify payment status through the backend status endpoint; do not trust the browser redirect.
9. Confirm the signed webhook changes the token to `paid`.
10. Move the booking to an authorized `cancelled` or `disputed` state, request a refund, and verify the refund webhook changes the token to `refunded`.

The sandbox test must use the same Cashfree environment, credentials, API version, checkout mode and webhook configuration.
