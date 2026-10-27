# Administrator access and activity verification — 27/10/2026

Implemented and verified the checked administrator boundaries and recorded
moderation history. This is not a claim that every legacy module has completed
fine-grained RBAC, audit integration, MFA, or production security verification.

## Findings and fixes

| Finding | Change |
| --- | --- |
| Portal guard always allowed navigation and changed the displayed role | In backend mode, verify the account through `/api/auth/me` before activating a portal or child route; redirect a mismatched account to its actual portal |
| Local storage could claim administrator status | Ignore cached role claims for authorization; use the server's stored user type |
| Staff form accepted prototype accounts rather than real authentication | Use the actual login API in backend mode, reject non-admin identities, and hide demo-account buttons |
| Legacy users/roles/permissions routes required login but no administrator check | Add an active-administrator middleware boundary to those route groups, including password and permission-assignment routes |
| Dispute-review checks accepted privileged role names without requiring an admin account | Require the actual admin user type as well as the existing dispute-review role rule |
| Audit Logs displayed invented sample events | Replace samples with a paginated, administrator-only read API and real persisted records, with category/record filters |
| Roles screen displayed made-up membership/grants and reported a fake Save | Show stored roles/grants read-only; remove fake Save and editable checkboxes |
| Important marketplace admin decisions had no shared activity record | Record KYC/review moderation and dispute decisions in the same transaction as the state change; roll back the decision if recording fails |
| Temporary refresh failures and denied retried business requests could clear valid sessions | Preserve credentials on network/server refresh failures and on business 403/503 responses; expire only on confirmed authentication rejection |

Existing administrators retain their broad administrator policy. No staff roles
or permission grants were reassigned. A granular role editor has intentionally
not been enabled: the staff/action permission matrix must be agreed first.
Legacy role-editing service contracts also require review before exposing an
editor. The new read-only inspection API does not depend on those write services.

## Activity coverage and limits

Events capture the actor UUID/name, action, category, target UUID/label, time,
and allowlisted before/after state. KYC/review events include status and whether
feedback was supplied. Dispute events include the recorded continue/cancel and
token/commission choices, not execution of any money movement. The shared admin
middleware also has recording hooks for successful legacy account/role/permission
mutations; those mutations were not exercised as real writes in the browser.

Passwords, tokens, tax identifiers, raw notes/comments, document names/paths,
and whole request bodies are not copied into these events. The application model
rejects updates/deletes and there is no activity-write API. This is application
append-only behavior, not protection against a database administrator modifying
the table directly, nor a cryptographically signed audit archive.

The screen explicitly states that events start when this feature was enabled.
No historical actions were fabricated or backfilled. This does not yet cover
every legacy HR, CMS, support, finance, authentication event, or document read.

## Verification

| Check | Outcome |
| --- | --- |
| New backend authorization/activity cases | 8 passed; 88 assertions; actual JWT middleware enabled |
| Combined backend suite | 32 passed; 459 assertions across admin access, marketplace, allocation, performance, cancellation, KYC and reviews |
| Focused Angular access/history cases | 14 passed within the combined suite, including anonymous access, forged roles, profile routing, server errors, read-only roles, and audit filtering |
| Related Angular regression suite | 30 passed, covering access, history, refresh tokens, bell routing, and booking response/retry behavior |
| Visible negative access flow | Passed: anonymous redirect; nonexistent staff credentials rejected by the real API; regular account denied all five checked admin API groups; forged local role redirected to the truck-owner portal |
| Visible positive audit flow | Passed in the corrected follow-up: real signup/profile completion, review submission, actual staff login, feedback, one persisted event, filters, refresh, privacy checks, and read-only roles |
| Visible booking compatibility check | Passed after the guard changes: six concurrent two-tab refreshes completed in 2.0–4.2 seconds with bell polling enabled |
| Production build | Passed; the initial bundle remains above the 500 kB warning threshold and below the 1 MB error threshold |
| PHP syntax and Git whitespace checks | Passed |

A transient identity-check failure keeps credentials and offers a dedicated
session-check retry. Refresh-network failures and server 503 responses also keep
credentials. A retried business 403/503 does not expire the renewed session;
confirmed refresh-token rejection or a renewed-token 401 does. Six added
interceptor regressions verify these branches and one shared refresh for
concurrent expired requests. A confirmed identity-check 401 follows the expiry
path instead of falsely claiming credentials were retained.

The initial moderation browser attempt used a 13-digit timestamp in its public
review and correctly received contact-detail validation. The fixture was changed
to a six-digit marker; validation was not weakened. That stopped attempt's user
was reused in the successful follow-up. An older backend review test assumed an
empty database; its assertions now check its own unique records instead of
deleting or resetting retained test data. The initial three new-suite fixture
failures were also corrected by reloading persisted UUID users and setting the
actor for a direct writer test. The corrected complete backend run passed.

## Main-database test records and credentials

All browser data is in the existing `transportseva` database. Login at
`http://localhost:4300/auth/login` (or `/auth/staff/login` for the administrator).

| Purpose | Role | Email | Password |
| --- | --- | --- | --- |
| New audit-review account | Shipper | `audit-shipper-1793120947142@transportseva.test` | `TransportSevaE2E@2026` |
| Reused negative-access/booking account | Fleet owner | `verify-truck-owner-1793028294862-62@transportseva.test` | `TransportSevaE2E@2026` |
| Reused moderator | Administrator | `admin@test.local` | `password123` |

New shipper: `Audit Verification 947142`, mobile `7020947223`. Signup OTP and
profile completion succeeded; the follow-up successfully logged in using these
credentials. Its business KYC was not part of this task.

Review UUID: `bc785570-888d-426b-9d17-4863a239b36e` — **rejected / needs changes**,
not published. Audit event UUID: `22411208-03ff-4130-bd37-e9c281a8a029` —
`review.rejected`, `pending` → `rejected`.

No new administrator, booking, or load was created in the main database by this
task. Existing administrator passwords and permission grants were not changed.

## Data safety and evidence

Only the additive migration
`2026_10_27_230000_create_admin_activity_events_table` was applied to the main
database and `transportseva_employee_test`. No existing table was dropped,
reset, truncated, or replaced, and no records were deleted for test cleanup. Backend fixtures were created in the
isolated test database, not presented as main-database login users.

The three touched module API route files were excluded by their existing module
Git-ignore rules. Narrow exceptions now expose only those secured route files
for version control. No files were staged and no commit was made.

- [Initial visible run: negative access passed; moderation fixture stopped](../test-results/admin-access-20261027-results.json)
- [Successful moderation/audit follow-up](../test-results/admin-access-20261027-followup-results.json)
- [Successful two-tab booking compatibility check](../test-results/admin-access-booking-regression-20261027-results.json)

The named `admin-access-records.json` attachments exclude session tokens. Keep
failed Playwright traces local because they contain test-session network traffic.
The two admin flows passed across the initial and corrected runs; the first
combined browser run itself was not an all-pass run.

Real payment collection/refunds/payout and real GPS were excluded. A separate
staff-role/action permission matrix, granular editing, broader module cutover,
and production hardening remain future work.
