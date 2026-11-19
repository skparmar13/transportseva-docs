# Real Admin Reports - 19/11/2026

Completed the next Admin screen: real operational reports for loads,
applications and bookings. Backend routing no longer selects the shared sample
report screen. Company reporting remains separate.

Delivered creation-date and table-status filters, independent current-state
summaries, server pagination, full matching CSV export, applied-filter tracking,
animated loading/export, duplicate locking, bounded reads, cancellation,
error/retry/denial, English/Hindi and genuine empty states. No participant or
financial details are returned. Aggregate reporting does not widen the existing
Admin dispute-only booking access.

## Live totals and exports

Independent read-only SQL counts captured before activation were supplied to
the headed browser suite. The UI, actual report API and complete CSV agreed:

| Dataset | Actual records | Exported date/status groups |
| --- | ---: | ---: |
| Loads | 39 | 17 |
| Applications on live loads | 53 | 22 |
| Bookings | 26 | 18 |

Each dataset uses its own creation date, grouped in IST, and its current saved
status. These are not historical status snapshots. Summary counts cover the
date period; status filtering affects table/export only. No main business
records were created to obtain these totals.

## Checks executed

| Check | Result |
| --- | --- |
| Focused report/API/navigation Angular checks | 16 passed |
| Full final Angular regression | **464 passed** |
| Combined AdminReports, AdminDashboard, PlatformStaffPolicy and ShipperReports backend suites | **48 passed, 515 assertions** |
| Source audit | **18 passed**, inventory regenerated |
| Visible Chrome acceptance | **4 passed** |
| Final production browser/SSR build | Passed, 11 prerendered static routes |
| Focused PHP syntax/formatting and repository whitespace checks | Passed |

The build retains the existing initial-bundle warning: 954.70 kB against a
500 kB warning threshold; the unchanged 1 MB error limit passes. This is local
feature acceptance, not a production deployment or all-screen sign-off.

Backend tests use `transportseva_employee_test`, require testing plus an
`*_test` database, fake mail, block external HTTP and roll back fixtures.
They cover anonymous/narrow-role denial, accidental grants with enforcement off,
fresh grant revocation, strict scope/date/status validation, independent cohorts,
IST boundaries, soft deletion, output allowlists, full filtered exports beyond
one page, export-size rejection and additive/idempotent audited local access.
The export-size guard is exercised with a server-only reduced-limit test
subclass; production remains 10,000 groups. Initial fixture errors involving
required vehicle type, non-fillable timestamps and database date/enum limits
were corrected in test fixtures without relaxing production constraints.

## Browser cases

| Flow | Evidence | Result |
| --- | --- | --- |
| Anonymous request, Super Admin login, access bell, all three datasets, complete CSV, filters, unapplied draft export, reload | Actual local API and existing records, independently compared with SQL | Passed |
| Held refresh, duplicate clicks, injected 503, retry; held failed export and real retry download | Browser-only failure/delay followed by real API recovery | Passed |
| Operations and Finance menu, direct API/export and route denial | Real existing staff sessions; 403 and guard redirect | Passed |
| Two-page results and Hindi empty state | Explicit browser-only response fixtures; no fixture writes to main DB | Passed |

The real run exported all 17/22/18 groups and verified their record sums.
A separate real October/open export retained the applied filters after draft
form edits. The paging case uses 26 controlled groups because live grouped
datasets fit one page; backend pagination/full-export tests use transactional
fixtures. Network traffic was local-only, business writes were blocked, and the
unexpected-write array was empty. Authentication and bell-read bookkeeping were
allowed. The captured real screen was visually inspected.

Existing identities reused; no accounts/passwords were created or changed:

| Purpose | Account |
| --- | --- |
| Authorized Super Admin | `admin@test.local` |
| Denied Operations | `qa-staff-20261029-operations@transportseva.test` |
| Denied Finance | `qa-staff-20261029-finance@transportseva.test` |

## Backup and preservation

Before local access activation, a full verified backup was exported:

- `.local-backups/transportseva-before-admin-reports-2026-11-19.sql`
- 1,164,261 bytes; 109 CREATE TABLE statements and completion footer verified.
- SHA-256: `8d590b6d13bc9d52c1af65f18e82ed0eff1b4027c81a4feeeae69df9fca28cd2`.

Exactly one permission and one role association were added for
`admin.reports.view`, with an audit and linked bell item. The existing local
Super Admin mapping and enforcement defaults were retained. Activation refuses
staging/production. All 109 table names and full-row hashes/counts of these
13 checked sets were preserved:

| Table | Rows |
| --- | ---: |
| loads / load_applications / marketplace_bookings | 39 / 53 / 26 |
| marketplace_settlements / booking_token_orders | 2 / 27 |
| marketplace_kyc_profiles / marketplace_reviews / marketplace_disputes | 4 / 13 / 7 |
| account_support_tickets / contact_inquiries | 9 / 7 |
| newsletter_subscribers / newsletter_consent_requests | 6 / 9 |
| role_user | 11 |

No schema migration, reset, drop, seeder, import or restore was executed. This
comparison excludes authentication, notification and new access/audit records;
it is not a full-database row audit.

## Reproduce and artifacts

```powershell
npm.cmd run test:ci -- --reporters=dots
node --test audit/screen-source-audit.test.mjs
node audit/screen-source-audit.mjs --emit
npm.cmd run build
npx.cmd playwright test e2e/admin-reports.spec.ts --headed --output=test-results/admin-reports-2026-11-19 --reporter=list
```

From the backend directory:

```powershell
php artisan test --filter='AdminReportsTest|AdminDashboardTest|PlatformStaffPolicyTest|ShipperReportsTest'
```

- Browser artifacts: `test-results/admin-reports-2026-11-19`.
- Real-case directory contains `real-report-evidence.json`, screenshot,
  `real-loads.csv`, `real-applications.csv`, `real-bookings.csv` and
  `applied-loads.csv`.
- Preservation: `test-results/admin-reports-integrity-2026-11-19.json`.
- Final build log: `.local-runtime/admin-reports/final-build.log`.
- [Contract and local access operations](../deployment/ADMIN_REPORTS_OPERATIONS.md).

Backups and generated evidence remain private Git-ignored local artifacts.
