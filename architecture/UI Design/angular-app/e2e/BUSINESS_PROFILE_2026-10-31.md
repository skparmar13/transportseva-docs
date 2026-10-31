# Account-owned business-profile persistence — 31/10/2026

Business Settings for Shipper, Truck Owner and Transporter business accounts
now reads and saves an account-owned profile. Backend mode no longer shows the
shared Yadav Road Carriers sample or offers memory-only branch, staff, role or
billing actions. Prototype mode remains explicitly separate. Company workspace
ownership has not been inferred from a role label or created_by audit field.

## Delivered flow

| Step | Behavior |
| --- | --- |
| Read | GET /api/account/business-profile derives ownership from the authenticated account; missing profiles return real account identity plus an honest empty state |
| Edit | Business display name/type, business contact email/phone, address, city, state and Indian PIN code |
| Validate | Inline field feedback and server-authoritative required/type/length/email/phone/PIN/version validation; unknown fields are rejected |
| Save | PUT to the same self-only endpoint; primary-key uniqueness and a stable user-row transaction lock protect first saves |
| Reload | Saved fields and their version/timestamp are read from the database, not browser storage |
| Concurrent edit | Old versions receive 409; the stale draft stays available until the user explicitly discards it and loads the latest profile |
| Failure | No false saved state; validation/server failures keep the draft and show recovery feedback |
| Busy | Save/cancel and inputs disable during saving; animated feedback respects reduced motion and duplicate submits are blocked |
| Notification | A changed save commits one private bell notification with the current portal's /profile link, in the same transaction as the profile |
| No-op | Unchanged saves do not increment version or create another notification |

Login name/email, registered phone, password, role, memberships and KYC are not
editable through this API. Separate business contact information does not
change login credentials. Actual KYC status/legal name and masked tax IDs are
shown read-only with a link to the real KYC workflow; full tax IDs/document
paths are excluded. Updating a display/contact profile never approves or
rewrites legal identity. Contact values are trimmed/normalized; optional
contact/address fields may be cleared.

Both reads and saves are private/no-store. A foreign UUID in a read query does
not change scope; ownership/credential/role/KYC fields in a write are rejected,
and there is no arbitrary-user profile URL. Active Driver/Admin and inactive
accounts cannot use this business-account endpoint. Existing staff enforcement
and role ceilings remain unchanged and local-only.

Private portals are deliberately RenderMode.Client in app.routes.server.ts.
JavaScript-disabled HTML contains neither a real profile nor the sample
business. English and Hindi UI text and DD/MM/YYYY hh:mm AM/PM timestamps work
after normal authenticated client rendering.

## Database safety and backup

A verified backup was taken before any schema or QA-profile mutation:

- File: .local-backups/transportseva-before-business-profile-2026-10-31-200707.sql
- Size: 876,186 bytes
- SHA-256: 68AFC90B00A67E45E8F82305047CE3B946BE096B1070B0E7BCC9AF80E57AC4FC
- Contains 100 CREATE TABLE statements. Export used a single transaction,
  without --databases or DROP TABLE statements. Backup data is ignored by Git
  and was not printed, imported or published. No new restore drill is claimed.

Only migration
2026_10_31_120000_create_account_business_profiles_table.php was applied,
first to transportseva_employee_test, then explicitly to local transportseva.
No pending migration batch, refresh, seeder, database reset or import was run.
All 100 original base tables remain; each database now has 101 base tables.
Rollback of the new migration refuses to drop a populated profile table.

Main database row-count checks before/after the additive migration, and after
browser execution, remained:

| Existing data | Rows |
| --- | ---: |
| Users | 97 |
| Loads | 36 |
| Load applications | 49 |
| Marketplace bookings | 23 |
| Companies | 1 |
| Marketplace KYC profiles | 2 |

The only new business rows are two clearly labelled QA business profiles.
Changed saves/restorations generated 18 Business profile updated notifications
across the initial and final browser runs; notification read state also changed
when the normal bell was clicked. Normal login/session bookkeeping occurred.
No other profile, role, company, load, booking or KYC data was edited.

## Existing QA accounts reused

No users were created and no passwords were changed.

| Account | UUID | Retained business display name | Final checked version |
| --- | --- | --- | ---: |
| qa-recovery-1793377725393@transportseva.test | 28e6ac01-ca7b-4ad5-b4ec-eacca9eb4e8c | QA Business Profile - shipper - 31/10/2026 | 11 |
| verify-truck-owner-1793028294862-62@transportseva.test | ab8b83d6-cbde-4331-a287-082a48190a10 | QA Business Profile - truck-owner - 31/10/2026 | 7 |

The first browser run created these two profiles because the new table was
empty. Subsequent tests/reruns restored their prior field values instead of
deleting them; versions/history correctly continue increasing on changed
saves. Contact values are QA fixtures, not evidence of verified real contacts
or external message delivery. The final report records versions at each step,
which can be lower than the final restoration version above.

## Executed verification

| Check | Result |
| --- | --- |
| Angular suite | 166 passed, including 18 new profile/API/bell-route cases |
| Backend profile/dashboard/vehicle/staff suite | 43 passed, 424 assertions; includes 12 new profile cases |
| Final visible Chrome run | 19 passed, zero skips/failures/flaky results: 7 profile cases plus the 12 preceding dashboard/review/vehicle cases |
| Source-audit consistency | 4 passed; inventory regenerated and read-only collector no longer attempts a real profile Save |
| TypeScript app/spec compilation and PHP syntax | Passed |
| Production build | Passed; unchanged 997.39 kB initial bundle, with the existing 500 kB warning and unchanged 1 MB error budget |
| PHP formatting / diff whitespace checks | Passed for changed/new files |

Profile browser cases covered real save/reload for both accounts, login identity
and KYC preservation, actual bell polling and redirect from the dashboard,
client validation, injected 503 draft recovery, saving animation/duplicate
guard, two visible tabs with a real 409 winner/loser, explicit latest-version
recovery, cross-account/protected-field forgery rejection, private client-only
HTML and Hindi rendering. Local browser error fixtures did not alter the DB.
Both saved profile screens were visually inspected from the retained evidence.

Backend tests use real JWT middleware and DatabaseTransactions with a testing
and *_test database guard; fixtures roll back and stray external HTTP is
blocked. They cover optional-field clearing, normalization, stale/no-op saves,
atomic notification failure rollback, role/status boundaries, privacy and KYC/
credential immutability. Transporter authorization/notification routes were
tested with isolated provider fixtures; no Transporter browser login is claimed
because no existing working password was available and none was reset.

Development iterations are retained honestly: initial test fixes aligned the
suspended/pending account status assertions with the existing middleware and
selected notification rows by version rather than unordered random UUIDs.
Native form-name attributes were added after component tests exposed their
absence. The first browser run had 6 passes and one wrong SSR-placeholder
expectation; private routes intentionally use client rendering. An unnecessary
render delay introduced during that check was removed, restoring the existing
route smoke test. The final 19-case and 166-case runs passed afterward.

## Artifacts and reproduction

- [Final browser report](../test-results/business-profile-final-2026-10-31.json)
- [Initial browser report, including corrected CSR assumption](../test-results/business-profile-2026-10-31.json)
- Final report attachments include saved-profile screenshots, actual account
  UUIDs/versions, stale-tab winner status, identity/KYC preservation and empty
  out-of-scope-request arrays. Screenshots captured after form actions can show
  fixed navigation at the current scroll position in a full-page capture.

Frontend:

    npm run test:ci -- --reporters=dots
    npm run build
    npx playwright test e2e/business-profile.spec.ts e2e/marketplace-dashboards.spec.ts e2e/reviews-vehicle-details.spec.ts --headed

Backend, with the existing isolated test database:

    php artisan test --filter='AccountBusinessProfileTest|MarketplaceDashboardTest|MarketplaceVehicleDetailsTest|PlatformStaffPolicyTest'

## Remaining scope

Company tenancy, branches/staff/roles/billing and platform-wide system settings
were not implemented or granted new access by this repair. Signup's separate
optional designation/address/notification-preference step is still not bridged
to persisted account settings; this task fixes the active Business Settings
form, not all onboarding metadata. Driver profile routing remains separately
planned. External OTP/email, real payments, GPS and deployment remain deferred.

Next recommended repair: persist the optional signup/profile-setup fields and
preferences safely, then continue the real Support/inquiry workflow queue.
