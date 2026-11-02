# Real account Support Tickets

Date: 01/11/2026. Local frontend: http://localhost:4300. API: http://localhost:8080/api. Browser-test records are in **transportseva**, not a separate application database.

## Delivered

| Area | Implemented behaviour |
| --- | --- |
| User portals | Shipper, truck owner, transporter and driver create/list/read only their own tickets. Real reference, category, priority, conversation and dates survive reload. |
| Admin queue | Super Admin sees tickets and assigns/unassigns an active, explicitly approved Support Agent. No client-supplied company/owner controls scope. |
| Support staff | Only currently assigned tickets. Ticket read/reply/status/history and audit access are revoked on unassignment/reassignment, with the same access token. Other staff roles do not gain ticket access. |
| Conversation | Stored replies and action notes, actual author name/role, escaped text, DD/MM/YYYY hh:mm AM/PM dates and five-second live thread polling. Concurrent updates never silently overwrite drafts. |
| Status | Staff progress/resolve tickets; the owner closes a resolved ticket or reopens a resolved/closed ticket. Reopening preserves all history. Resolved/closed tickets require reopening before replies. |
| Notifications | Creation acknowledgement; new-ticket bell for authorized Super Admin; updates for owner, current authorized assignee and Super Admin, excluding the actor. Exact-ticket links use the recipient’s own portal. No ticket body/contact details in bell text. Existing bell polling is fifteen seconds. |
| Reliable actions | Busy/disabled buttons and saving animation; server versions and row locks; creation/action idempotency IDs. Lost-response retries acknowledge the same action without duplicate history/audit/bells. Failures retain drafts and IDs. |
| Boundaries | Strict fields/body bounds, user/IP rate limits, bounded list/history pages, private/no-store responses and application append-only history. Audit contains status metadata, not ticket bodies. Audit or bell failures roll back the action. |
| Honest UI | No sample tickets, fake voice-call tab, sample phone number or fake success timeout. EN/HI feature copy. Disconnected backend shows unavailable. The dialog has a scrollable body and visible submit footer on shorter windows. |

Paths: /shipper/support, /truck-owner/support, /transporter/support, /driver/support and /admin/support. Exact item: ?ticket=<uuid>.

Account support is separate from public Contact enquiries, admin-decided marketplace disputes and the disabled legacy company Support module. Company tenancy was not invented/enabled. Attachments, phone integration, outbound email, real payments and GPS are outside this delivery.

## Executed primary journey

Ticket **ST-20261101-HMTOBBLJN0FV**, UUID **94313d0f-f4f7-4335-aaf0-a6f82508bf4b**.

| Version | Actor | Saved action / result |
| --- | --- | --- |
| 1 | Shipper | Creates private QA ticket; owner and authorized Super Admin receive linked bells. |
| 2 | Super Admin | Assigns QA Support Agent; previously unassigned agent gains access and receives a bell. |
| 3 | Support Agent | Replies; reply appears automatically in the shipper’s open screen. |
| 4 | Shipper | Replies; reply appears automatically in Support’s open screen. |
| 5 | Support Agent | In progress. |
| 6 | Support Agent | Resolved; shipper sees status automatically, with reply form removed. |
| 7 | Shipper | Closes the resolved ticket. |
| 8 | Shipper | Reopens; history remains intact. |
| 9 | Super Admin | Unassigns. Old agent gets 404 for ticket reads/writes and loses ticket audit visibility; open UI clears on its next poll. |
| 10 | Super Admin | Reassigns approved agent; access restored. |
| 11 | Support Agent | Resolves reopened ticket. |
| 12 | Shipper | Closes; reload confirms Closed with all 12 events. |

A different truck owner cannot read/reply to this ticket (404). KYC staff cannot open the Support route and API access is denied (403). Backend tests also cover Operations, Finance, unmapped/inactive/ambiguous staff, forged extra grants and enforcement-off fail-closed behaviour.

## Verification

| Layer | Completed result |
| --- | --- |
| Backend | **92 passed / 1,010 assertions**: 20 Support cases plus Contact, staff policy, onboarding, business profile, dashboard and vehicle regressions. |
| Angular | **221 passed**, including Support HTTP/UI, validation, duplicate clicks, loading/errors, polling, stale drafts, uncertain writes, assignment restrictions and bell routing. |
| Source inventory | **4 passed**; Support assessment now points to the real API service. |
| Production build | **Passed, exit 0**; initial 996.54 kB. Existing 500 kB warning remains; 1 MB failure limit unchanged. |
| Visible Support browser run | **6 passed, zero failed/skipped/flaky**, headed Chrome, 187.34 seconds. All four account roles, exact bells, two-way polling, assignment revocation, status/reopening, reload, foreign users, lost responses and competing replies. |
| Related visible regressions | **13 passed**: six dashboard cases, six public-review/vehicle cases and one read-only Contact enquiry case. Zero failed/skipped/flaky. **19 passing visible browser checks overall**, not a claim that every application screen is production-tested. |

Backend tests use DatabaseTransactions and require both APP_ENV=testing and an actual *_test database. Only audited suites ran against transportseva_employee_test. No refresh/reset/seed/import operations or provider sends were used.

Initial visible run: 1 passed / 5 failed, exposing an unstable/clipped submit area in the new-ticket dialog. Fixed the layout; final six-case run passed without retries or forced clicks. First-run JSON is retained separately. A build also caught a 104-byte budget overrun: removed the unused in-memory sample-ticket store instead of raising budgets.

Evidence:

- test-results/support-tickets-2026-11-01.json — initial failures.
- test-results/support-tickets-final-2026-11-01.json — final six-case run, record metadata and screenshot.
- test-results/support-related-regressions-2026-11-01.json — twelve read-only dashboard/review/vehicle checks.
- test-results/support-contact-regression-2026-11-01.json — one read-only Contact staff navigation/reload check.
- e2e/support-tickets.spec.ts — executable headed flow; trace/video off and network guard restricts external/unrelated writes.

Re-run locally:

    $env:PLAYWRIGHT_JSON_OUTPUT_NAME='test-results/support-rerun.json'
    npx playwright test e2e/support-tickets.spec.ts --headed --output=test-results/support-rerun --reporter=list,json

## QA records retained

All are labelled QA SUPPORT; messages explicitly request no actual call/email/payment/GPS action.

| Purpose | Reference | UUID | Final state |
| --- | --- | --- | --- |
| Full journey | ST-20261101-HMTOBBLJN0FV | 94313d0f-f4f7-4335-aaf0-a6f82508bf4b | Closed, v12 |
| Truck-owner portal | ST-20261101-KCZFQXMCFOEF | 1562b233-35bf-454e-a00a-8f8a793ddf11 | Open, v1 |
| Transporter portal | ST-20261101-FINCDETLUXZN | 3614844a-0f96-4d05-9c42-24ff37f92880 | Open, v1 |
| Driver portal | ST-20261101-JNOYFGWQUJZ9 | ee69530a-20d7-4035-804c-66b8ddc4737e | Open, v1 |
| Lost create/reply responses | ST-20261101-MMW9MTJXWNYD | 27fd817a-ba26-4e19-b298-6c51328ea094 | Open, v2; exactly two events |
| Final competing replies | ST-20261101-KNPRX0SI883A | 38238c9a-145c-4502-a58b-adcd7de6871d | Open, v2; stale reply rejected |
| Earlier competing-reply check | ST-20261101-MONDYSB3RH8F | 95be85b7-9150-46fa-bbbd-f818fd700085 | Open, v2 |

Totals after Support tests: **7 tickets, 21 history events, 38 in-app notifications, 7 staff audit events**. No users, loads, bookings, trips or payments created by this task.

## Existing local QA accounts

No accounts, passwords or account-role assignments were created/changed.

| Purpose | Login | Existing local QA password |
| --- | --- | --- |
| Shipper: full flow, retries, concurrency | qa-recovery-1793377725393@transportseva.test | RecoveryFinal@2026! |
| Truck owner: own ticket / foreign-ticket denial | verify-truck-owner-1793028294862-62@transportseva.test | TransportSevaE2E@2026 |
| Transporter: own ticket | qa-onboarding-1793463324476-transporter@transportseva.test | OnboardingQA@2026! |
| Driver: own ticket | driver1@test.local | password123 |
| Super Admin: queue / assignment | admin@test.local | password123 |
| Assigned Support Agent | qa-staff-20261029-support@transportseva.test | StaffQA@2026! |
| KYC: unauthorized-ticket negative case | qa-staff-20261029-kyc@transportseva.test | StaffQA@2026! |
| Related read-only shipper dashboard | verify-shipper-1793028294862-61@transportseva.test | TransportSevaE2E@2026 |
| Related read-only second-owner / foreign vehicle | verify-truck-owner-1793028294862-63@transportseva.test | TransportSevaE2E@2026 |

Local QA only: do not deploy these credentials/accounts as production staff or publish this report publicly.

## Database preservation and deployment scope

Verified full pre-change backup:

.local-backups/transportseva-before-support-tickets-2026-11-01-151345.sql

947,211 bytes; 105 CREATE TABLE statements. SHA-256:

C4D3428A761116CC75A04B09989E4E089504D3551EF98C094011FBEBC63C9C31

Applied only database/migrations/2026_11_01_100000_create_account_support_tickets.php, first to isolated tests and then main. Added account_support_tickets and account_support_events: **105 → 107 base tables, none missing**. No drops, resets, imports, seeders or broad migrations.

Added four dedicated support.tickets.* permissions and seven links to existing approved roles: Super Admin view/reply/manage/assign; Support Agent view/reply/manage with current-assignment checks. No Operations/KYC/Finance grants or legacy support.cases.* activation. Verified all 38 original permission rows, 91 original grants and 11 original membership rows against backup, including timestamps in the dump’s UTC semantics. Totals: 42 permissions / 98 grants / 11 memberships.

Protected main counts unchanged: users 102; loads 36; applications 49; bookings 23; companies 1; KYC profiles 2; business profiles 2; personal profiles 10; email challenges 10; Contact enquiries 6 and follow-ups 4. Local staff enforcement remains true; deployment default unchanged.

Final housekeeping: application TypeScript check, PHP syntax checks for modified routing/policy/provider files, both worktree diff-whitespace checks and all four source-audit checks passed. A sandbox-only Node worker spawn denial was rerun successfully with process-launch permission; it was not counted as an application test failure.

This is local functional verification, not production sign-off. No staging deployment, actual email/SMS, payment settlement, GPS, company tenancy or unrestricted staff administration was enabled.
