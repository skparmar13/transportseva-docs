# Marketplace application pagination — 15/11/2026

Completed server-backed paging for Truck Owner sent applications and both Transporter application views. Shipper received-application paging remains supported.

## Fixed behavior

| View | Previous limitation | Current behavior |
| --- | --- | --- |
| Truck Owner My Applications | Only the first 100 sent applications | Twenty records per page, server total, Previous/Next |
| Transporter My Applications | Only the first 100 sent applications | Same authenticated-applicant pagination |
| Transporter Applications Received | First 100 owned loads, then a separate bounded request for each load | One paginated query across applications on all canonically owned loads |
| All backend application lists | Inconsistent cancellation, loading and failure handling outside Shipper | Bounded reads, loading feedback, failed-page Retry, destruction cancellation, duplicate-read guard |

The new private `GET /api/account/transporter/applications` endpoint shares the established received-application query but requires the actual Transporter account type. The Shipper endpoint continues to require a customer account. Received rows exclude deleted applications and deleted loads. Scope comes from the authenticated user and canonical load owner, never request-supplied UUIDs or record creators.

Sent pages use `GET /api/applications/mine`, scoped to the authenticated applicant. Page/per-page values are bounded and unsupported query filters are rejected. Existing nonpaged client helpers retain their contracts for other consumers; this change removes the truncation from the application-list screens. Both page endpoints return private, no-store responses. Negotiated and accepted amounts continue to use existing server sources.

## Verification

| Check | Result |
| --- | --- |
| Focused Angular/API/component tests | 33 passed |
| Full Angular suite | 382 passed |
| Backend `ApplicationPaginationTest` and `ShipperAcceptanceDataTest` | 12 passed, 118 assertions |
| Source-audit suite | 13 passed |
| Visible Chrome browser cases | Both passed; Truck Owner rerun and Transporter case |
| Production build | Passed; 986.24 kB initial bundle, existing 500 kB warning; 1 MB hard limit unchanged |
| PHP syntax, focused Pint, diff whitespace | Passed |

Backend cases run transactionally in `transportseva_employee_test`, guarded to reject any non-testing/non-`*_test` database. Coverage includes applications on loads older than the latest 100, 101 applicants on one load, 101 sent applications for each provider role, complete paging without duplicates, soft deletion, creator/scope spoofing, bounded parameters, empty/out-of-range pages, authentication and independent role enforcement.

Visible Chrome used these existing accounts; no new main-database accounts, loads, applications or bookings were created:

| Existing account | Browser evidence |
| --- | --- |
| `verify-truck-owner-1793028294862-62@transportseva.test` | Real sent-application API records, global total, next/previous, failed page without stale rows, retry of the same page, exact load navigation |
| `qa-onboarding-1793463324476-transporter@transportseva.test` | Real sent/received totals and empty states, private responses, forged-filter rejection, Shipper endpoint denial; then explicitly controlled populated received-page UI |

The Truck Owner browser test forwards requests to the real endpoint with `per_page=1` to exercise paging without adding records. The Transporter account has no populated applications; controlled responses test its populated table and retry interactions. Positive Transporter data ownership and more-than-100 pagination are verified by isolated backend database tests, not claimed as populated live-account browser evidence. Temporary 503 responses deliberately exercise failure recovery.

The first Truck Owner run stopped at login because an Angular development-server overlay from an intermediate file update intercepted clicks. The Transporter case passed on the next fresh page. After compilation completed, the Truck Owner case passed in a fresh browser run. The test now fails promptly if that overlay appears. Sandbox worker/bundler launch failures were retried with the required process permission; the source-audit runner used no child-process isolation.

## Data preservation and artifacts

Browser business traffic was restricted to read-only local requests, with login/refresh/logout allowed. Both cases recorded zero attempted business writes. Authentication bookkeeping is outside the business-table comparison.

Full ordered row hashes and counts match before and after for `loads` (39), `load_applications` (53), `marketplace_bookings` (26), `marketplace_settlements` (2), `booking_token_orders` (27), and `marketplace_kyc_profiles` (4). No schema recreation, import, restore, seed or migration was used.

- Browser suite: `e2e/application-pagination.spec.ts`
- Initial run/Transporter success: `test-results/application-pagination-2026-11-15`
- Successful Truck Owner rerun: `test-results/application-pagination-owner-final-2026-11-15`
- Six-table comparison: `test-results/application-pagination-integrity-2026-11-15.json`
- Backend regression source: `C:/laragon/www/ts/transportseva-api/tests/Feature/ApplicationPaginationTest.php`
