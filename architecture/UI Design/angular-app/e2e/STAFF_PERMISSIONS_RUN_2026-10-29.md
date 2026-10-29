# Local staff permissions - first-phase verification

Date: 29/10/2026 (Asia/Calcutta).
Status: **First-phase checks enabled locally and verified; full staff-management rollout is not complete.**

The owner approved the five-role split, authorized selecting an initial admin,
and then explicitly approved four new QA staff accounts. The owner subsequently
confirmed that activation must remain local only.

## Result and remaining boundaries

| Area | Current local behavior |
| --- | --- |
| Initial administrator | Existing `admin@test.local` mapped from ADMIN to SUPER_ADMIN; password unchanged |
| Role membership | Active actual admin account plus exactly one active recognized staff role required; missing/inactive/unknown/multiple memberships fail closed |
| Permission evaluation | Active stored grants intersect the approved role ceiling and implemented capabilities; role names, stale relationships and browser claims are not authority |
| Operations | Can inspect submitted reviews and approve/request changes, plus review-domain audit metadata |
| KYC Officer | Can inspect the business verification queue, authorize private-document downloads and moderate KYC, plus KYC-domain audit metadata |
| Super Admin | Real role inspection, implemented moderation, audit history, and independent disputed-booking review/decision APIs |
| Finance and Support | Can log in, inspect their actual access and notifications; domain audit view is empty until scoped records are implemented |
| Finance/support case, ledger and POD scope | Not implemented; APIs stay denied rather than exposing whole bookings or private documents |
| Staff membership and role editing | Not enabled. Legacy staff/user/role/permission writes are denied in local strict mode, including for Super Admin |
| Other unfinished admin routes | Denied by the strict API allowlist; protected UI routes return to Staff Access instead of displaying mock success |
| Existing business participants | Actual shipper/provider ownership rules remain separate; POD approval remains with the shipper, not staff |
| Money/GPS | Real payment/refund/payout and GPS operations remain excluded |

The approved matrix is a target policy, not a statement that every allowed
action is already implemented. In particular, this phase does **not** provide
Finance reconciliation, assigned Support case work, a role editor, staff CRUD,
last-admin concurrency controls, protected settings changes, or new CMS access.
Stored catalogue grants for these actions do not bypass the implemented-capability
filter. The role screen links to Staff Access to distinguish the two.

## What changed

- Added `PlatformStaffPolicy`, a server-maintained role ceiling and current
  capability profile. JWT-authenticated staff requests pass its allowlist before
  module controllers or request validation can execute a forbidden action.
- `/api/auth/me` returns actual `staff_access`; `/api/admin/access/session`
  supplies the authenticated account's readiness and the approved role catalogue.
- Angular route guards, sidebar/search navigation, role labels and moderation
  controls use server-verified access. Mock dashboard/other unsupported routes
  are unavailable to strict staff. Backend User Management no longer renders
  sample users as persisted staff.
- Review and KYC queues exclude the moderator's own submissions. Direct
  self-moderation and self-interested dispute decisions are forbidden.
- Audit scope is applied server-side before record/category filters and
  pagination. Non-Super Admins cannot use query filters to see security events
  or another domain. Finance/Support see no unassigned domain records.
- Authorized staff KYC/POD document access records a redacted event before
  streaming; an audit failure prevents the stream. The event records authorized
  access, not proof that the client received every byte.
- Review/KYC/cancellation notifications go to staff with the relevant capability.
  Staff-access change notifications open `/admin/access`; the Super Admin bell
  link was verified visibly.
- Added a dry-run-by-default `staff:prepare` command. Applying requires an
  explicitly selected active admin UUID, a complete matching database export,
  its SHA-256, and a staging gate. Existing protected-role grants are not reset
  on a repeated preparation. This is a local operator tool, not a staff HTTP API.

No permission claims are stored in the JWT as authority. Grant evaluation reads
the live role/permission relationships, so the next request with the same token
honors a revoked grant. Broader role editing and its notification/revocation
workflow remain disabled until their safeguards are implemented and tested.

## Backup and data safety

Before the role/account writes, a MariaDB export was created using
`--single-transaction --quick --routines --triggers --events --hex-blob`.

- Backup: [transportseva-before-staff-2026-10-29.sql](../.local-backups/transportseva-before-staff-2026-10-29.sql).
- Size: **834,435 bytes**.
- SHA-256: `687494D9CF164863E599DA8AA93D3D49D6AB851D308E4D409228FBE48A0EB1D2`.
- Verified: successful export exit, 99 CREATE TABLE definitions, completion
  footer, correct database marker and matching checksum before preparation.
- Main database after preparation: **transportseva, 99 base tables**.
- No migration, table drop/reset/truncation, backup import or business-record
  cleanup occurred. This export was not restored into a second database, so a
  full recovery rehearsal is not claimed.
- The private `.local-backups/` directory is Git-ignored. Keep the SQL local:
  it contains application data and credential hashes and must not be published.

The legacy ADMIN role itself and unrelated Manager/Employee/Driver grants were
not changed or removed. Only the approved existing administrator's membership
was replaced, and four new staff memberships were created. The old
`e2e.admin@transportseva.local` account remains unmapped and now receives no
business/admin capability in local strict mode; its account/password were not
changed. Historical Driver company-write grants remain flagged for separate
legacy-module review; this phase does not claim to have audited every customer API.

## Login-verified accounts in transportseva

Login: `http://localhost:4300/auth/staff/login`.
Current role/capabilities: `http://localhost:4300/admin/access`.

| Role | Email | Password | Account UUID |
| --- | --- | --- | --- |
| Super Admin (reused) | admin@test.local | password123 | ddf20522-1558-4c80-ae1b-22b6c8860bd0 |
| Operations Manager (new QA) | qa-staff-20261029-operations@transportseva.test | StaffQA@2026! | d4eafea6-d16e-476a-99c2-d372ff9d0f67 |
| KYC Officer (new QA) | qa-staff-20261029-kyc@transportseva.test | StaffQA@2026! | 784b5fea-3fae-4318-a7c6-78c4e1aec653 |
| Finance Manager (new QA) | qa-staff-20261029-finance@transportseva.test | StaffQA@2026! | 513b89fb-27a2-4915-ab77-7496855cb821 |
| Support Agent (new QA) | qa-staff-20261029-support@transportseva.test | StaffQA@2026! | b291dac9-abac-421e-ad76-3855a36a374e |

All five credentials succeeded through the real staff login form in headed
Chrome. The four new staff accounts were operator-provisioned; no public signup
or OTP verification is claimed for them. These are local QA credentials, not
production-ready passwords or an MFA rollout.

The existing marketplace account
`verify-truck-owner-1793028294862-62@transportseva.test` /
`TransportSevaE2E@2026` was reused without account changes for negative staff
access and read-only two-tab booking checks. No new booking or load was created
or advanced by the main-database browser tests in this task.

## Recorded main-database access events

Preparation created ten redacted events: five role definitions, one initial
admin membership change and four QA account provisions. Selected identifiers:

| Event | Event UUID |
| --- | --- |
| Initial admin mapped to SUPER_ADMIN | f263defe-4aa3-46b2-bc2e-bd608936058c |
| Operations QA provisioned | 72fcf165-dd9a-4840-9251-2ddc3bcc7710 |
| KYC QA provisioned | 68708fc5-115c-452e-8d07-7a83b4620c37 |
| Finance QA provisioned | 178b2802-4f98-480e-89a3-d53ee99a330d |
| Support QA provisioned | 9d7c2e63-466b-4007-8c7a-1d7842d69857 |

No passwords, tokens or private documents were copied into these events.

## Verification results

| Check | Outcome |
| --- | --- |
| Combined backend regressions | **46 passed; 629 assertions** across staff policy, existing admin access/audit, booking performance/allocation, workflow, cancellation, KYC and reviews |
| Angular regressions | **41 passed**, including verified route guards, filtered navigation, access-screen loading/errors, token refresh, bell routing and booking response/retry handling |
| Headed staff scenarios | **6 passed**: five role logins with live capability/API checks, plus anonymous/marketplace staff denial |
| Final combined headed run | **7 passed; 0 failures/skips/flaky**: all six staff scenarios plus the existing two-tab booking regression |
| Concurrent booking refreshes with bell polling | 1,977 / 2,636 / 1,422 / 1,774 / 1,427 / 1,897 ms |
| Production build | Passed; initial bundle about 987 kB, above the existing 500 kB warning and below the 1 MB error limit |
| Backup/table preservation and whitespace checks | Passed; export and main database both have 99 tables |

Backend staff cases use actual JWT middleware and transaction-isolated fixtures
in the existing `transportseva_employee_test` database. No reset/drop trait is
used. Feature tests explicitly select strict mode; baseline regression tests are
not presented as proof of every proposed staff policy action.

The first new backend attempt stopped one fixture because that isolated schema's
user-type enum did not accept `truck-owner`. The fixture now uses the existing
supported `transporter` type; no schema or validation was weakened. The corrected
combined backend suite passed.

The first headed staff run itself passed all six tests, but an outer PowerShell
wrapper tried to parse npm's banner as JSON and exited with a report-parsing
error. The final seven-test run used Playwright's direct JSON output file and
completed successfully. No product assertion was relaxed to obtain that result.

Evidence: [final seven-scenario JSON report](../test-results/staff-permissions-20261029-final-results.json).
The attached `staff-access-evidence.json` records exclude session tokens and
private response bodies. Keep traces and generated reports local.

## Local activation and next work

The local backend `.env` has `PLATFORM_STAFF_ENFORCE=true`. Existing verified
servers on ports 8080/4300 were reused; attempts to start duplicate servers
correctly refused occupied ports, and no running process was killed.

A broader change to make strict enforcement the default in every deployment was
blocked by the safety review because unmapped administrators elsewhere could be
locked out. It was **not applied**. The owner confirmed **local activation only**.
Other environments require their own backup, mappings and approved rollout.

Next: implement persisted case/queue assignment and minimal Finance/Support read
contracts, then constrained staff/grant editing with self-edit, last-Super-Admin
concurrency, audit rollback and notifications. Keep these controls unavailable
until their tests pass. The [full acceptance plan](STAFF_PERMISSION_TEST_PLAN.md)
still contains work beyond this first phase; it is not an all-pass checklist.
