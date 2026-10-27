# Fleet allocation safeguards

Scope: local marketplace bookings, registered fleet and subcontracted vehicle
registrations. Real payments, refunds, payout, and GPS are excluded. Tokens used
to confirm browser fixtures must come from the configured mock provider.

## Cases

| ID | Action | Expected outcome | Coverage |
| --- | --- | --- | --- |
| ALLOC-01 | Assign one registered vehicle to two confirmed bookings | Only the first assignment succeeds; the other returns 422 without changing its booking | API regression and headed stale-tab test |
| ALLOC-02 | Send simultaneous registered-vehicle assignments on separate DB connections | Exactly one 200 and one 422; only one booking contains the assignment | Two standalone PHP workers against the isolated test database |
| ALLOC-03 | Send simultaneous driver assignments | Exactly one 200 and one 422; vehicle snapshots remain intact | Two PHP workers and headed stale-tab test |
| ALLOC-04 | Different providers subcontract differently formatted copies of one registration | Normalization and the shared reservation mutex allow only one active allocation | Two PHP workers |
| ALLOC-05 | Reload vehicle and driver selectors after another booking wins | Busy resources are disabled; the vehicle list shows Reserved or On Trip; stale submission displays an inline conflict | Headed browser |
| ALLOC-06 | Request cancellation | Resources stay reserved while admin review is open | API regression and headed browser |
| ALLOC-07 | Admin cancels after the phone-review decision | Both resources become reusable; cancelled booking retains assignment history | API regression and headed browser |
| ALLOC-08 | Assign, load, confirm loading, start, and complete delivery | Availability changes to On Trip, then releases both resources at delivery without waiting for payment | API regression and headed browser |
| ALLOC-09 | Assign resources to awaiting-token, cancelled, or delivered bookings | Invalid operational changes return 422; historical assignment snapshots are unchanged | API regression, plus terminal-state checks in the browser suite |
| ALLOC-10 | Stall the bookings list response | Loader ends after 30 seconds with a Retry action; a successful retry restores existing bookings | Headed browser with an explicitly intercepted list request |

## Execution

Frontend (headed Chrome, one worker):

```powershell
npx playwright test e2e/fleet-allocation.spec.ts --headed --workers=1
```

The suite reuses verified local shipper/fleet-owner accounts by default. Override
them with `E2E_SHIPPER_EMAIL` and `E2E_OWNER_EMAIL` when appropriate. The optional
`E2E_ALLOCATION_SETUP_REPORT` points to an earlier Playwright JSON report and
resumes its fixtures only after asserting all three bookings are confirmed and
have no vehicle or driver assignment. It never clears an assignment or resets
booking state. Each run attaches `fleet-allocation-records.json` without tokens.

Backend, from `transportseva-api`:

```powershell
php artisan test --filter=MarketplaceAllocationTest
php artisan test --filter='MarketplaceWorkflowTest|MarketplaceCancellationRequestTest'
```

Concurrency workers refuse to run outside the testing environment or against a
database whose name does not end in `_test`. The browser uses `transportseva`;
the standalone concurrency tests use `transportseva_employee_test`. Browser
stale-tab submissions check UI and server rejection, while the PHP workers
check actual simultaneous DB contention: the Windows artisan HTTP server is
single-process and cannot establish that concurrency guarantee by itself.

## Data safety

The only schema change is the additive
`2026_10_26_220000_create_marketplace_resource_reservations_table` migration.
It creates a unique mutex row per vehicle registration or driver UUID. Booking
workflow snapshots are retained when reservations are released. Active legacy
assignments are checked as well, without rewriting existing bookings. No
database reset, drop, table truncation, or test-record deletion is permitted.
