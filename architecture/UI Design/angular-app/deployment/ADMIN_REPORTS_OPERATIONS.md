# Admin operational reports

Implemented locally on 19/11/2026. `/admin/reports` now selects the dedicated
real report component when the backend is enabled. Company reporting remains
separate.

## Contract and permissions

Both `GET /api/admin/reports` and `GET /api/admin/reports/export` require an
active explicit `admin.reports.view` capability and `marketplace.bookings.view`
on an active, unambiguous Super Admin mapping. The controller checks current
permissions independently of the deployment-wide staff enforcement switch.
The menu and route guard require both grants. Responses are private/no-store.

The endpoints return aggregate counts only: no participant identities, routes,
contact information, booking details or financial amounts. Existing Admin
booking access remains restricted to eligible dispute review. Caller-supplied
owner scopes, unknown parameters and mutation actions are unsupported.

| Parameter | Meaning |
| --- | --- |
| `table` | `loads` (default), `applications` or `bookings` |
| `from`, `to` | Optional inclusive creation dates, `YYYY-MM-DD`, in Asia/Kolkata |
| `status` | `all` (default), or an allowed state for the selected dataset |
| `page`, `per_page` | List only; default 25 groups, maximum 50 per page |

Each dataset uses its own saved `created_at`, filtered in UTC and grouped by
creation day in IST. UTC storage is assumed, as in existing operational reports.
Status is the current recorded state, not a historical snapshot of that day.
Soft-deleted records are excluded; applications on deleted loads are excluded.
Unexpected saved states are grouped as `other` without returning their raw value.
Dates with no records are not fabricated as zero rows. Records without a creation
date appear as "Not recorded" when no date bounds exclude them.

Summary counts cover the entire applied date period. The optional status filter
applies to the grouped table and CSV, not the summary. Table totals and pages
count date/status groups; summary totals count actual records.

CSV contains all matching groups, independent of pagination. More than 10,000
groups returns validation failure asking for narrower filters; export never
silently truncates. Columns are dataset, creation day, current recorded state,
record count, timezone and applied dates. Display/export dates use DD/MM/YYYY;
the updated timestamp uses DD/MM/YYYY hh:mm AM/PM. The existing safe CSV helper
handles escaping and spreadsheet formulas.

## Local activation

The existing `admin@test.local` account received one dedicated read grant after
a fresh verified backup. No new users, staff mappings, unrelated grants or
deployment-wide enforcement changes were made.

```powershell
php artisan reports:prepare-access --actor=EXISTING_SUPER_ADMIN_UUID
php artisan reports:prepare-access --actor=EXISTING_SUPER_ADMIN_UUID --apply --backup=ABSOLUTE_SQL_BACKUP_PATH --backup-sha256=VERIFIED_SHA256
```

The command previews by default. Apply verifies database identity, backup SHA-256
and completion footer, then adds only the missing permission/role association.
It records a security audit and linked bell item. Replays are idempotent. An
inactive existing capability fails closed. This tool refuses staging/production;
review non-local grants separately. Deploy frontend/backend revisions together.

To disable access, remove only the reviewed reports role association through the
approved access process. Preserve other grants and audit history. No restore,
schema rollback or table deletion is needed.

## UI and verification

The screen has applied-filter tracking, server pagination, loading animation,
duplicate locking, retry, permission-denial and successful-empty states, with
English/Hindi copy and reduced-motion support. Reads time out after 30 seconds;
exports after 60 seconds. Navigation cancels subscriptions. Refresh removes old
data before reading. Export uses the displayed applied filters even when draft
inputs differ, and permission denial clears private results.

The API adapter rejects incomplete/malformed counts and mismatched filters.
There is no sample-data fallback. For an independent SQL comparison during the
headed test, set `E2E_ADMIN_REPORT_EXPECTED_TOTALS` to JSON containing `loads`,
`applications` and `bookings`. Without it, browser checks compare API, UI and CSV.

See [executed tests and preservation evidence](../e2e/ADMIN_REPORTS_2026-11-19.md).
