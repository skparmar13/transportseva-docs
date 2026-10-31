# Mandatory dashboard Profile and email verification

31/10/2026. Local UI: `http://localhost:4300`; API: `http://localhost:8080/api`; database: `transportseva`.

## Implemented flow

| Stage | Behaviour |
| --- | --- |
| Signup phone OTP | Creates/resumes the pending account; opens its dashboard Profile page, not a separate wizard. |
| Login/deep link | Shipper, transporter, truck-owner and driver must complete Profile AND verify their login email. Existing accounts are included. Only their own Profile is accessible while blocked. |
| Profile save | Required first/last name and login email; pending signups also set/confirm a strong password. Optional designation, address, city, pincode and email/SMS preferences persist. False checkbox values survive reload. |
| Email verification | Uses saved login email only. Account/email-bound hashed OTP, ten-minute expiry, five invalid attempts, 60-second resend cooldown, per-user/IP throttles, encrypted queued delivery job. Correct retries are idempotent. |
| Unlock | Both persisted checks required. Storage flags, deep links and direct API requests cannot grant access. Profile/verification/logout/recovery remain reachable. No backend Skip action. |
| Email change | Current password required. Verification resets, earlier codes stop working, and portal access is blocked until the new email is verified. |
| Failure handling | Loading/retry, field errors, saving/verifying spinners, duplicate-click prevention, draft preservation and explicit stale-version reload. EN/HI labels. |

Personal signup details are separate from the existing self-scoped business profile, which appears below Profile after onboarding. Company tenancy, staff, billing and KYC are not repurposed. Admin/staff onboarding/access remains separate and unchanged, including the local-only staff enforcement setting. Communication preferences do not disable mandatory security verification or in-app notifications; storing preferences is not a claim of configured outbound delivery.

## Evidence

| Check | Result |
| --- | --- |
| Angular units | 183 passed. Includes HTTP contracts, guard/interceptor enforcement, persistence/failure/loading/validation UI checks. |
| Backend | 58 tests / 599 assertions passed, including the six-user quota regression. Transaction-isolated `transportseva_employee_test` only. |
| Visible Chrome primary run | 5 passed; no skips, unexpected failures or flaky results in `test-results/account-onboarding-rerun-2026-10-31.json`. Three public signup roles, existing driver, existing shipper with forged-cache/two-tab checks. |
| Resume original interrupted signups | Transporter and truck owner: 1 passed each. Same original accounts, no deletion/replacement. Separate `account-onboarding-resume-*-2026-10-31.json` reports. |
| Existing regression users | 3 passed in `account-onboarding-regression-users-final-2026-10-31.json`; actual Profile/OTP UI steps, never SQL stamping. |
| Source inventory | 4 tests passed; 145 screens / 65 components assessed. Not all screens are implemented/browser-tested. |
| Production build | Passed, initial bundle 998.56 kB. Existing 500 kB warning remains; 1 MB error threshold unchanged. |

Browser runs retain screenshots and QA-account attachments in JSON. Original failures remain separate, not relabelled as successful. The tests found and fixed:

- An empty-profile wrapper/template integration: backend business-role Profile routes now directly lazy-load the new page; disconnected prototypes remain separate.
- Throttling before JWT resolution combined unrelated users into an anonymous quota. JWT now runs first, preserving the limits; a six-account regression was added.
- The isolated restored schema lacked the already-supported truck-owner enum value. A compatibility migration appends it only when absent without reordering/removing existing values. The main schema already supported it.

## QA credentials — local only

All five accounts below were created/resumed through normal phone-OTP signup and Profile screens in `transportseva`. Password for these five: **`OnboardingQA@2026!`**. Verification used the local email sandbox, not actual inbox delivery.

| Role | Email | UUID |
| --- | --- | --- |
| Shipper | `qa-onboarding-1793463324476-shipper@transportseva.test` | `f015e2d8-46f5-4455-9b72-1ec6a9b7375b` |
| Transporter | `qa-onboarding-1793463324476-transporter@transportseva.test` | `30180733-c0c8-4a18-b466-e337082948c0` |
| Truck owner | `qa-onboarding-1793463324476-truck-owner@transportseva.test` | `57212c33-adf9-43ac-a88c-cc38af2e5938` |
| Transporter, resumed | `qa-onboarding-1793462728209-transporter@transportseva.test` | `66720686-249b-4fab-b39c-150d3822be06` |
| Truck owner, resumed | `qa-onboarding-1793462752533-truck-owner@transportseva.test` | `9667482d-60fa-41c3-bb7c-47817bbcce39` |

Existing accounts also completed Profile/verification without password or role changes:

| Role | Email | Existing password |
| --- | --- | --- |
| Driver | `driver1@test.local` | `password123` |
| Shipper | `qa-recovery-1793377725393@transportseva.test` | `RecoveryFinal@2026!` |
| Shipper | `verify-shipper-1793028294862-61@transportseva.test` | `TransportSevaE2E@2026` |
| Truck owner | `verify-truck-owner-1793028294862-62@transportseva.test` | `TransportSevaE2E@2026` |
| Truck owner | `verify-truck-owner-1793028294862-63@transportseva.test` | `TransportSevaE2E@2026` |

Public driver signup is not currently exposed; its existing login/Profile flow was tested. Do not deploy these QA credentials or enable developer OTP disclosure in production.

## Database safety

Verified backup before schema change: `.local-backups/transportseva-before-profile-gate-2026-10-31-210756.sql`, 893,387 bytes, 101 CREATE TABLE statements. SHA-256: `6EBDB56FA1BBB93E41CE58F7AF37BE0609D5D0BB13B65D3927B6CB2BBD21D94A`.

Only two scoped migrations applied; no broad migration batch, resets, imports, drops or seeders:

- `2026_10_31_160000_add_account_onboarding_and_email_verification.php`: two nullable timestamps on users; new `account_personal_profiles` and `account_email_challenges`. Existing phone `is_verified` is NOT treated as email ownership.
- `2026_10_31_160100_ensure_truck_owner_signup_role.php`: compatibility check; no role enum change needed in main DB.

All original 101 tables retained; 103 afterward. Immediately after migration, existing counts were unchanged: users 97, loads 36, applications 49, bookings 23, companies 1, staff-role memberships 11, KYC 2, business profiles 2. Onboarding intentionally adds five QA users (102 total), personal profiles/challenges and normal login bookkeeping. Existing non-QA users were NOT auto-completed or auto-verified. No loads/bookings/payments/GPS records created by this onboarding suite.

Final main-DB check: **103 tables; 102 users; 36 loads; 49 applications; 23 bookings; 1 company; 11 staff-role memberships; 2 KYC profiles; 2 business profiles; 10 personal profiles; 10 email challenges**. All five newly created users are active and verified through the sandbox UI flow. The other five verified profiles are the existing QA accounts listed above. The related business-profile suite performs its documented QA edits/restorations and generates real linked in-app notifications; it does not change login credentials, tenancy, KYC or marketplace records.

The existing User module ignore rules hid its model/resource source. Only `Modules/User/Models/User.php` and `Modules/User/Http/Resources/UserResource.php` were added to the module's source allowlist so the required gate methods/casts and response flags are visible for version control. No staging or commits were performed; include all changed/new source files when preparing the eventual release.

## Deployment caveat

Real SMTP/SMS credentials remain deferred. Local verification explicitly says no email was sent. Production refuses sandbox verification, developer OTP disclosure and non-durable auth queues. Configure real SMTP, durable auth queue/worker and disabled debug/sandbox flags, then prove actual inbox delivery before launch. This is not production-delivery sign-off.

## Final related reruns

Expanded backend: **58 passed, 599 assertions**. Related visible browser regressions: **19 passed**, covering business profiles (7), real user-scoped dashboards (6), public review feeds and owned vehicle details (6). Final related JSON: `test-results/profile-gate-related-regressions-2026-10-31.json`. No skips or flaky results.

Across the final primary/resume/existing-user runs and related regressions: **29 passing visible browser checks** (5 + 1 + 1 + 3 + 19). Initial failed runs are retained separately for diagnosis. Angular final run: **183 passed**. Source audit: **4 passed**. Production build: passed, 998.56 kB initial, unchanged warning/error budgets.
