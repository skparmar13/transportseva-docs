# Real Admin Dashboard — 19/11/2026

Completed the requested Admin Dashboard with live operational totals, authorized
work queues and ten recent recorded administrative actions. The backend route
now selects `AdminDashboardComponent` rather than the shared sample dashboard.

## Delivered behavior

- Real saved counts across the marketplace, with no sample KPI values or trend
  percentages. Live pending applications are counted independently of cached
  load application totals.
- Separate queue counts for independent dispute review, review moderation,
  KYC, open support tickets, new contact enquiries and pending newsletter consent.
- A dedicated active Super Admin dashboard grant plus current per-domain grants.
  Revoked domains disappear instead of becoming fabricated zero counts.
- Ten recent real admin audit events with readable action labels, standard
  date/time, stable ordering and exact audit-target links.
- Refresh/loading animation, duplicate locking, 30-second deadline, cancellation,
  retry and denial states; stale statistics are removed during failed refreshes.
- English/Hindi and reduced-motion-aware display. Real zero and empty activity
  states are distinct from failure.

Global aggregate booking totals do not widen individual booking access. The
existing Admin booking screen remains restricted to eligible dispute review.
The dashboard links only implemented authorized queues and audit records.
No new global booking-detail API or participant workflow permissions were added.
The separate Admin Reports screen remains pending.

## Independently verified live totals

Read-only SQL counts were captured before local activation and compared to the
real browser API response. No business records were created for the live test.

| Metric | Verified count |
| --- | ---: |
| Loads posted | 39 |
| Open loads | 13 |
| Applications awaiting a decision | 16 |
| Bookings created | 26 |
| Bookings in transit | 1 |
| Delivered bookings | 5 |
| Open disputes eligible for independent review | 2 |
| Reviews awaiting moderation | 4 |
| KYC awaiting review | 2 |
| Open/in-progress support tickets | 8 |
| New contact enquiries | 5 |
| Newsletter confirmations pending | 3 |

Counts describe this local QA database, not production business performance.
Delivered is the recorded booking `completed` state, not a settlement assertion.
Activity contains recorded admin actions; it does not reconstruct older actions
or claim a complete live shipment-event stream.

## Checks executed

| Check | Result |
| --- | --- |
| Initial focused dashboard/API/navigation tests | 15 passed |
| Full Angular regression | 451 passed before final label-only polish |
| Final focused dashboard/API verification | **12 passed**, including readable support-activity labels |
| Isolated AdminDashboardTest | 9 passed, 74 assertions |
| Combined AdminDashboard, MarketplaceDashboard, PlatformStaffPolicy and AdminNewsletter suites | **41 passed, 383 assertions** |
| Source audit | **17 passed** |
| Headed dashboard acceptance | **4 passed**, including the final activity-label display |
| Production browser/SSR build | Passed, including 11 prerendered static routes |
| Focused PHP syntax/formatting and source whitespace checks | Passed |

The build retains the existing initial-bundle warning: approximately 954.53 kB
against a 500 kB warning threshold and unchanged 1 MB error limit. This task is
not production deployment or all-screen acceptance sign-off.

The backend tests use `transportseva_employee_test`, require testing and an
`*_test` database, and roll back their fixtures. Mail is faked and external HTTP
is blocked. They check anonymous and narrow-role denial, accidental grant
denial with enforcement off, explicit grant revocation, global/soft-delete-aware
counts, independent dispute scope, omitted domains, bounded private activity,
rejected caller scopes/mutations, and additive/idempotent audited local access.
An initial application fixture reused the same provider on one load and hit the
existing unique constraint. It was corrected to distinct providers; the business
constraint was retained. A first rerun used the wrong working directory and did
not execute tests; the corrected run and combined suite passed.

## Visible browser cases

| Flow | Evidence | Result |
| --- | --- | --- |
| Real login → totals → access bell → exact audit target → newsletter queue → reload | Real identities, saved rows and API; independent SQL comparison enabled | Passed |
| Refresh → held request → injected 503 → retry | Browser-only delay/failure, then real API recovery | Passed |
| Operations/Support dashboard access attempts | Real staff sessions, direct API 403 and route denial | Passed |
| Zero counts, empty activity, Hindi, then denied refresh | Explicit browser-only response fixtures | Passed |

The original bell assertion clicked while already on its destination, invoking
the existing deliberate page reload; the test now opens the bell from Staff
Access. The narrow-role navigation assertion originally matched the logo link;
it now targets the actual menu. No access policy was weakened to satisfy either
check.

Existing accounts reused; no main-database users or passwords were created or
changed:

| Purpose | Account |
| --- | --- |
| Authorized Super Admin | `admin@test.local` |
| Denied Operations | `qa-staff-20261029-operations@transportseva.test` |
| Denied Support | `qa-staff-20261029-support@transportseva.test` |

The activity link opened the saved dashboard-access event
`fd538312-2aac-4bab-af67-cb6d55a259a0`, targeting existing Super Admin role
`5d9ce9c1-d773-46c7-a2a6-e0dd4ff589af`. The live browser flow did not create a new
load or booking. Requests were local-only; business writes were blocked, with
empty unexpected-write arrays. Authentication and notification-read bookkeeping
were allowed.

Existing newsletter/contact test login helpers now accept the authorized
dashboard landing; narrower staff retain the Staff Access landing. Diagnostic
screen-audit login handling and staff self-access setup were adjusted likewise.
Those complete older browser suites were not rerun as part of this dashboard
acceptance; backend newsletter authorization was included in the combined suite.

## Backup and preservation

Before local activation, a full backup was exported and verified:

- `.local-backups/transportseva-before-admin-dashboard-2026-11-19.sql`
- 1,158,251 bytes, 109 CREATE TABLE statements and completion footer verified.
- SHA-256: `08aeb4f742a4300ab4bb6e382736a038233a5dbb837aafdfbee2c8180c3a3db3`.

Exactly one permission record and one Super Admin role association were added
for `admin.dashboard.view`, with the security audit and linked bell event.
Existing role memberships, other grants and enforcement settings were retained.
The new local/testing-only command refuses non-local activation.

All 109 main-database table names and ordered full-row hashes/counts of 13 checked
sets were preserved:

| Table | Rows |
| --- | ---: |
| loads / load_applications / marketplace_bookings | 39 / 53 / 26 |
| marketplace_settlements / booking_token_orders | 2 / 27 |
| marketplace_kyc_profiles / marketplace_reviews / marketplace_disputes | 4 / 13 / 7 |
| account_support_tickets / contact_inquiries | 9 / 7 |
| newsletter_subscribers / newsletter_consent_requests | 6 / 9 |
| role_user | 11 |

No schema migration, reset, drop, seeder, import, restore or main business-record
mutation was executed. This comparison excludes authentication/notification
bookkeeping and is not a full-database row audit.

## Reproduce and artifacts

```powershell
npm.cmd run test:ci -- --reporters=dots
node --test audit/screen-source-audit.test.mjs
npm.cmd run build
npx.cmd playwright test e2e/admin-dashboard.spec.ts --headed --output=test-results/admin-dashboard-final-2026-11-19 --reporter=list
```

Backend directory:

```powershell
php artisan test --filter='AdminDashboardTest|MarketplaceDashboardTest|PlatformStaffPolicyTest|AdminNewsletterTest'
```

- Final browser output: `test-results/admin-dashboard-final-2026-11-19`.
- Initial four-pass browser evidence: `test-results/admin-dashboard-verified-2026-11-19`.
- Real API totals, activity UUIDs and independent comparison flag:
  `real-dashboard-evidence.json` inside the real-dashboard browser case directory.
- Preservation: `test-results/admin-dashboard-integrity-2026-11-19.json`.
- [Access/deployment operations](../deployment/ADMIN_DASHBOARD_OPERATIONS.md).

The backup and generated evidence are Git-ignored, private local artifacts.
