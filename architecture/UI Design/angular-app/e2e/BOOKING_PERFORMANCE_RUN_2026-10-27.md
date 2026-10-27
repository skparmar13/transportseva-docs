# Booking performance and allocation follow-up — 27/10/2026

Result: fixes implemented and verified against the existing local API. All three
headed Chrome scenarios passed in 3.6 minutes. The previously incomplete fleet
allocation/release/reuse flow is now verified through the visible UI.

## Diagnosis and fixes

| Finding | Fix | Verification |
| --- | --- | --- |
| Each booking serialized its tokens, settlement, and latest dispute through separate queries | Eager-load three relationships in batches; preserve the resource contract for individual workflow responses | Nine bookings: 30 queries before, 6 after; test count stays constant from 1 to 25 bookings |
| Pagination accepted arbitrary sizes | Validate `per_page` from 1 to 100 and positive `page` | Invalid and unbounded values return 422 |
| Local PHP loaded the framework from source on every request; OPcache was not loaded | Add a loopback-only, process-scoped OPcache launcher with immediate source validation | Warm health checks on the diagnostic server: 0.32–0.53 seconds versus approximately 4.2–4.7 seconds on the uncached server |
| Successful operational/POD actions unnecessarily fetched the entire booking list again | Apply the authoritative returned booking to its existing card | Angular tests confirm no second list request and no global loading spinner; visible workflow passed |
| List/fleet reads could outlive their screen | Cancel subscriptions when the component is destroyed; retain the 30-second timeout | Focused Angular cancellation and timeout/retry tests passed |

The local framework bootstrap profiler initially measured about 10.3 seconds;
the actual booking serialization/query work was much smaller. The fix therefore
addresses both local server startup and query growth, rather than attributing
the whole delay to SQL or increasing the timeout.

The script does not modify global `php.ini` or the machine execution policy.
It does not run migrations or change database configuration. The normal API is
running on port 8080; the temporary diagnostic server on port 18080 was stopped.
The server remains single-process development tooling, not a production server.

Startup instructions: [RUNTIME_CONFIGURATION.md](../RUNTIME_CONFIGURATION.md).

## Measured local response times

Five serial requests to the actual `localhost:8080/api/marketplace-bookings`
endpoint after startup/login returned all nine saved bookings:

| Sample | Elapsed |
| --- | --- |
| 1 | 989 ms |
| 2 | 451 ms |
| 3 | 407 ms |
| 4 | 517 ms |
| 5 | 500 ms |

Median: **500 ms**. These are warmed local measurements; cold startup and a
different deployment/load can differ.

In headed Chrome, two tabs issued Refresh concurrently for three rounds with
normal bell polling enabled. All six requests succeeded, with complete UI
refresh times of 3,848, 4,779, 2,768, 3,674, 2,652, and 4,096 ms. No request hit
the 30-second timeout. The allocation workflow also completed with zero timeout
retries. The explicitly stalled-response test separately verified Retry recovery.

## Verification summary

| Suite | Result |
| --- | --- |
| Backend performance + allocation + existing workflow/cancellation | 22 passed; 313 assertions |
| New backend performance subset | 3 passed; 33 assertions |
| Angular behavior tests in ChromeHeadless | 5 passed |
| Visible Chrome: two-tab performance, full allocation/reuse, stalled-list recovery | 3 passed; no unexpected or flaky tests |
| Production build | Passed; existing 984.12 kB initial-bundle / 500 kB warning remains |
| PHP syntax and Git whitespace checks | Passed |

The backend performance cases also check latest-dispute date/ID tie ordering,
soft-deletion behavior, token/settlement fields, POD path redaction, both party
views, unrelated-user isolation, and pagination bounds. Backend fixtures remain
in `transportseva_employee_test`; browser verification uses `transportseva`.

Commands:

```powershell
# From transportseva-api:
php artisan test --filter='MarketplaceBookingPerformanceTest|MarketplaceAllocationTest|MarketplaceWorkflowTest|MarketplaceCancellationRequestTest'

# From this Angular workspace:
npm run test:ci -- --include=src/app/features/marketplace/bookings/bookings.performance.spec.ts
npm run build
```

## Visible allocation flow and retained records

No new main-database users, loads, vehicles, or drivers were created in this
follow-up. It resumed the three confirmed, unassigned bookings from the earlier
interrupted test, first checking that their state was still suitable.

| Step | Verified outcome |
| --- | --- |
| Competing stale vehicle selections | First booking returned 422; second returned 200; losing dialog displayed the conflict |
| Vehicle availability after refresh | Reserved vehicle disabled; other registered vehicle assignable |
| Competing stale driver selections | First booking returned 422; second returned 200; losing dialog displayed the conflict |
| Cancellation request and admin phone-review decision | Reservations retained during review; admin cancellation released both resources |
| Loading, shipper confirmation, trip start, delivery | Saved transitions appeared correctly; availability became On Trip; delivery released resources without requiring payment |
| Reuse by the third booking | Released vehicle and driver assigned successfully; My Vehicles showed Reserved versus Idle correctly |
| Terminal booking protection | Vehicle/driver changes returned 422 and historical snapshots remained intact |

| Load | Booking | Final state |
| --- | --- | --- |
| LD-000034 | TS-MBNEEWBCMC | Delivered; retained assignment history; no POD/payment settlement performed in this run |
| LD-000035 | TS-AOBBYYE5OQ | Cancelled by admin; no refund executed; resources released |
| LD-000036 | TS-V6BLTLXPIQ | Confirmed with reused vehicle and driver assigned |

Booking UUIDs:

- Delivered: `2a8b1638-b8ad-4f88-918f-cc40adf27ff3`
- Cancelled: `49c7450e-4625-46bf-9d0a-0dd6e83a8dff`
- New resource holder: `46f51b40-8612-4cd8-9ab6-7773ba7c7e4e`

Vehicles: `ALLOC036252590A` (released/Idle) and `ALLOC036252590B` (now reserved by
the third booking). Driver `Allocation Driver 1793036252590`, UUID
`00c0ff35-43f3-4753-8bb7-28ac42de62e7`, is now assigned to the third booking.

Reused local logins at `http://localhost:4300/auth/login`:

| Role | Email | Password |
| --- | --- | --- |
| Shipper | `verify-shipper-1793028294862-61@transportseva.test` | `TransportSevaE2E@2026` |
| Fleet owner | `verify-truck-owner-1793028294862-62@transportseva.test` | `TransportSevaE2E@2026` |
| Admin | `admin@test.local` | `password123` |

## Evidence and scope

[Machine-readable headed-browser report](../test-results/booking-performance-20261027-results.json).
The scenarios attach `booking-performance-results.json` and
`fleet-allocation-records.json`; session tokens are excluded.

The read-only profiler is [support/profile-bookings.php](support/profile-bookings.php).
It prints phase/query counts, not passwords, tokens, query bindings, or business
row contents. No database reset, deletion, or migration was performed during
this performance task. Existing failed-run data was preserved.

Only previously configured mock booking tokens were used. No real payment,
refund, payout, or GPS integration was executed. This is functional local
verification, not a production load/capacity certification.
