# Transporter Reports — 15/11/2026

## Delivered behavior

The Transporter Reports route now has three real operational views:

| View | Canonical scope | Date basis |
| --- | --- | --- |
| Posted loads and received counts | Loads posted by the signed-in Transporter | Load creation date in IST; received application/linked booking counts cover those loads' lifetime |
| Applications sent | Applications whose applicant is the signed-in Transporter | Application creation date in IST; linked non-cancelled booking is checked across the selected applications' lifetime |
| Bookings and delivery | Bookings where the Transporter is owner or provider | Booking creation date in IST |

The API is `GET /api/account/transporter/reports`; the full matching private
CSV is `GET /api/account/transporter/reports/export`. All API scopes require an
actual Transporter account. The UI initially selects posted loads. Summary
totals use the selected date period; search and paging affect only the selected
table. Statuses are current states, not historical snapshots.

The implementation composes the existing posted-load and sent-application
report logic with separate strict Transporter owner/provider adapters. It uses
the existing combined-party trip projection for booking rows. Existing Shipper
and Truck Owner endpoint authorization is retained.

Received application counts and sent applications remain distinct. Proposed
application vehicles are labelled separately from actual booking assignments.
Linked bookings require matching application/load/provider and a canonical live
load owner. Both-party bookings are counted once. Damaged/deleted load links
do not expose unrelated metadata.

The page supports filters, server paging, genuine zero/no-match states,
loading/error/Retry, disabled duplicate actions, current status/POD breakdowns,
English/Hindi and Transporter load/requests/trip links. Exports use displayed
applied filters rather than unsubmitted form drafts, include all matches across
pages, and fail explicitly over 10,000 rows. Shared CSV safeguards include UTF-8
BOM, proper quoting, formula neutralization and formatted IST dates.

## Executed verification

| Check | Result |
| --- | --- |
| Backend report suites | 39 passed, 531 assertions: Transporter plus existing Shipper/Truck Owner regressions |
| Full Angular suite | 376 passed |
| Source audit | 13 passed |
| Visible browser | Both scenarios passed across initial controlled-data run and final real-account rerun |
| Production build | Passed: initial 986.24 kB under unchanged 1 MB error limit; existing 500 kB warning remains |
| PHP formatting/syntax and whitespace | Passed |

Backend tests run transactionally against the guarded
`transportseva_employee_test` database with fake mail and stray HTTP blocked.
Coverage includes strict identity/role/onboarding, canonical owner/provider and
applicant scopes, creator non-authority, overlapping parties, separate received
and sent counts, independent inclusive IST cohorts, current states, pagination,
literal search, deleted/damaged links, complete private CSV, formula safety,
export limits, invalid filters and read-only behavior.

The first browser run's real-account scenario stopped on a test-only label
mismatch (`Posted loads` versus the rendered `Loads & applications`). Its
controlled-data scenario passed. After correcting the test label, the real
scenario passed in 1.6 minutes without a product change.

## Real versus controlled browser coverage

Existing account:
`qa-onboarding-1793463324476-transporter@transportseva.test`.
No main users, loads, applications or bookings were created for this work.

The real-account scenario compared the three API tables and summary totals with
the actual account data, independently checked posted-load and sent-application
totals, verified private/BOM/IST CSV responses, zero/export-disabled states where
applicable, all tabs, reload, reversed-date correction, a future-date zero
cohort, HTTP 503/Retry and rejection of caller-selected ownership/export paging.

The populated browser scenario used explicitly controlled report and CSV
responses. It verified all three row layouts, received versus sent counts,
proposed versus actual vehicles, escaped goods, paging, exact Transporter links,
failed export preserving rows, applied-versus-draft export filters, exact CSV
download bytes/filename, no-match preserving totals and a narrow viewport.
These controlled rows are not live Transporter records. Populated database
scoping and actual generated CSV behavior are covered separately by backend
tests; no populated live marketplace lifecycle is claimed here.

Artifacts:
`test-results/transporter-reports-2026-11-15` (controlled case passed; original
real case failed on the label),
`test-results/transporter-reports-real-final-2026-11-15` (real case passed).
Browser guards blocked business mutations and external hosts, permitting only
authentication lifecycle POSTs and read requests.

## Main data preservation

Complete ordered-row counts and SHA-256 hashes matched before and after for
loads (39), applications (53), bookings (26), settlements (2), token orders (27)
and KYC profiles (4). Comparison artifact:
`test-results/transporter-reports-integrity-2026-11-15.json`.
Authentication bookkeeping is outside that six-table comparison. No database
migration, reset, import or restore was run.
