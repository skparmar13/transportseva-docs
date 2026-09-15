# TransportSeva prototype status

## Locked V1 direction

TransportSeva does not expose a stored-value wallet. Regulated payment-provider infrastructure handles money movement; this Angular prototype records the resulting payment ledger, booking tokens, refunds, settlements, commissions, payouts, and offline/COD collections.

## Implemented prototype flows

- Booking token payment through simulated UPI/card provider.
- Recoverable provider failure state and retry.
- Transporter rejection and customer cancellation before dispatch.
- Refund records with processing/completed lifecycle.
- Settlement and commission ledger entries with duplicate-settlement protection.
- Offline/COD payment recording with amount validation.
- Booking disputes routed to support review.
- Provider webhook boundary with event-id deduplication.
- Payment Ledger filters for tokens, payments, refunds, settlements, and commission.

## Before production

- Replace mock services with authenticated API calls and server-side authorization.
- Verify payment signatures and webhook payloads on the server; never trust browser payment state.
- Persist immutable double-entry ledger records and reconciliation/audit logs.
- Integrate refund, settlement, payout, dispute, and COD workflows with the selected RBI-authorised provider and contracts.
- Add role/tenant isolation, rate limiting, observability, and end-to-end tests.
