# Review publication and registered vehicle details — 31/10/2026

## Delivered

- Homepage testimonials now come only from the public approved-review API.
  Removed sample/default and browser-local CMS substitutions, including SSR
  and backend-off rendering. Loading, empty and error/retry states have English
  and Hindi copy. Actual ratings are preserved; explicitly unapproved and
  invalid-rating rows are excluded defensively.
- Real vehicle UUID links now use GET /api/marketplace-vehicles/{uuid}.
  The server scopes the lookup to the authenticated provider. Another owner's
  UUID, a missing UUID and a deleted vehicle cannot disclose the vehicle.
  Customers/drivers/admins cannot use this provider detail endpoint.
- Vehicle overview renders persisted registration, make/model, type, year,
  capacity and registration timestamp. List/detail share booking availability
  calculation. Another provider's subcontract reservation can indicate busy
  without exposing that provider's booking UUID.
- The view supports direct links, reload, refresh, loading/error/retry,
  forbidden/not-found and route-parameter changes without stale data.
  Backend mode never offers prototype-only upload, maintenance, fuel or device
  mutations. Their missing integrations are disclosed, not reported as saved.

## Executed checks

| Check | Result |
| --- | --- |
| Angular suite | 130 passed, including 11 added API/component cases |
| Backend vehicle/publication and existing staff policy suites | 22 passed, 221 assertions; real JWT middleware, isolated transaction-rolled-back fixtures |
| Headed Chrome regressions | 6 passed; zero failures, skips or flaky cases |
| TypeScript app and spec compilation | Passed |
| Production build | Passed; initial bundle 997.39 kB, above the existing 500 kB warning budget but below the unchanged 1 MB error limit |
| PHP formatting/syntax | Passed for touched controller/new test |
| Source-audit consistency | 4 passed; inventory regenerated with updated repair assessments |

The six browser cases exercised: empty reviews and server-rendered HTML;
503 review failure/retry and actual three-star rendering; loading and Hindi
empty state; registered vehicle View/reload/503 recovery; another owner's
API/UI rejection and prototype-ID rejection; live public review rendering.
Error/empty review responses and a vehicle 503 were browser-only fixtures,
not database changes. The live public feed returned five existing approved
database reviews. These are not evidence of production customer reviews.

## Records and safety

Existing QA users reused, no new accounts/password changes:

| Purpose | Existing account |
| --- | --- |
| Registered vehicle owner | verify-truck-owner-1793028294862-62@transportseva.test |
| Cross-account denial | verify-truck-owner-1793028294862-63@transportseva.test |

Vehicle tested through the list's real View button and direct/reload route:

- UUID: 121d76d4-ac5c-45e8-99f7-2a3b5e77c2d7
- Registration: ALLOC036252590B
- Stored make/model: Tata / Allocation test
- Route: /truck-owner/vehicles/121d76d4-ac5c-45e8-99f7-2a3b5e77c2d7

All six browser contexts blocked business writes and non-local hosts. Normal
login/session bookkeeping occurred. No main-database business data, schema,
user roles, vehicles, reviews, loads or bookings were created/changed/deleted.
No migration/import/seeder/reset was run; both main transportseva and isolated
transportseva_employee_test still have 100 base tables. Staff enforcement
configuration remains local-only and unchanged. No payment, GPS or external
message delivery was exercised.

Transporter authorization was tested using isolated backend provider fixtures;
no claim of a Transporter browser login. Company tenant semantics remain
unresolved. Related vehicle documents, maintenance, fuel and GPS integrations
are not implemented by this repair. Existing audit findings for dashboards,
profiles, support and other screens remain open.

## Reproduce and evidence

Backend (existing isolated test database):

    php artisan test --filter='MarketplaceVehicleDetailsTest|PlatformStaffPolicyTest'

Frontend:

    npm run test:ci -- --reporters=dots
    npm run build
    npx playwright test e2e/reviews-vehicle-details.spec.ts --headed

Full browser evidence:
[JSON report](../test-results/reviews-vehicle-details-2026-10-31.json).
Its attachments contain the actual vehicle UUID/registration, approved review
UUIDs and empty blocked-business-write-attempt arrays. Reports are generated
local artifacts, not checked-in credentials or production sign-off.

Next queued repair: server-scoped Shipper/Truck Owner dashboard aggregates,
replacing their sample KPI cards without touching payment/GPS providers.
