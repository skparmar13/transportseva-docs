# Fleet allocation verification — 26–27/10/2026

Update: the complete headed allocation scenario subsequently **passed** after
the booking performance fixes on 27/10/2026. See
[the successful follow-up](BOOKING_PERFORMANCE_RUN_2026-10-27.md) for evidence and
current booking states. The earlier diagnostic history below is retained.

Earlier status: backend verified; full headed allocation flow was incomplete.

## Results

| Area | Result | Evidence |
| --- | --- | --- |
| Registered vehicle exclusivity | Passed, backend | Duplicate assignment rejected; busy metadata identifies its booking |
| True concurrent vehicle/driver assignment | Passed, backend | Separate PHP processes and DB connections returned exactly one 200 and one 422 per resource |
| Cross-provider subcontract race | Passed, backend | Differently formatted copies of the same registration cannot be reserved simultaneously |
| Admin cancellation/release/history | Passed, backend; UI pending | Open review retains resources; admin cancellation releases both; snapshots remain; resources can be reassigned |
| Delivery/release/history | Passed, backend; UI pending | Delivery releases vehicle and driver before final settlement; reuse succeeds |
| Invalid booking stages | Passed, backend | Awaiting-token/cancelled/delivered bookings reject operational assignments |
| Visible stale-tab vehicle conflict | Passed, partial browser execution | Competing requests returned 200 and 422; conflict appeared in the losing dialog; the subsequent list reload timed out |
| Stalled list recovery | Passed, headed browser | Two runs explicitly held the list response; the loader ended after 30 seconds and Retry loaded saved bookings |
| Full headed allocation → cancellation → delivery → reuse | Not completed | Normal list requests timed out; a later attempt was interrupted by computer sleep; the two latest browser attempts ended when Chrome closed |
| Production build | Passed | Initial bundle 984.12 kB; existing 500 kB warning remains |

The combined command below passed **19 tests / 280 assertions**: 7 allocation
tests / 64 assertions and 12 existing workflow/cancellation tests / 216 assertions.

```powershell
php artisan test --filter='MarketplaceAllocationTest|MarketplaceWorkflowTest|MarketplaceCancellationRequestTest'
```

Backend tests ran against `transportseva_employee_test`. Visible browser records
are in the existing `transportseva` database. No new login users were created in
this allocation run; the already verified local users below were reused.

## Implemented changes

- Added a globally unique vehicle/driver reservation mutex and transactional
  booking updates. Existing active workflow assignments are checked as well.
- Registered resources must belong to the provider and be administratively
  available. Cancelled and delivered workflows cannot be operationally changed.
- Admin cancellation and delivery release resources while retaining history.
- Vehicle API/selector/list expose Reserved or On Trip; busy drivers include
  their assigned vehicle and are disabled in the assignment selector.
- Vehicle assignment conflicts now appear inside the modal.
- Booking-list loading has a 30-second timeout and Retry recovery. Removed the
  unnecessary upfront fleet fetch; the assignment dialog fetches it on demand.

Only the additive
`2026_10_26_220000_create_marketplace_resource_reservations_table` migration was
applied to the main database and isolated test database. No database was dropped,
reset, truncated, or recreated, and no test/business records were deleted.

## Reused credentials

Login: `http://localhost:4300/auth/login`.

| Role | Email | Password |
| --- | --- | --- |
| Shipper | `verify-shipper-1793028294862-61@transportseva.test` | `TransportSevaE2E@2026` |
| Fleet owner | `verify-truck-owner-1793028294862-62@transportseva.test` | `TransportSevaE2E@2026` |
| Existing admin, intended cancellation reviewer | `admin@test.local` | `password123` |

The current allocation UI run did not reach the admin login/decision. These are
local test credentials, not production accounts.

## Retained records

Read-only API verification before the successful follow-up confirmed these
earlier states; the last three bookings have since advanced:

| Load | Booking | State | Assigned vehicle |
| --- | --- | --- | --- |
| LD-000031 | TS-JNZMDJGL5E | Confirmed; no driver | None; lost the stale-tab vehicle race |
| LD-000032 | TS-J8MAI1EI7T | Confirmed; no driver | ALLOC034312701A; won the stale-tab vehicle race |
| LD-000033 | TS-4CFFOIWJZ2 | Confirmed; no assignments | None |
| LD-000034 | TS-MBNEEWBCMC | Confirmed; no assignments | None |
| LD-000035 | TS-AOBBYYE5OQ | Confirmed; no assignments | None |
| LD-000036 | TS-V6BLTLXPIQ | Confirmed; no assignments | None |

The last three were reused by the successful follow-up, without resetting them:

| Load UUID | Booking UUID |
| --- | --- |
| `4a2ed6b9-5d5b-4ecf-ae66-10c55800845d` | `2a8b1638-b8ad-4f88-918f-cc40adf27ff3` |
| `c79b9a47-fdda-42cb-952c-2ab6f98dd09c` | `49c7450e-4625-46bf-9d0a-0dd6e83a8dff` |
| `f0ee79e2-cadc-4372-a0a2-690212674c9b` | `46f51b40-8612-4cd8-9ab6-7773ba7c7e4e` |

Their registered vehicles are `ALLOC036252590A` and `ALLOC036252590B`.
Driver: `Allocation Driver 1793036252590`, UUID
`00c0ff35-43f3-4753-8bb7-28ac42de62e7`.

## Evidence and resumption

- [Vehicle conflict and successful timeout-recovery run](../test-results/fleet-allocation-20261026-followup-results.json)
- [Sleep-interrupted run and second successful timeout-recovery test](../test-results/fleet-allocation-20261026-final-results.json)
- [Latest interrupted headed attempt](../test-results/fleet-allocation-20261027-followup-results.json)
- [Detailed test cases](FLEET_ALLOCATION_TEST_PLAN.md)

The initial stopped browser run encountered a stale Angular compiler overlay;
restarting the verified TransportSeva dev server rebuilt cleanly. Subsequent
browser attempts used the corrected source. The sleep interruption explicitly
reported `ERR_NETWORK_IO_SUSPENDED`. Later attempts reported
`Target page, context or browser has been closed`; no matching recent Windows
Application error event was found, so the reason for closure is not established.

For a new visible run, leave the Chrome test window open and create fresh test
fixtures rather than trying to reuse bookings whose workflow has now advanced:

```powershell
Remove-Item Env:E2E_ALLOCATION_SETUP_REPORT -ErrorAction SilentlyContinue
npx playwright test e2e/fleet-allocation.spec.ts --grep 'competing bookings' --headed --workers=1
```

The optional resume mode checks that saved bookings are still confirmed and
unassigned before using them. It does not reset state if they have changed.
The visible Retry path is exercised for intermittent list timeouts and records
each retry in the attached evidence. The successful follow-up required none.
Real payment collection, refund/payout execution, and real GPS were skipped.
