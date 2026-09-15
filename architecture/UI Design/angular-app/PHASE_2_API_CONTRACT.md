# Phase 2 API contract draft

The Angular prototype currently implements these operations in mock services. Production APIs must enforce tenant and role authorization server-side.

## Booking lifecycle

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/bookings` | List bookings visible to the authenticated workspace |
| POST | `/api/v1/bookings/{id}/token-orders` | Create a regulated-provider booking-token order |
| POST | `/api/v1/bookings/{id}/cancel` | Cancel before dispatch and create eligible refunds |
| POST | `/api/v1/bookings/{id}/reject` | Transporter rejection before dispatch |
| POST | `/api/v1/bookings/{id}/disputes` | Raise a booking dispute |

## Payment and ledger

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/ledger` | Paginated immutable ledger view with type/status filters |
| POST | `/api/v1/payment-webhooks/{provider}` | Receive and verify provider callbacks |
| POST | `/api/v1/refunds/{id}/complete` | Reconcile a provider-completed refund |
| POST | `/api/v1/settlements/{bookingId}` | Calculate and create settlement + commission entries |
| POST | `/api/v1/offline-payments` | Record an authorized COD/offline collection |

## Required server guarantees

- Authenticate every request and enforce workspace/role ownership.
- Verify webhook signatures before processing payloads.
- Require an idempotency key for order, refund, settlement, and offline-payment writes.
- Store immutable ledger entries; corrections are compensating entries, never edits.
- Validate currency amounts as integer minor units, not formatted strings.
- Emit an audit event for cancellation, dispute, refund, settlement, and manual offline collection.
