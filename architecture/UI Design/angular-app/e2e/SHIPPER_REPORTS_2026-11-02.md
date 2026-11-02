# Real Shipper Reports — 02/11/2026

## Delivered scope

Shipper Reports now uses authenticated, owner-scoped marketplace records instead
of the shared sample fleet/driver/revenue/GPS tables and sample CSV.

| Report | Authoritative source | Meaning |
|---|---|---|
| Loads and applications | Own non-deleted loads and live application rows | Posted-load cohort, current load states, lifetime application/pending counts and non-cancelled linked booking counts |
| Bookings and delivery | Canonical owned non-deleted marketplace bookings | Created-booking cohort, current operational stages, actual assignments, recorded dates and POD states |

The date range is an inclusive creation-date cohort in Asia/Kolkata (IST), using
UTC half-open boundaries internally. Loads and bookings each use their own
creation date; application counts cover the entire lifetime of selected loads.
These are current states of those cohorts, not a historical point-in-time audit
or counts of delivery events occurring during the selected period.

Summary totals cover the whole date cohort. Search affects only the chosen
table, and pagination affects only its rows. The applied period/search are
displayed explicitly. Refresh, pagination and export use applied filters, not
unsubmitted form edits. Changing filters remains possible after a failure.

The interface includes real server pagination/search, zero/error/retry states,
loading/export animations, duplicate-action guards, English/Hindi copy, standard
DD/MM/YYYY hh:mm AM/PM record dates and exact load/booking/trip links.

No payment, revenue, commission, payout, GPS, on-time-rate or duration-estimate
analytics were added. Delivered means operational delivery, not financial
settlement. Other-role Reports still use the legacy prototype and are not
certified by this shipper-only implementation.

## API, authorization and export

Read-only endpoints:

    GET /api/account/reports
    GET /api/account/reports/export

The server requires the actual customer/shipper user type and canonical
posted-by/booking-owner UUID. Creator/provider relationships and a client role or
owner/company query cannot grant access. Other roles receive 403 even when staff
enforcement is off; existing authentication and mandatory onboarding still apply.

Unrecognized query fields are rejected. Search is limited to 100 characters and
SQL wildcard characters are literal. Per-page is 1–50; dates must be valid
YYYY-MM-DD in 1900–2100 with From not after Through. Deleted and unrelated load
metadata cannot leak through a damaged booking association.

Counts use live applications, not the denormalized applications_count column.
Two applications/providers for one load remain two applications; multiple
non-cancelled bookings for a load do not double-count the number of loads with
bookings. Cancelled or foreign-owner linked bookings are excluded from that
specific measure. Awaiting-token bookings are labelled awaiting confirmation,
not dispatched or paid.

The CSV is generated server-side from all matching owned rows, not just the
visible page or a browser sample. Export rejects page/per_page and never silently
truncates: more than 10,000 matches receives 422 with instructions to narrow
filters. CSVs are UTF-8/BOM, preserve quoting/Unicode/newlines and neutralize
spreadsheet formulas, including leading whitespace/control characters. Dates
use IST and DD/MM/YYYY hh:mm AM/PM; absent/invalid event times are blank rather
than inferred. Filename construction is fixed/safe. Responses are private,
no-store, and exports include nosniff and timezone headers.

Each report/export uses a read transaction and re-queries current saved records.
An export is not a frozen archive of a previous browser read; concurrent
legitimate activity may change records between separate requests. No report
entity, saved dataset, migration, grant, notification or business mutation was
introduced. A read/export does not fabricate a new business-event bell.

Implementation:

    transportseva-api/app/Services/ShipperReportService.php
    transportseva-api/app/Http/Controllers/ShipperReportController.php
    transportseva-api/tests/Feature/ShipperReportsTest.php
    transportseva-api/routes/api.php
    src/app/core/api/api-shipper-report.service.ts
    src/app/features/shipper/reports/
    e2e/shipper-reports.spec.ts

## Verification

| Check | Result | Scope |
|---|---|---|
| New backend Reports suite | 14 passed, 162 assertions | Counts, multiple applicants, owner/deleted boundaries, IST midnight inclusivity, lifetime applications, filters, actual assignments, malformed timestamps, complete CSV, formula safety and actual 10,001-row cap rejection |
| Expanded backend regression | 132 passed, 1,460 assertions | Reports, Documents, Trips, Support, Contact enquiries, staff policy, onboarding, business profiles, dashboards and vehicle details |
| Angular suite | 277/277 passed | 15 new Report UI tests and 4 new HTTP contract tests, plus existing suites |
| Production build | Passed, exit 0 | Initial 996.57 kB; existing 1 MB error limit unchanged; existing 500 kB warning remains |
| Source audit | 4/4 passed | Inventory regenerated with 146 routes / 70 concrete components |
| TypeScript / PHP syntax / whitespace | Passed | No-emit compilation, new PHP files and both worktrees |
| Visible Chrome regression | 18 passed, 0 failed/skipped/flaky | Six Reports, six Documents and six Trip checks; all six Reports checks reconfirmed after final timestamp hardening |

Backend suites are guarded DatabaseTransactions tests in the existing
transportseva_employee_test database. The 10,001-row export-cap fixture is created
and rolled back there only. No migration, reset, import, seeding, real payment,
GPS or outbound delivery occurred. Main-database accounts were not created.

### Visible browser flow

Only local GET/HEAD/OPTIONS and normal authentication login/refresh/logout POSTs
are permitted in the browser contexts. Business writes and external hosts are
blocked. Existing QA accounts are reused; auth traces/videos are disabled.

| Scenario | Coverage |
|---|---|
| Load/application report | Independently recount own loads, per-load applications and owned bookings through existing APIs; compare totals |
| Real pagination and complete export | Browser-only request override obtains real per_page=1 API responses, without new main records; CSV still includes every matching row |
| Applied filters | An unfinished search edit changes neither export nor the next page until submitted |
| Booking report | Saved stages/actual assignments, a real reference search, matching server CSV, exact Trip and Booking destinations |
| Empty/cross-account | Genuine zero report, disabled empty export, foreign-reference search/export reveals no records; forged owner query 422; provider read/export 403 and portal redirect |
| Failure/date correction | Pending spinner and duplicate guard; honest 503/retry; reversed dates are rejected without concealing the editable filters |
| Export failure | Preparation spinner, one request while disabled, refresh blocked, honest error with no synthesized file/success |
| No-match/language/layout | Cohort totals remain intact for empty table matches; Hindi and narrow viewport |
| Existing integrations | All six Documents and six Trip regression scenarios are included separately |

No user-owned server was stopped/restarted. Initial browser preflight found
neither local port 4300 nor 8080 listening. The missing local development servers
were started, followed by two clean visible navigations with no Vite overlays.
No error overlay was suppressed.

The first collection was interrupted after an existing provider route-guard
check exceeded its 12-second redirect wait and remained on the global Loading
screen. API logs showed 2–3 second bootstraps with queued requests. Six completed
scenarios had passed (five Documents plus the new load/application/CSV report
scenario); this partial collection was not counted as a passed suite. Its guard
failure screenshot/context remains in the initial artifact directory; the
interruption did not finalize a JSON report.

The temporary API process had not loaded the bundled Zend OPcache extension.
Only that newly created test process was replaced, enabling the installed
php_opcache.dll via process flags (enable_cli=1, validate_timestamps=1 and
revalidate_freq=0). No php.ini, .env, security guard, permission, application
timeout or test assertion was changed. A warmed unauthenticated /api/auth/me
probe then returned the correct 401 in about 0.224 seconds, versus multi-second
requests in the initial run. This is local test-runtime configuration, not a
production-server deployment or a production performance guarantee.

The corrected 18-case collection passed in 203.3 seconds. The focused six-case
Reports rerun also passed without changing assertions or timeouts. Malformed
legacy relative/impossible event dates are returned as null in report JSON and
blank in CSV, so the shared UI formatter cannot create a new timestamp from
words such as yesterday; this guard does not change stored records.

Evidence:

- [Full 18-case browser report](../test-results/shipper-reports-final-2026-11-02.json)
- [Final focused Reports report](../test-results/shipper-reports-verified-2026-11-02.json)
- [Reports screenshot](../test-results/shipper-reports-loads.png)
- [Hindi/narrow screenshot](../test-results/shipper-reports-narrow-hindi.png)
- [Retained initial guard-timeout artifacts](../test-results/shipper-reports-browser-run/)

### Independently verified main-account figures

| Measure | Actual value |
|---|---:|
| Owned loads | 9 |
| Live applications received | 9 |
| Pending applications | 0 |
| Loads with a non-cancelled owned booking | 7 |
| Owned bookings | 9 |
| Planned / delivered / paused / cancelled bookings | 4 / 2 / 1 / 2 |
| Approved POD / delivered without approved POD | 1 / 1 |
| Load rows exported while only one real row was displayed per page | 9 |

The independently counted visible account had one application per load, so its
multiple-applicant load count was zero. The multiple-truck-owner/application
aggregation scenario was verified with guarded transactional fixtures, not
claimed as a newly created main-database browser journey.

All nine stored load states say booked, while seven have a non-cancelled owned
booking. These are different measures: the report does not rewrite stored load
statuses or silently count cancelled bookings as active links.

The filtered booking CSV used TS-MBNEEWBCMC, UUID
2a8b1638-b8ad-4f88-918f-cc40adf27ff3, and contained exactly one matching row.
The full load CSV SHA256 was
2128de5cd6fd64dbf8e1a0a481052eba158a1f33ed6db485149ecc53c140f226;
the filtered booking CSV SHA256 was
7153216b2866bd0259ca74c2335803486d48bbc209b236751f86ee826f1462a2.
Browser-downloaded bytes matched the respective actual server exports.

### Existing QA accounts

Development-only credentials, not production accounts:

| Use | Email | Password |
|---|---|---|
| Primary shipper | verify-shipper-1793028294862-61@transportseva.test | TransportSevaE2E@2026 |
| Empty shipper | qa-recovery-1793377725393@transportseva.test | RecoveryFinal@2026! |
| Provider boundary | verify-truck-owner-1793028294862-62@transportseva.test | TransportSevaE2E@2026 |

Existing canonical booking used by the integration checks:
TS-KOQKWAZAA8, UUID 5c18b398-8a75-4017-9ecf-e268282a4852.
No booking/assignment/POD/payment or account password/membership was changed.

## Data preservation and readiness boundaries

Before tests, a read-only per-record SHA256 baseline was captured for loads,
applications, bookings, settlements, token orders and KYC profiles. Baseline:
107 base tables, 103 users, 11 memberships; 37 loads, 51 applications, 24 bookings,
2 settlements, 27 token orders and 3 KYC profiles. Local staff enforcement true.
After the final visible and backend checks, the 02/11/2026 04:35:57 PM UTC
(10:05:57 PM IST) read-only comparison matched every original row hash and row
count in all six tables. Base tables/users/memberships remain 107/103/11 and local
staff enforcement remains true. No added, deleted or modified domain/KYC rows
were detected. Normal authentication session/last-login bookkeeping is not
represented as an unchanged whole-users-table hash.

The source inventory now classifies Shipper's 19 routes as 15 API-connected and
4 deferred payment/GPS routes. No non-deferred shipper route remains classified
as a prototype, but API-connected is not full production certification or proof
of every action, historical-data repair or external provider.

Recommended next acceptance step: a full Shipper screen/action sweep, keeping
payments, GPS and real provider delivery explicitly excluded. Other-role legacy
screens, Company tenancy and staging readiness remain separate work.
