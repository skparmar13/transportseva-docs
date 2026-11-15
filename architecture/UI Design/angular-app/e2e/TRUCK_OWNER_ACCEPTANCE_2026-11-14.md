# Truck Owner acceptance — 14/11/2026

## Result and scope

All 18 operational screen routes passed a visible Chrome navigation and reload
sweep against existing records in the local application. This is read-only
screen acceptance, not a new booking lifecycle or a verification of every
mutation on every screen. The independent vehicle loading/failure/retry journey
also passed.

## Reproduced and fixed

1. The dashboard's Pending Applications card navigated to the undefined
   `/truck-owner/my-applications`. It now opens `/truck-owner/applications`.
   A focused dashboard regression reproduced the wrong href before the fix;
   the final visible sweep clicked it and reached the real application screen.
2. My Vehicles displayed `No vehicles found` and `Add Your First Vehicle`
   during a pending read and after a failed read, with no Retry action. It now
   shows animated loading, a distinct failure with Retry, and a genuine empty
   state only after a successful read. Requests have a 30-second timeout,
   duplicate-read protection and cancellation when the component is destroyed.
   Both focused regressions failed before repair and passed afterward.

## Visible route coverage

Each listed route opened its expected component and heading, then survived a
full reload at the same URL. Additional checks compared dashboard totals,
vehicle/driver rows, registered-detail fields, trip totals, report totals and
document totals with real API responses.

| Area | Routes passed |
| --- | --- |
| Overview and marketplace | Dashboard, Load Board, Load Details, My Applications, Bookings, Reviews |
| Fleet | My Vehicles, Vehicle Details, My Drivers, Driver Details |
| Operations | Trips, Trip Details, Reports, Documents |
| Account | KYC, Notifications, Support, Profile |

The separate visible vehicle test held its read, verified a loading state with
no false empty message, returned HTTP 503, verified a visible retryable failure,
then used Retry to recover the real vehicle rows.

## Evidence

- Focused Angular suite: **16 passed**. The baseline run had **3 failures**,
  reproducing the dashboard link and both vehicle read-state defects.
- Production build: **passed**, with the existing initial-bundle warning.
- Source-audit suite: **9 passed**; `git diff --check` passed.
- Final visible route sweep: **1 passed**, covering 18 routes and the dashboard
  application-link click, **10.2 minutes**.
- Separate final visible vehicle failure/retry test: **1 passed**, **34 seconds**.
- Final artifacts:
  `test-results/truck-owner-acceptance-sweep-2026-11-14` (route sweep) and
  `test-results/truck-owner-acceptance-final-2026-11-14` (vehicle test passed;
  earlier sweep attempt in that same run failed).
- The passing sweep attached `truck-owner-acceptance.json` with the exact route
  list, account and empty blocked-business-write list.

## Existing records and preservation

Account: `verify-truck-owner-1793028294862-62@transportseva.test`.
No users, vehicles, drivers, loads or bookings were created by this sweep.
Network guards blocked business mutations and non-local hosts, allowing only
authentication lifecycle POSTs and read requests. No database migration,
import, reset or restore was run. This is not a full database hash comparison.

Detail records selected from the real account APIs:

- Load: `3086dfc2-ce13-4f5c-b0d6-a72c10a287c0`.
- Vehicle: `121d76d4-ac5c-45e8-99f7-2a3b5e77c2d7`.
- Driver: `00c0ff35-43f3-4753-8bb7-28ac42de62e7`.
- Trip/booking: `3527de3b-f022-4942-bcaa-bb5f402d7d46`.

## Observed runtime limitation

The local API intermittently exceeded the existing 15-second session-check
timeout. An initial sweep reached the explicit `access-check-failed` recovery
page. Another attempt interacted too early while the global route overlay was
still active. The final harness waits for navigation to settle and uses the
actual Retry session check control when offered; the passing sweep logged one
such retry at Load Details. No token injection, mocked identity, permission
bypass or guard change was used. Local session-check latency remains a finding,
and these results do not claim uninterrupted session verification.
