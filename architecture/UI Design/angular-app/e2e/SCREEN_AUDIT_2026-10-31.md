# Role-by-role screen audit — 31/10/2026

Status: the application is **not yet fully dynamic or ready for production**.
The previously verified marketplace flow is real, but several surrounding
screens still read sample data or report browser-only changes as saved.
This step inventories those gaps; it does not silently enable unfinished APIs.

## Scope and counting

Source review covers 144 concrete route patterns using 64 active screen
components, across public/auth and all six portal families. Parameterized paths
count once, not once per database record. Six wildcard Coming Soon routes are
separate. Two explicitly planned sidebar destinations have no concrete screen:
/transporter/customers and /driver/profile.

Backend mode selects Staff Access for /admin/users; the prototype User Management
component is an inactive alternative and is not double-counted.

The figures below classify **source wiring**, not completed runtime features.
An API-connected route may still be inaccessible under its current identity/staff
policy, have action-level gaps or depend on intentionally deferred services.

| Area | Routes | API-connected | Mixed | Prototype | Local/static content | Payment/GPS deferred |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Public | 11 | 0 | 1 | 1 | 9 | 0 |
| Authentication | 8 | 4 | 3 | 1 | 0 | 0 |
| Admin | 32 | 8 | 1 | 13 | 3 | 7 |
| Shipper | 19 | 8 | 0 | 7 | 0 | 4 |
| Transporter | 25 | 9 | 1 | 9 | 0 | 6 |
| Truck owner | 24 | 8 | 1 | 9 | 0 | 6 |
| Driver | 9 | 1 | 0 | 7 | 0 | 1 |
| Company | 16 | 3 | 1 | 10 | 0 | 2 |
| Total | 144 | 41 | 8 | 57 | 12 | 26 |

Notifications are API-connected despite their mock-named wrapper. Static legal
copy is not inherently a bug; it needs approved content, not a fabricated API.
Local CMS administration is different: it is not shared server publishing.

## Prioritized findings

| Priority | Area | Gap and required outcome |
| --- | --- | --- |
| P0 | Homepage reviews | Empty or failed approved-review API falls back to sample/local-CMS testimonials. Backend mode must show only approved server reviews, with honest empty/error/retry states and no sample fallback. |
| P0 | Contact form | Clicking Send reports success and clears fields without an inquiry API. Implement validated persisted submission with anti-abuse controls and staff delivery/visibility, or explicitly disable sending until available. |
| P0 | Newsletter footer | Subscription success is browser localStorage, not a consent/subscriber record on the server. Add real subscription/consent, duplicate handling, rate limits and unsubscribe semantics before claiming subscription. |
| P0 | Business Settings | Company edits, branches and staff mutate one sample in-memory business. Real identity/tenant-scoped read/update validation must persist across reload and never expose sample staff, tax details or successful fake invitations. |
| P0 | Support | Tickets/replies only change memory; no actual case reaches staff. Implement owner-scoped tickets and authorized assigned-staff access, persistence, reply history and relevant bell routes. Do not just enable the incompatible legacy module. |
| P1 | Vehicle details | API vehicle list exposes View, but real UUIDs go to a mock-ID detail store and show Vehicle not found. Add owned detail retrieval and explicit loading/error/not-found states before enabling document/maintenance/fuel edits. |
| P1 | Landing dashboards | Shipper/owner/transporter/driver and company KPIs/recent rows are samples. Use scoped real aggregates/records with zero/empty/error states; no invented revenue, GPS positions or ratings. Admin dashboard currently stays blocked. |
| P1 | Trips/History/driver POD | Separate trip list/detail screens still use sample trips, independent of actual booking state. Wire the existing authoritative booking/trip lifecycle and driver assignment permissions; retain the real booking-level POD workflow. |
| P1 | Documents | Hub uses sample fleet/driver/trip data; uploads retain filenames only and POD download fabricates text. Require actual private file storage/retrieval, ownership, type/size checks, expiry metadata and audit trail. |
| P1 | Reports | Tables and CSV exports use sample datasets. Build scoped server analytics and truthful labels; generating a CSV does not make it a real report. |
| P1 | Driver details | Directory list/add uses API, but detail screen remains prototype and its backend View action is hidden. Complete the authorized profile/documents/assignment workflow before enabling it. |
| P1 | Signup/profile/workspaces | Non-signup OTP path and workspace selection still use mocks; additional profile/address/designation values are not proven persisted by the current credential-completion API. Business registration needs identity/tenant contract review. |
| P1 | Company portal | Company is not a backend UserType. No company-login identity is provisioned by current auth/signup; resolve organization-workspace design before claiming those 16 routes are usable. |
| P1 | Staff administration | Account/role writes, Finance/Support record scope and last-admin safeguards remain intentionally incomplete. Keep current allowlist and local-only activation; navigation changes must not grant access. |
| P2 | CMS/blog/careers/legal content | CMS/jobs/newsletter administration is localStorage/sample data and blocked for current staff. Implement shared authorized content publishing where required; review legal/marketing copy and unsupported statistics. |
| P2 | Notification failure feedback | Polling is real, but failed refresh/read acknowledgements are swallowed or optimistically shown. Add honest stale/error/retry handling without expiring a valid session for a network failure. |
| Deferred | Payment/GPS | Standalone finance/device/geofence screens still include prototype data. Real provider and GPS work remain excluded by the owner and were not exercised. Backend tracking intentionally hides demo coordinates. |

## Backend evidence and boundaries

- Current public signup accepts Shipper, Transporter and Truck Owner. UserType
  contains driver/customer/transporter/truck-owner/admin, not company.
- modules_statuses.json disables Support, Identity, DocumentManagement and
  Subscription. The Support source uses auth:sanctum and incompatible
  App\Models\User / Modules\Identity contracts, with insufficient per-record policy
  checks. Enabling a module is not a safe substitute for integration work.
- Existing marketplace loads, applications, negotiation, bookings, KYC and review
  APIs are separate from those incomplete modules. This audit does not undo
  or reclassify their previous end-to-end evidence.
- Current platform staff enforcement remains local-only. Blocked admin routes
  are not new failures caused by this audit and are not counted as implemented.

## Reproducible evidence

Reviewed source classifications and anchors:
[assessment catalogue](../audit/screen-assessments.json).

Complete per-route source matrix:
[JSON inventory](../test-results/screen-audit-2026-10-31/source-inventory.json),
[CSV inventory](../test-results/screen-audit-2026-10-31/source-inventory.csv).

## Visible browser execution

The final dedicated Chrome run completed all **10 diagnostic collections** in
about four minutes. Four source-inventory checks also passed. Passing collection
means the observation was recorded, not that the unfinished feature is correct.

It recorded **105 route visits across 79 distinct requested URLs**, plus form,
reload, feed-failure and forged-cache probes. There were 29 intentional staff
redirect observations to Staff Access. Those are policy boundaries, not working
implementations of the blocked destinations.

| Runtime coverage | Account reused | Recorded route visits |
| --- | --- | ---: |
| Public and authentication screens | Anonymous; no signup submitted | 19 |
| Shipper | qa-recovery-1793377725393@transportseva.test | 13 |
| Truck owner | verify-truck-owner-1793028294862-62@transportseva.test | 16 |
| Driver | driver1@test.local | 7 |
| Super Admin | admin@test.local | 24 |
| Operations Manager | qa-staff-20261029-operations@transportseva.test | 7 |
| KYC Officer | qa-staff-20261029-kyc@transportseva.test | 7 |
| Finance Manager | qa-staff-20261029-finance@transportseva.test | 6 |
| Support Agent | qa-staff-20261029-support@transportseva.test | 6 |

All eight authenticated identities were verified by the actual login/me API.
The Shipper's stored backend user type is customer. Passwords and assignments
were unchanged; the earlier recovery/staff reports contain their local QA
credentials. No new users were created for coverage.

### Reproduced observations

| Observation | Actual evidence |
| --- | --- |
| Shipper dashboard mismatch | Owned-load API returned HTTP 200 with 0 loads; dashboard showed 24 loads, 11 applications and 3 in transit |
| Truck-owner dashboard mismatch | Owned-vehicle API returned 5 vehicles; dashboard showed 9 |
| Real vehicle detail failure | UUID 121d76d4-ac5c-45e8-99f7-2a3b5e77c2d7 from the owned API rendered Vehicle not found |
| Profile false persistence | A browser draft appeared saved; reload restored the seeded Yadav Road Carriers profile |
| Support false persistence | A new browser ticket was visible before reload and absent after reload; legacy support endpoint returned 404 |
| Public inquiry false confirmation | Contact form showed message-sent success without any business API write attempt |
| Newsletter local-only state | Subscription stored in that browser's newsletter localStorage; no business API write attempt |
| Review publication fallback | Local API fixtures for empty HTTP 200 and failed HTTP 503 both displayed the sample Rakesh Sharma testimonial |
| Role-cache boundary | Forged company display role did not grant a Company portal; the server-verified Shipper identity returned to its own dashboard |
| Staff boundaries | All five staff roles retained their current server allowlists; unsupported destinations redirected instead of granting access |

The seeded business name is sample data, not proof that another real tenant's
database profile was exposed. Its presence under an unrelated logged-in identity
still makes this screen unsuitable as genuine business settings.

### Coverage limits

- Transporter's 25 route patterns were reviewed in source, not logged into:
  a working password for the existing account was not available. It was not
  reset, impersonated or relabelled as a passed browser test.
- Company's 16 route patterns were reviewed in source; the backend has no
  company UserType. Only the negative cache-claim boundary was tested.
- Parameterized routes were inventoried, not exhaustively executed for every
  record. Owned real vehicle and driver UUID detail probes were included.
- This was not another full signup-to-settlement marketplace regression.
  No real booking changes, moderation, file uploads/downloads, payment or GPS
  actions were performed, and external message delivery remained disabled.
- An initial collection had 9 passes and one audit-fixture timeout: it expected
  the heading Support Tickets, but the actual screen heading is Support.
  That selector and the action timeout were corrected; the complete final
  10-case collection passed without changing application code.

### Safety and artifacts

Business write requests and non-local hosts were blocked by the diagnostic
browser context. None of the browser-only save/send actions even attempted a
business API write. Normal authentication session/login bookkeeping did occur.
No stored password, role, schema, user profile, load, booking, support case or
public review was changed. The backend working tree stayed unchanged.

Main database remains transportseva with 100 base tables. Staff enforcement
remains local-only. There was no migration, seeding, table reset, import or
deletion. Browser-only drafts/consent samples were isolated to disposable test
contexts. Existing QA/demo logins are not suitable production accounts.

Final evidence:
[browser report](../test-results/screen-audit-browser-final-2026-10-31.json),
[compact summary](../test-results/screen-audit-2026-10-31/browser-summary.json).
The initial stopped collection is retained separately for transparency.

Added reusable audit tools and a dedicated Playwright configuration. Ordinary
regression discovery excludes these diagnostics; 49 existing regression cases
remain discoverable in 8 files. Those 49 business regression cases and the
Angular/backend suites were **not re-executed** in this source-audit step.
Application feature code and backend permissions were not modified.

## Proposed implementation order

Subsequent scoped repair: homepage sample-review fallback and real vehicle
overview/navigation are now fixed and tested. See
[repair results](REVIEWS_VEHICLE_DETAILS_2026-10-31.md).
The observations above remain the original audit history; other findings are
still open. The generated source inventory now reflects these two repairs.

The Shipper/Truck Owner dashboard KPI and recent-record samples were also
subsequently replaced with self-scoped API data. See
[dashboard repair results](MARKETPLACE_DASHBOARDS_2026-10-31.md).
Admin, Transporter, Driver and Company dashboard findings remain open.

The active business-account profile screen was subsequently connected to
self-owned persistence, validation, version conflicts and real notifications.
See [business-profile repair results](BUSINESS_PROFILE_2026-10-31.md).
Company tenancy/staff/billing and optional signup metadata remain separate.

1. Remove homepage sample-review fallback and give genuine feed empty/error states.
2. Fix real vehicle detail retrieval/navigation, then connect the shipper/owner
   dashboards to scoped aggregates. Never derive user data by trusting a role label.
3. Persist business profile fields against the correct user/organization model.
   Decide Company workspace semantics before branch/staff invitation work.
4. Build actual owner/assigned-staff Support and inquiry workflows; separate
   general support from admin-decided marketplace disputes.
5. Connect Trips/History/driver assignment, private Documents and real Reports
   without enabling deferred money or GPS actions.
6. Finish shared content publishing and staff administration under separately
   reviewed permission/lockout safeguards; then rerun all role/action boundaries.

Each implementation task must include API authorization/validation, UI loading,
error and empty states, visible action feedback, database persistence/reload,
cross-account negative tests and real bell routing where applicable.

31/10/2026 follow-up: optional signup fields/preferences now persist on the
dashboard Profile page, with mandatory server-enforced profile + login-email
verification for self-service users. Company tenancy/staff/billing remain
separate. See [onboarding evidence and QA accounts](ACCOUNT_ONBOARDING_2026-10-31.md).

31/10/2026 follow-up: public Contact Us now persists real enquiries with honest
receipts, anti-spam/idempotency checks and a private capability-gated staff queue,
audit/history and exact-item bell routing. Legacy Support Tickets and outbound
email remain separate. See [Contact enquiry evidence](CONTACT_INQUIRIES_2026-10-31.md).
