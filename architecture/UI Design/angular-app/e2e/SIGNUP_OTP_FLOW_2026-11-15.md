# Signup OTP flow — 15/11/2026

Completed the remaining backend-enabled OTP screen safeguards and success-navigation recovery. Existing server signup verification remains authoritative; no production backend auth logic was changed.

## Changes

| Trigger | Result |
| --- | --- |
| Missing, malformed or unsupported signup context | Clear alert with signup and password-recovery links; no verification or resend request and no prototype success |
| Initial code request acknowledged | Phone-scoped 60-second resend deadline stored in session storage, consistent with the existing server minute throttle |
| Refresh or revisit during cooldown | Remaining delay restored from its deadline rather than reset or bypassed |
| Click Verify or Resend repeatedly | One pending request; both actions and code fields locked with visible busy feedback |
| Resend acknowledged | Old digits and development code cleared; new code displayed only if returned by the backend; a new resend delay starts |
| Server throttles resend | Retry-After applied, bounded to one hour, and a red error shown without a success notice |
| Request hangs or screen closes | Thirty-second request bound and subscription cancellation; timeouts show a usable error |
| Correct code verified | Session accepted only after its response contains a user, tokens and a positive expiry; owning role determines the profile route |
| Verification succeeds but navigation returns false or rejects | Verified state retained; Continue to profile retries navigation without sending the consumed OTP again |
| Unsupported account role returned | Login guidance; no inactive continuation button |

Signup requests also suppress duplicate submissions and cancel on screen destruction. The OTP inputs support full-code paste, Backspace focus movement and accessible digit labels. New UI copy is available in English and Hindi. Backend-disabled prototype behavior remains confined to that explicit mode.

The small OTP stylesheet now lives with its component. Browser diagnostics showed the development server repeatedly serving only the old external stylesheet rules; the spinner had zero width despite being present in the DOM. Colocating the styles made the busy indicator render correctly, and the final browser suite asserts its visibility. Reduced-motion preferences disable its rotation.

## Verification

| Check | Final result |
| --- | --- |
| Full Angular suite | 403 passed |
| Backend SignupOtpVerificationTest + PasswordRecoveryTest | 25 passed, 153 assertions |
| Source audit | 14 passed |
| Visible Chrome OTP suite | 2 passed, 28.9 seconds |
| Production build | Passed, 991.54 kB initial bundle; existing 500 kB warning, unchanged 1 MB hard limit |
| Focused backend Pint and patch whitespace | Passed |

The original signup OTP feature test lacked isolation. It now uses transaction rollback and refuses non-testing/non-`*_test` databases. Backend checks ran against `transportseva_employee_test`, with outbound HTTP blocked and mail faked. Added cases verify all three public signup roles, same-user idempotent verification, no role change on a successful retry, replacement-code invalidation, expired verified codes and completed-account rejection. Recovery and existing shared throttling regressions also passed. No database reset, migration, import, restore or seed was run.

Angular cases exercise malformed contexts, unsupported paths, duplicate and conflicting actions, cooldown expiry/recreation, Retry-After, code rejection and correction, cancellation/timeouts, paste/keyboard behavior, all signup-role destinations, unsupported returned roles, false/rejected navigation and incomplete session responses preserving the existing token.

## Browser evidence and limits

1. Invalid/non-signup links and malformed pending signup storage show recovery routes and make zero OTP requests.
2. An existing Truck Owner logs in through the real UI. The OTP screen then receives explicitly controlled resend and verification responses. The test verifies cooldown persistence on reload, expiry, visible spinners, disabled actions/fields, old-code clearing, rejected-code correction and successful navigation to the existing real account profile. Browser time changes affect Date only; normal timers continue running.

Existing account: `verify-truck-owner-1793028294862-62@transportseva.test`. No new main-database user or credentials were created. OTP responses were intercepted to avoid sending messages or mutating registration records. The successful controlled verification response reused that account's actual login session; the destination profile and route guard used real APIs. This is UI regression evidence, not a claim that a new signup or real OTP delivery was performed in the main database. Positive signup verification and retry behavior were separately tested against the real backend in the isolated transactional database.

Both browser cases restricted traffic to localhost, allowed read-only business requests and authentication bookkeeping, and recorded zero attempted business writes. No real SMS/email was sent. This report does not include tokens or OTP values.

## Preservation and artifacts

Before/after ordered full-row hashes and counts match for `loads` (39), `load_applications` (53), `marketplace_bookings` (26), `marketplace_settlements` (2), `booking_token_orders` (27) and `marketplace_kyc_profiles` (4). Login bookkeeping is outside this comparison.

- Browser source: `e2e/signup-otp-flow.spec.ts`
- Successful browser output: `test-results/signup-otp-flow-final-2026-11-15`
- Preservation comparison: `test-results/signup-otp-integrity-2026-11-15.json`
- Backend regression: `C:/laragon/www/ts/transportseva-api/tests/Feature/SignupOtpVerificationTest.php`

Earlier browser attempts deliberately remain recorded: the context/recovery case passed, while the busy-state case exposed the stale external CSS. A temporary stylesheet diagnostic confirmed the missing rule and was removed after resolution. Final verification uses the visible-spinner assertion; it was not weakened to accept an invisible indicator.
