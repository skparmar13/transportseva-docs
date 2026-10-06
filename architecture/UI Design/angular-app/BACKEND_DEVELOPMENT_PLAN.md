# TransportSeva V1 backend development plan

## 1. Objective

Replace the Angular mock services with authenticated, tenant-safe APIs while preserving the approved V1 model:

- No customer, transporter, truck-owner or driver subscription plans.
- Revenue comes from booking Platform fees and optional AIS-140 device services.
- No stored-value wallet.
- A regulated payment provider handles booking tokens, refunds and settlement money movement.
- TransportSeva stores booking, payment, ledger, commission and audit records.

The Angular prototype is the workflow specification. Production APIs must enforce every rule again on the server; browser state is never trusted for money, role or status transitions.

## 2. Recommended foundation

- Versioned REST API at /api/v1 with OpenAPI documentation.
- PostgreSQL with migrations and transactional constraints.
- Short-lived access tokens, rotating refresh tokens and staff MFA.
- Durable jobs for webhooks, refunds, notifications, reconciliation and AIS-140 reminders.
- Object storage for KYC, vehicle documents, POD and invoices.
- Structured logs, request IDs, metrics, traces and an immutable audit stream.

The framework can be selected separately; domain boundaries and API contracts must remain framework-independent.

## 3. Delivery phases

### Phase 0 — Contract freeze

1. Map each mock-service method to an API operation.
2. Finalize the role, staff and tenant permission matrix.
3. Confirm the payment provider, supported methods, refund rules and settlement contract with compliance counsel.
4. Approve currency, tax, cancellation, dispute and Platform-fee policy versions.

Exit: approved OpenAPI draft, ERD, state machines and acceptance-test catalogue.

### Phase 1 — Platform foundation

Implement configuration/secrets, migrations, users, companies/workspaces, staff membership, roles, permissions, login, refresh, logout, password reset, OTP, staff-login separation, tenant guards, audit events, idempotency keys and standard errors.

Exit: a user can authenticate, access only an authorized workspace and see no other tenant's data.

### Phase 2 — Marketplace

Implement loads, public recent-load search, applications, structured offers, negotiation history, booking creation, vehicle/driver assignment, booking timeline and validated status transitions. Address search must use a provider-neutral place identifier, label and optional coordinates.

Exit: shipper → application → negotiation → accepted booking works through API and survives refresh.

### Phase 3 — Booking-token payments

Implement separate token orders per liable party, provider checkout, signed webhook verification, event deduplication, token states (created, pending, paid/protected, refund_pending, refunded, forfeiture_pending, forfeited), transporter rejection/full refund, configured cancellation refund, provider-failure retry and reconciliation.

Exit: every token order has a provider reference, immutable event history and an idempotent refund path.

### Phase 4 — Freight settlement and Platform fees

Snapshot rules at booking confirmation:

- final negotiated freight is the calculation basis;
- up to ₹10,000: configurable fixed fee per side (default ₹300);
- above ₹10,000: configurable percentage per side;
- configurable minimum, cap, tax, cancellation fee and refund rates;
- a Transporter liable on both sides owes both components.

At settlement:

- shipper payable = gross freight + shipper-side Platform fee;
- provider payout = gross freight − provider-side Platform fee;
- TransportSeva revenue = both fee components plus applicable tax;
- settlement and commission entries are posted atomically;
- normal completed bookings do not create a separate post-settlement collection request.

Exit: totals reconcile for shipper, truck owner, Transporter-both-sides and partial milestones.

### Phase 5 — Disputes, refunds and offline collection

Implement dispute evidence and statuses (open, under_review, resolved), settlement locking, admin refund/waiver/forfeiture outcomes, refund reconciliation, authorized COD/offline payments, compensating ledger entries and audit trails.

Exit: adverse cancellation/dispute outcomes are reproducible from ledger and provider references.

### Phase 6 — Fleet, trips and AIS-140

Implement vehicles, drivers, documents, verification, trip/POD lifecycle, device inventory, assignment, activation, recharge, expiry, suspension, replacement, map/geocoding adapter, live-location ingestion and geofence events. AIS-140 invoices and payment history remain optional services.

Exit: device and trip records are independent of booking money state.

### Phase 7 — Admin, CMS and operations

Implement companies, TransportSeva staff, roles/permissions, CMS pages/blogs/testimonials/announcements, careers, newsletter subscribers, API credentials, reports, invoices, reconciliation and audit APIs.

Exit: every admin screen backed by a mock service has a paginated, authorized API.

### Phase 8 — Frontend cutover and release

Add Angular API adapters matching current mock-service interfaces, switch feature-by-feature, run migration/backfill and reconciliation, then run security, load, accessibility and end-to-end tests behind feature flags.

## 4. Core entities

user, workspace, workspace_member, role, permission, load, load_application, negotiation_offer, booking, booking_party, booking_token, payment_order, payment_transaction, payment_webhook, refund, dispute, settlement, settlement_milestone, commission_rule, commission_snapshot, commission_component, ledger_entry, payout, offline_payment, vehicle, driver, trip, pod, device, device_service, document, cms_content, career_job, career_application, newsletter_subscriber, notification and audit_event.

Money is stored as integer minor units with ISO currency, never as formatted strings.

## 5. API groups

- /auth/*
- /workspaces, /members, /roles
- /loads, /applications, /negotiations, /bookings
- /bookings/{id}/token-orders, /refunds, /disputes
- /payment-webhooks/{provider}, /settlements, /payouts, /ledger
- /vehicles, /drivers, /trips, /devices
- /cms, /careers, /newsletter
- /reports, /audit, /notifications

All money or state-transition writes require authorization, validation and an idempotency key.

## 6. Non-negotiable server guarantees

- Verify payment-webhook signatures and reject replayed events.
- Enforce tenant, role and object-level authorization.
- Validate allowed state transitions server-side.
- Use database transactions for settlement, Platform fees and ledger posting.
- Keep ledger entries append-only and reconcile them to provider transaction IDs.
- Never accept commission, payout or refund amounts from the browser.
- Redact secrets and personal/payment data from logs.
- Rate-limit authentication, search, webhooks and admin operations.
- Maintain backups and a tested recovery procedure.

## 7. Definition of backend readiness

Backend V1 is ready for production pilot only when all prototype journeys pass against real APIs; sandbox tests cover success, failure, timeout, duplicate webhook, refund and adverse dispute; tenant-isolation and permission tests pass; settlement totals reconcile for every liable-party combination; migrations, monitoring, audit logs and rollback procedures are documented; and legal/compliance review approves the selected payment flow and contracts.
