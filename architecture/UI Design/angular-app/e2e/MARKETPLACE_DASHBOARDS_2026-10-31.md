# Self-scoped marketplace dashboards — 31/10/2026

Shipper and Truck Owner dashboards now use the authenticated user's database
records. No sample totals, recent rows, trends, earnings or GPS locations are
substituted on success, failure, loading, backend-off rendering or refresh.
Other role dashboards are outside this repair and remain on the audit queue.

## Definitions and flow

| Dashboard | Metric | Server definition |
| --- | --- | --- |
| Shipper | Total loads posted | Non-deleted loads with posted_by_uuid matching the authenticated user |
| Shipper | Pending applications | Non-deleted pending/negotiating application rows on those non-deleted owned loads |
| Shipper | In-transit bookings | Non-deleted bookings with this owner_uuid and in_transit status |
| Shipper | Delivered bookings | Non-deleted bookings with this owner_uuid and completed status; this means delivered, not financially settled |
| Truck Owner | My vehicles | All non-deleted registered marketplace vehicles owned by the user |
| Truck Owner | Vehicles on trip | Those vehicles with effective on_trip availability, using the same allocation logic as fleet list/detail |
| Truck Owner | Available vehicles | Those vehicles with effective available availability; reserved/maintenance/inactive are excluded |
| Truck Owner | Pending applications | This applicant_uuid's non-deleted pending/negotiating applications on loads that still exist |

GET /api/marketplace-dashboard derives the shipper/provider response from the
persisted authenticated user type. It accepts no scope grant from query-string
owner/user/role values. Customer, Truck Owner and Transporter provider accounts
are supported by this API; Driver/Admin requests are denied. No staff access
ceiling or enforcement setting was broadened.

Load ownership is the canonical poster UUID. A created_by audit actor alone
does not grant dashboard access to another poster's load. Pending is not called
"new/unread" because there is no read-state counter. Completed bookings are
not represented as money collected or earnings.

Counts cover all owned records, not just page one. Recent lists have a fixed
six-record limit, ordered by created_at then id. Live application rows replace
the stale denormalized applications_count value in the dashboard response,
without changing that stored cache. Vehicle availability is shared across
list/detail/dashboard; large fleets are processed in 500-row chunks to bound
memory and SQL placeholders. Another provider's global reservation never
discloses that provider's booking UUID. Responses are private/no-store.

UI flow: real login → dashboard loading/disabled animated refresh → scoped
counts and recent rows → record-specific load/vehicle link. Reload/navigation
fetches again; Refresh fetches current data and clears stale cards while busy.
Failures show retry rather than samples or misleading zeroes. Successful empty
responses display zero counts plus the correct Post Load/My Vehicles action.
English/Hindi feature copy, reduced-motion support and DD/MM/YYYY hh:mm AM/PM
timestamps are included. Quick actions now target the implemented marketplace
routes, without advertising deferred GPS/payment/support prototype actions.

## Existing users and observed totals

No users, vehicles, loads or bookings were created for the browser run.

| Existing account | Observed totals in metric order above | Recent rows |
| --- | --- | --- |
| qa-recovery-1793377725393@transportseva.test | Shipper: 0 / 0 / 0 / 0 | 0 loads |
| verify-shipper-1793028294862-61@transportseva.test | Shipper: 9 / 0 / 0 / 2 | 6 of 9 loads |
| verify-truck-owner-1793028294862-62@transportseva.test | Truck Owner: 5 / 0 / 3 / 0 | 5 vehicles, including 2 reserved |
| verify-truck-owner-1793028294862-63@transportseva.test | Truck Owner: 0 / 0 / 0 / 0 | 0 vehicles |

Recent Shipper rows included load UUID
f0ee79e2-cadc-4372-a0a2-690212674c9b, whose actual detail route was opened.
Truck Owner rows included vehicle UUID
121d76d4-ac5c-45e8-99f7-2a3b5e77c2d7, registration ALLOC036252590B; the
registered-vehicle detail screen was opened from that dashboard link.
The JSON report records all recent UUIDs and actual actor UUIDs. These existing
QA records are not production customer or operational-data evidence.

## Verification

| Check | Result |
| --- | --- |
| Angular unit suite | 148 passed; includes 18 new dashboard service/component cases |
| Backend dashboard + registered-vehicle + staff-policy suites | 31 passed, 277 assertions; includes 9 new dashboard tests |
| Final visible Chrome dashboard/review/vehicle run | 12 passed; six dashboard cases plus six previous repair regressions, no skips or flaky results |
| Source-audit consistency | 4 passed; updated inventory regenerated |
| TypeScript app/spec compilation | Passed |
| Production build | Passed, unchanged initial bundle 997.39 kB; existing 500 kB warning remains, unchanged 1 MB error budget met |
| PHP formatting/syntax and diff whitespace checks | Passed for touched files |

Backend cases cover empty accounts, foreign ownership and forged query scopes,
deleted loads/applications/vehicles/bookings, cached-count disagreement, valid
pending statuses, wrong roles, genuine operational availability, and refresh
after delivery. A 125-load fixture and 520-vehicle fixture prove totals are not
limited to the six-row preview or first 100 rows. Fixtures are transactionally
rolled back in transportseva_employee_test with real JWT middleware and an
explicit testing/*_test safety guard. External HTTP is prevented.

Six dashboard browser cases cover four real existing identities, independent
owned-load/fleet comparisons, reload, record navigation, scope-query spoofing,
loading and duplicate refresh prevention, injected 503/retry, changed successful
zero results and Hindi rendering. The six preceding review/vehicle repair
cases were rerun alongside them. Browser-only injected failures/zero responses
do not modify database records. Screenshots of all four dashboards are retained.

The first backend fixture run failed because my test loads omitted required
fields. Fixtures were corrected to meet the real schema and unique applicant
constraints; no schema changes were used. An initial browser collection had
five passes and one login blocked by the dev server's stale intermediate
trendDown template compilation overlay. The removed property was absent from
the completed code; the following complete 12-case run passed without dismissing
the overlay. The further 12-case handoff run after the final subtitle/table
polish also passed; desktop dashboard screenshots were visually inspected.
Earlier results are retained separately, not silently relabelled as passing.

## Safety, artifacts and reproduction

Both transportseva and transportseva_employee_test still contain 100 base tables.
No migration, import, database reset, seeder, main business mutation, password
change, role reassignment or account creation was performed. Browser contexts
block business writes and non-local hosts; API comparisons are GET-only.
Normal login/session bookkeeping did occur. Existing staff enforcement remains
local-only. Payments, GPS, external OTP/email and production deployment were
not exercised or enabled. No production-readiness claim for other screens.

- [Final handoff browser report](../test-results/marketplace-dashboards-handoff-2026-10-31.json)
- [Earlier complete 12-case report](../test-results/marketplace-dashboards-final-2026-10-31.json)
- [Initial browser collection, including overlay failure](../test-results/marketplace-dashboards-2026-10-31.json)

Frontend:

    npm run test:ci -- --reporters=dots
    npm run build
    npx playwright test e2e/marketplace-dashboards.spec.ts e2e/reviews-vehicle-details.spec.ts --headed

Backend, using the existing isolated test database:

    php artisan test --filter='MarketplaceDashboardTest|MarketplaceVehicleDetailsTest|PlatformStaffPolicyTest'

Next queued area: persist real business/profile fields for the authenticated
user/organization, with reload, validation and cross-account isolation tests.
Company workspace semantics still need a separate decision; no Company role or
tenant membership should be invented from a browser role label.
