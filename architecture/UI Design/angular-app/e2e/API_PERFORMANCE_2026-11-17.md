# Local homepage/API performance verification — 17/11/2026

Completed: the active API on port 8080 now uses a repeatable local launcher with
per-process OPcache. The frontend remains on port 4300. Temporary comparison
workers on 8088/8089 were stopped after verification.

## Finding and measured result

The installed PHP 8.3.3 CLI had no loaded OPcache extension. A diagnostic process
measured cumulative autoload/application/bootstrap times of 207/383/2719 ms.
PDO connection took 17 ms. In-process reviews used one SQL query taking 2.28 ms;
recent loads used two queries taking 1.03 ms. These observations pointed to
repeated PHP bootstrap rather than slow homepage SQL.

Five sequential warm requests per endpoint were measured on each local worker,
using the same backend, PHP installation and database. All 30 requests returned
200. The uncached control used port 8088; the optimized API used port 8080.

| Endpoint | Uncached mean | Optimized mean | Speedup |
| --- | ---: | ---: | ---: |
| `/up` | 2,116.77 ms | 250.54 ms | 8.45× |
| `/api/public/reviews?limit=6` | 2,238.11 ms | 253.80 ms | 8.82× |
| `/api/loads/recent?per_page=20` | 2,198.19 ms | 252.39 ms | 8.71× |

These are local warm request timings, not production throughput measurements.
Cold startup during final warmup still took 2,701.92 ms. Earlier busy-period
observations were not used as the matched benchmark baseline.

## Implementation

- `deployment/local-api.ps1` loads the installed matching OPcache DLL only for
  its owned loopback PHP process, checks occupied ports, warms public reads and
  records ownership/log paths outside disposable test output.
- Source timestamps are checked every request. No global `php.ini` change,
  Laravel response/data cache, application controller edit or migration was made.
- `deployment/measure-local-api.ps1` records status and timing samples without
  saving response bodies or credentials.
- `deployment/local-api.tests.ps1` covers ownership checks and source freshness.
- `e2e/home-api-performance.spec.ts` checks actual homepage records and existing
  account permissions in headed Chrome.

See [restart and rollback instructions](../deployment/LOCAL_API_PERFORMANCE.md).

## Verification flow

| Check | Result |
| --- | --- |
| Public API reads and anonymous private API denial | Passed |
| Occupied port refuses replacement and preserves ownership | Passed |
| Mismatched process creation time refuses stop; server stays healthy | Passed |
| Actually cached fixture reflects an edit without worker restart | Passed |
| Verified ownership permits stopping the test worker | Passed |
| Launcher integration harness | **11 checks passed** |
| Homepage renders API review/load records; warm feed responses below 2 seconds | Passed |
| Homepage data equals uncached control data | Passed in separate control comparison |
| Shipper login, exact identity, own report 200/no-store, Transporter report 403 | Passed |
| Truck Owner login, exact identity, own report 200/no-store, Transporter report 403 | Passed |
| Final headed browser suite, without a control server dependency | **3 tests passed** |
| Temporary comparison workers removed; final main API health | Passed |

The first account-check attempt used an incorrect Shipper report path in the
test. It was corrected to the real `account/reports` route, then the full suite
passed. No application route was changed to accommodate the test.

## Existing accounts used

No users, loads or bookings were created in this task. The existing QA accounts
were used for real UI login and read-only permission checks:

| Role | Email | UUID |
| --- | --- | --- |
| Shipper | `verify-shipper-1793028294862-61@transportseva.test` | `8fbee589-49f2-4a3f-bf8d-7e2013614e02` |
| Truck Owner | `verify-truck-owner-1793028294862-62@transportseva.test` | `ab8b83d6-cbde-4331-a287-082a48190a10` |

Browser business writes were blocked; authentication bookkeeping was allowed.
The integrity comparison preserved all 109 schema table names and complete
row hashes/counts of the six checked marketplace tables:

| Table | Rows before/after |
| --- | ---: |
| `loads` | 39 |
| `load_applications` | 53 |
| `marketplace_bookings` | 26 |
| `marketplace_settlements` | 2 |
| `booking_token_orders` | 27 |
| `marketplace_kyc_profiles` | 4 |

This comparison excludes authentication bookkeeping and does not claim a full
database row audit. This task also does not certify every homepage screen state.

## Local evidence

- `test-results/local-api/benchmark-8080.json`
- `test-results/local-api/benchmark-8088.json`
- `test-results/local-api/launcher-checks.json`
- `test-results/home-api-performance-control-2026-11-17/.last-run.json`
- `test-results/home-api-performance-final-2026-11-17/.last-run.json`
- `test-results/home-api-performance-verified-2026-11-17/.last-run.json`
- `test-results/api-performance-before-2026-11-17.json`
- `test-results/api-performance-integrity-2026-11-17.json`

Runtime state/logs live under `.local-runtime/api`, which is Git-ignored and
survives normal Playwright output cleanup. Generated test evidence can be
replaced by later runs. The Markdown report preserves the measured results.
