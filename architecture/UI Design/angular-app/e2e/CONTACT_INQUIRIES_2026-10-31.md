# Real Contact Us enquiry flow

Date: 31/10/2026. Local frontend `http://localhost:4300`, backend `http://localhost:8080/api`, real application database `transportseva`.

## Delivered

| Stage | Actual behaviour |
| --- | --- |
| Public `/contact` | Required name/email/phone/subject/message, EN/HI labels, inline validation and saving animation. No sample phone numbers, office address or third-party sample map on the Contact page. |
| Confirmed storage | Anonymous `POST /api/public/contact-inquiries` saves a real enquiry and returns an opaque reference/time only. The UI says received and saved, not email sent. |
| Spam/duplicate safeguards | Bounded fields/body, honeypot, 5 requests/minute and 20/hour per IP, 5/hour per normalized-email digest; unique submission ID with a keyed normalized-payload digest. Same request retries return the same receipt; changed payload with the same ID returns a recoverable conflict. |
| Failure | No success/field clearing before confirmed save. Failed requests retain the draft and submission ID. Lost-response retries do not duplicate the saved enquiry or staff notification. |
| Staff queue | `/admin/contact-inquiries`: real bounded pagination, status/reference filters, exact-item links, private contact/message details and internal follow-up history. |
| Follow-up | New / In progress / Resolved / Spam; internal note required. Server version checking protects concurrent/stale edits. Notes/status are saved atomically with append-only history, safe administrative audit and linked staff notifications. No reply email is sent by this screen. |
| Permissions | Only explicitly mapped/granted Super Admin and Support Agent roles. Other staff, customers, anonymous sessions, spoofed admin memberships, disabled/ambiguous staff roles and unmapped admins fail closed. The enquiry controller enforces this even when broader staff enforcement is disabled. |
| Privacy | Public API has no list/detail/receipt lookup. Receipts do not expose internal UUIDs, contact details or notes. Staff responses are private/no-store. Bell messages include reference only, not phone/email/message. User content is rendered as text, not HTML. |

Contact enquiries are separate from legacy Support Tickets, company tenancy, billing, disputes and payment/GPS flows. No legacy support grants or global staff-enforcement defaults were enabled. The existing User onboarding/email gate remains unchanged.

## Storage and scope

Backup before schema/grant changes: `.local-backups/transportseva-before-contact-inquiries-2026-10-31-222353.sql`, 925,789 bytes, 103 CREATE TABLE statements. SHA-256 `30999883D7765ABF2D1E4671394781A7076E26C200325748482C4753FAB11CCB`.

Applied only `2026_10_31_180000_create_contact_inquiries.php`, first to the isolated test DB and then to main after passing checks. Two additive tables: `contact_inquiries`, `contact_inquiry_updates`; main table count 103 → 105. No drops, resets, imports, seeders or broad migration batches.

Added only `contact.inquiries.view` and `contact.inquiries.update`, linked to the existing `SUPER_ADMIN` and `SUPPORT_AGENT` roles (four new role-permission links). Verified all original grants and all account-role memberships were preserved. No new users or role assignments were created.

Immediately after migration, existing counts were unchanged: users 102, loads 36, applications 49, bookings 23, companies 1, staff-role memberships 11, KYC profiles 2, business profiles 2, personal profiles 10. The browser tests create clearly labelled `QA Contact` enquiries with messages explicitly stating no actual call/email is requested. Those records and their genuine in-app notifications are retained, not deleted or passed off as real customer enquiries.

## Test execution

| Layer | Evidence |
| --- | --- |
| Backend regression | Final expanded run: **72 passed / 701 assertions**, covering Contact (14), staff policy, onboarding, business profiles, real dashboard and vehicle authorization. Every DB-writing test uses transaction rollback and asserts a testing `*_test` database. No external HTTP/mail allowed. |
| Angular | 203 tests passed, including 20 new public-form, HTTP-contract, staff queue, anonymous-session, bell navigation and malformed-detail checks. |
| Production build | Passed; 999.26 kB initial. Existing 500 kB warning remains; the 1 MB error budget was not raised. |
| Source audit | 4 passed; inventory includes the real public and new private screens. Not a claim that every application screen is implemented. |
| First visible browser run | Core save/bell/staff/denied/stale/retry/lost-response cases passed. The validation-only case encountered a Vite development overlay; original failure evidence retained. A subsequent read-only browser check found zero overlays/runtime errors and the real form present. |
| Final browser rerun | **16 passed**, no skips, flaky results or unexpected failures. Four Contact checks plus twelve dashboard/review/owned-vehicle regressions. |

Final browser suite: `e2e/contact-inquiries.spec.ts` (4 checks) plus six real dashboard and six review/owned-vehicle regressions. JSON `test-results/contact-inquiries-final-2026-10-31.json` contains reference/UUID attachments and a staff screenshot. Trace/video disabled to avoid collecting credentials. Browser routes reject non-local traffic and all unrelated mutations, including payment/GPS/provider actions.

The visible Contact flow covers anonymous client validation, Hindi, successful save, receipt, exact bell routing, Super Admin and Support staff follow-up, reload persistence, two-tab conflict recovery, denied KYC staff, failed-save retention, a saving spinner/duplicate click, and a response lost after actual database commit followed by a safe retry.

## Reproduction accounts

No accounts created or passwords changed during this task:

| Purpose | Existing account | Existing local QA password |
| --- | --- | --- |
| Public enquiry | Anonymous visitor | None |
| Super Admin follow-up / bell | `admin@test.local` | `password123` |
| Support follow-up | `qa-staff-20261029-support@transportseva.test` | `StaffQA@2026!` |
| Unauthorized staff negative case | `qa-staff-20261029-kyc@transportseva.test` | `StaffQA@2026!` |

Use only in the local QA environment. Existing dashboard/vehicle test users are documented in `ACCOUNT_ONBOARDING_2026-10-31.md`; their credentials and marketplace data were not changed here.

## Remaining limitations

Real SMTP/SMS and confirmed public direct contact details remain deferred/unconfigured. This task does not send acknowledgement/reply emails or promise a response deadline. Staff can record actual phone/manual follow-up. Synthetic QA notes explicitly state no real call/email was made. Production still needs approved contact details, an operational follow-up process, monitoring and a reviewed retention policy for visitor contact data. Do not deploy QA credentials or development OTP settings.

## Final results and records

Final browser JSON: `test-results/contact-inquiries-final-2026-10-31.json` — 16 expected, 0 unexpected/skipped/flaky, start `2026-10-31T17:20:52.499Z`, duration approximately 203 seconds. Expanded backend: 72 passed, 701 assertions. Angular: 203 passed. Source audit: 4 passed. Production build: passed at 999.26 kB initial with the unchanged existing warning/error limits.

| Final-run QA enquiry | Reference | UUID | Retained state |
| --- | --- | --- | --- |
| Anonymous → bell → Super Admin/Support follow-up | `CI-20261031-GMU96AJCSZTC` | `2c415c13-9f86-487d-ad6b-f0982e25a6ac` | Resolved, version 3; two genuine synthetic-test follow-up records |
| Failed save → visible retry / duplicate prevention | `CI-20261031-MEHX8RFHINCZ` | `73d3e5d0-3416-4d60-a4e9-c85a09debf65` | New, version 1; one saved record |
| Database save → lost response → retry same receipt | `CI-20261031-SORZMLRXVUSL` | `b5623d8a-0532-4150-a9cd-2a63bbdfb512` | New, version 1; one saved record despite two requests |

Three earlier QA enquiries from the first browser run were also retained: `CI-20261031-ARWM2AQB9YZS` (resolved), `CI-20261031-EAZOPFVCCDRC` (new), `CI-20261031-4SE8Z7TYAS9T` (new). No test records were deleted. Final main inventory: **105 tables, 6 QA enquiries, 4 follow-up history rows, 4 safe audit events, 16 contact-related staff bell records**. Existing users/marketplace/company/membership/KYC/profile counts remain exactly as listed above. No new user or booking was created.

Final UX adjustment displays the selected enquiry above the queue, so exact notification links immediately show its detail rather than leaving it beneath a long table. A focused read-only visible browser check verifies the reference is in the viewport and survives reload without changing the enquiry.

That final focused check passed: `test-results/contact-detail-first-2026-10-31.json` (1 expected, 0 unexpected/skipped/flaky). **17 passing final visible browser checks in total** (16 related-flow checks + 1 final layout/reload check). Final layout build and all 203 Angular units were rerun successfully. No additional enquiry was created by the read-only check.
