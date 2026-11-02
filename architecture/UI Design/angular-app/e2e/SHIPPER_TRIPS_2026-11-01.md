# Shipper Trip History and Details — 01/11/2026

## Delivered scope

The Shipper Trip History list and Trip Details now use authenticated, owner-scoped
booking data instead of the shared prototype trip store. Existing Trips screens
for other roles were not replaced in this task.

- The source of truth is the existing marketplace booking and its owned load,
  actual vehicle/driver assignment, recorded workflow milestones and stored POD.
  No duplicate trip entity or migration was introduced.
- List totals cover all owned bookings. Search/stage filters, matching-record
  counts and pagination are separate from those global totals.
- Awaiting confirmation, planned, active, delivered, paused/disputed and cancelled
  states are distinguished. Delivered does not mean financially settled.
- Only recorded dates are displayed, using DD/MM/YYYY hh:mm AM/PM. Missing dates,
  assignments and PODs have explicit unavailable states, not invented defaults.
- Detail refresh checks run every ten seconds without overlapping requests.
  Failed background checks label retained data stale; manual refresh recovers it.
  A denied/deleted record clears private details instead of retaining them.
- POD downloads fetch the original authenticated stored file, not a generated
  placeholder. Storage paths and raw workflow/financial data are not exposed.
- Booking/POD review links open the exact booking UUID, including a booking not
  present in the initial booking-list page. Shipper booking cards link back to
  their real Trip History detail.
- Loading indicators, duplicate-click guards, honest errors/retry, empty states
  and English/Hindi copy are included. Sample GPS, ETA and distance are absent.

These are read screens. Assignment, loading, delivery, POD decisions, payment and
dispute mutations remain in the existing Bookings workflow. Real payments and
GPS were not activated or tested.

## Implementation entry points

Frontend:

    src/app/core/api/api-shipper-trip.service.ts
    src/app/features/shipper/trips/
    src/app/features/marketplace/bookings/bookings.component.ts
    e2e/shipper-trips.spec.ts

Backend, in the sibling transportseva-api project:

    app/Services/ShipperTripReadService.php
    app/Http/Controllers/ShipperTripController.php
    tests/Feature/ShipperTripHistoryTest.php
    routes/api.php

Read-only API:

    GET /api/account/trips
    GET /api/account/trips/{uuid}

The server accepts only the authenticated shipper's owner UUID, not a client
owner/role claim or creator/provider relationship. Unsupported filters receive
422; another shipper's record receives 404; other account roles receive 403.
Existing authentication and mandatory onboarding enforcement still apply.

## Execution results

| Verification | Result | Scope |
|---|---|---|
| New backend Trip suite | 13 passed, 140 assertions | Owner scope, validation, paging, actual assignments, timeline, private original POD, missing data, role boundaries and operational start-to-delivery integration |
| Expanded backend regression | 105 passed, 1,150 assertions | Trips, Support, Contact enquiries, staff policy, onboarding, business profiles, dashboards and vehicle details |
| Angular suite | 242/242 passed | Includes 15 Trip UI tests, 3 Trip HTTP tests and 3 exact-booking navigation regressions |
| Visible Chrome regression | 12 passed, 0 failed/skipped/flaky | Six Trip scenarios plus six existing dashboard scenarios |
| Source audit | 4/4 passed | All active route assessments retain valid source anchors |
| TypeScript application check | Passed | No-emit application compilation |
| Production build | Exit 0 | Initial bundle 996.55 kB; existing 1 MB error budget unchanged; existing 500 kB warning remains |
| PHP syntax / git whitespace checks | Passed | No schema, environment or staff-grant change |

Backend feature tests use guarded transactional transportseva_employee_test,
not a reset of transportseva. The start-to-delivery transition test runs inside
that isolated transaction; it is not a claim of a new main-database trip or a
real money transfer. External HTTP/mail delivery is disabled in these tests.

### Visible browser flow

Chrome was headed and used existing accounts against ports 4300/8080. Business
write requests and non-local destinations were blocked. Only normal local
login/refresh/logout POSTs were allowed. All recorded business-write attempts
were empty. No test account or marketplace record was created by this suite.

| Step | Verified result |
|---|---|
| Open owned history | Real server totals, stage filter and literal booking-reference search |
| Open matching trip | Exact UUID, actual assigned vehicle and nine recorded timeline events |
| Open POD tab | Approved state and authenticated original file; downloaded bytes match the API original |
| Reload | Same stored booking and assignment, with no browser-only prototype state |
| Empty/cross-account checks | Genuine zero history, foreign record 404, owner-override 422, provider 403 and portal redirect |
| Slow/failing list | Animated loading, disabled duplicate action, 503 error and real retry; Hindi copy |
| Missing-data checks | Delivered/no-POD and planned/unassigned bookings show no fake upload/download or guessed timestamps |
| Booking deep link | Exact real booking retrieved when omitted from initial list by a browser-only response fixture |
| Interrupted detail poll | Last record remains with stale warning; refresh returns to fresh data |
| Dashboard regression | Two shipper and two truck-owner scopes, real row routing, reload, failures, zero state and Hindi |

Final browser run: 01/11/2026 11:07:02–11:09:43 UTC
(04:37–04:39 PM IST), 160.8 seconds.

Evidence:

- [Final browser JSON](../test-results/shipper-trips-final-2026-11-01.json)
- [Final Trip screenshot](../test-results/shipper-trip-overview-final.png)
- [Browser artifact directory](../test-results/shipper-trips-final-run/)

An initial Trip-only run had five passes and one test-selector failure:
the test expected “Hide details” while the existing label was “Hide Details”.
The locator was made case-insensitive; the final combined run above passed all
twelve tests. The initial JSON is retained separately, not overwritten.

A dev-server Vite overlay was detected during preflight before executing tests.
Two subsequent fresh navigations had no overlay before the run began. The
overlay was not dismissed/hidden and the user's servers were not restarted.

### Existing booking used

| Field | Value |
|---|---|
| Database | transportseva |
| Booking reference | TS-KOQKWAZAA8 |
| Booking UUID | 5c18b398-8a75-4017-9ecf-e268282a4852 |
| Route | Delhi → Jaipur |
| Actual assigned vehicle | VERIFY028294862 |
| Display stage | Delivered |
| Recorded timeline events | 9 |
| POD | Approved; existing 68-byte QA image |
| Original/download SHA256 | 431ced6916a2a21a156e38701afe55bbd7f88969fbbfc56d7fe099d47f265460 |

Additional existing records checked include TS-MBNEEWBCMC (delivered without
POD) and TS-JNZMDJGL5E (confirmed without an assigned vehicle). No booking status,
POD, assignment or payment was changed by the visible browser tests.

### Existing local QA accounts reused

These are development-only credentials, not new accounts and not production
credentials. No password, membership or role was changed.

| Use | Email | Password |
|---|---|---|
| Shipper with real history | verify-shipper-1793028294862-61@transportseva.test | TransportSevaE2E@2026 |
| Empty shipper | qa-recovery-1793377725393@transportseva.test | RecoveryFinal@2026! |
| Provider boundary/dashboard | verify-truck-owner-1793028294862-62@transportseva.test | TransportSevaE2E@2026 |
| Second provider dashboard | verify-truck-owner-1793028294862-63@transportseva.test | TransportSevaE2E@2026 |

## Database preservation and later activity

No migration, import, seeding, reset, restore, deletion, new main-account creation
or staff-grant modification was performed for this task. Staff enforcement
remains local-only; base-table and membership counts remain 107 and 11.

The final database check occurred several hours after the browser tests, after
the conversation resumed. A claim that the entire shared database was unchanged
would be incorrect: later records and an existing-load update were present.

| Table | Baseline | Late check | Original rows' SHA256 comparison |
|---|---:|---:|---|
| users | 102 | 103 | Counts only; authentication bookkeeping expected |
| loads | 36 | 37 | Different: an existing load was updated at 14:57:17 UTC, after the tests |
| load_applications | 49 | 51 | Original 49 match exactly after excluding later additions |
| marketplace_bookings | 23 | 24 | Original 23 match exactly after excluding later additions |
| marketplace_settlements | 1 | 2 | Original row matches exactly after excluding later addition |
| booking_token_orders | 25 | 27 | Original 25 match exactly after excluding later additions |

The later account was created at 14:48:20 UTC; the new load at 15:40:09, its
booking at 15:45:18, and its settlement at 16:05:20. These are later than the
final browser run. Timing and the read-only browser guard indicate separate
later local activity; its actor was not independently attributed. Nothing was
removed or reverted to force a matching snapshot. Exact original load contents
cannot be certified unchanged by the aggregate hash check.

## Remaining boundaries and next task

- The recorded timeline reflects available workflow milestones and the current
  POD revision. It does not reconstruct a complete immutable audit of previous
  POD revisions or every dispute/status event.
- Other roles' shared legacy Trip screens remain prototypes; they are not
  covered by the shipper implementation result.
- The current source inventory classifies Shipper's 19 routes as 13
  API-connected, 2 prototype (Documents and Reports), and 4 deferred payment/GPS
  routes. API-connected is not certification that every production action works.
- Next scoped repair: real, owner-scoped Shipper Documents, followed by Reports.
  Real payments, GPS, outbound provider delivery and staging remain separate.
