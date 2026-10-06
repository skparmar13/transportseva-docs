# Existing transportseva-api reuse audit

Audit target: C:\laragon\www\ts\transportseva-api

## Conclusion

The existing Laravel modular API is a useful foundation, but it is not yet a drop-in backend for the approved V1 prototype. Keep the platform, identity, tenancy, fleet, device, tracking, document, notification, CMS and admin modules. Adapt the payment and booking domains before connecting Angular. Disable the subscription product surface and do not delete its tables until a migration decision is approved.

## Keep and integrate

| Existing area | Decision | Reason |
|---|---|---|
| Laravel modular structure and Core | Keep | Good module boundaries, repositories, services, requests and API resources. |
| User, Identity, Role, Permission | Keep, verify | Reuse authentication/RBAC, but resolve the JWT/Sanctum documentation and middleware mismatch. |
| Company and Branch | Keep | Provides the workspace/tenant foundation for staff and external organizations. |
| Employee, Department, Designation | Keep | Supports the large TransportSeva internal workforce. |
| Customer, Driver, Vehicle, Fleet | Keep and map | Maps directly to portal users, drivers and vehicle operations. |
| Device and Tracking | Keep and integrate | Existing OEM adapters/webhooks are valuable for AIS-140 and live tracking. Add signature verification and tenant authorization checks. |
| Document, E-Way Bill, Notification, Support | Keep | These support compliance and operations; align booking references and permissions. |
| Invoice | Keep as a base | Reuse PDF/tax infrastructure, but add Platform-fee, refund and settlement invoice types. |
| CMS and admin modules | Keep | Matches the prototype's content, careers, newsletter and staff-management screens. |

## Modify before frontend integration

### Payment module

The existing Payment module exposes generic payment CRUD plus Wallet, Invoice and Ledger controllers. Its documentation and migrations explicitly create wallets and wallet credit/debit operations.

Required change:

- Keep payment orders, transactions, invoices and ledger infrastructure.
- Stop exposing wallet balance, wallet top-up, wallet transfer and wallet debit/credit endpoints for V1.
- Add provider adapter, order creation, signed webhook, refund, reconciliation and settlement services.
- Replace client/admin mark-completed authority with verified provider events or controlled reconciliation.
- Store integer minor units, currency, provider IDs, idempotency keys and immutable event payload hashes.

### Booking module

The current Booking API is basic CRUD (index, store, show, update, destroy). It does not yet represent the prototype's application, negotiation, booking-token, dispute, refund and settlement state machine.

Required additions:

- loads, applications and negotiation offers;
- accepted-offer booking creation with immutable final freight;
- booking parties and token orders;
- transporter rejection and customer cancellation;
- disputes and evidence;
- settlement milestones, provider payout and Platform-fee snapshot;
- server-side transition validation and audit events.

### Commission / Platform fees

No verified existing module was found that implements the approved two-sided Platform-fee rules. Add a dedicated commission domain or clearly separated service:

- versioned commission rules;
- shipper-side and provider-side components;
- fixed fee up to ₹10,000 and percentage above the threshold;
- minimum, cap, tax, cancellation and refund policy;
- Transporter-both-sides handling;
- immutable booking snapshot;
- shipper payable = freight + shipper fee;
- provider payout = freight − provider fee.

### Authentication contract

Project documents describe JWT authentication, while current module routes use auth:sanctum in several places. Confirm the actual running guard before Angular integration. Standardize one API contract for login/signup/OTP, staff login, access/refresh/logout, /me, workspace claims and 401/403 errors.

### API versioning

Current routes are inconsistent (/api/booking, /api/payments, /api/v1/subscriptions). Create a versioned integration surface, preferably /api/v1, and preserve old routes only through an explicit deprecation period.

## Disable or archive for V1

### Subscription module

The existing Subscription module contains plans, subscriptions, upgrades, downgrades, invoices, payment methods and add-ons. This conflicts with the locked V1 decision that users do not subscribe.

Do not hard-delete it immediately:

1. Remove it from navigation and signup flows (already done in Angular).
2. Disable public subscription routes and subscription creation.
3. Keep migrations/data read-only for historical compatibility.
4. Rename or isolate future subscription code behind a feature flag.
5. Remove it only after confirming no production data or reports depend on it.

### Wallet terminology

The existing wallet tables and API names should not be used in the new frontend contract. Rename future-facing documentation and resources to payment orders, booking tokens, refunds, settlements and ledger entries.

## API mapping to the Angular prototype

| Prototype capability | Existing API status | Action |
|---|---|---|
| Auth and staff login | Partially present | Verify guards and normalize response contract. |
| Load board and public loads | Not confirmed in current Booking CRUD | Add marketplace load endpoints. |
| Application and negotiation | Not found in Booking routes | Add dedicated domain. |
| Booking token order | Not found | Add provider order endpoint. |
| Refund and provider webhook | Generic payment tests exist, provider flow not confirmed | Add signed adapter and idempotent webhook endpoint. |
| Dispute and token forfeiture | Not found | Add dispute workflow and ledger outcomes. |
| Freight settlement | Generic ledger exists | Add atomic settlement service and Platform-fee snapshot. |
| Platform-fee rules | Not confirmed | Add commission rules and admin configuration. |
| Fleet, drivers and devices | Present | Map response fields and permissions. |
| Tracking/geofences | Present | Map booking/trip IDs and secure webhooks. |
| CMS/careers/newsletter | Present or partially present | Verify route coverage and pagination. |

## Verification gates before Angular cutover

1. Run the current Laravel test suite against a clean database; do not rely only on dated status reports.
2. Export the actual route list and compare it with the prototype route/API matrix.
3. Confirm migrations on the current MySQL environment and document backup/rollback.
4. Add feature tests for token success, duplicate webhook, refund, transporter rejection, cancellation, dispute hold, adverse token forfeiture and settlement.
5. Add financial reconciliation tests for the ₹10,000 fixed-fee boundary, percentage calculation, shipper payable, provider payout, Transporter-both-sides, tax, cap, minimum and rounding.
6. Only then replace each Angular mock service with an API adapter.

## Recommended next implementation order

1. Resolve authentication/guard and API versioning.
2. Freeze the existing database modules that are reusable.
3. Build Marketplace and Booking state machine around existing Company/Fleet/User models.
4. Refactor Payment away from wallet semantics and add provider adapter/webhooks.
5. Add Commission/Platform-fee snapshots and settlement.
6. Integrate Angular feature-by-feature with contract tests.
