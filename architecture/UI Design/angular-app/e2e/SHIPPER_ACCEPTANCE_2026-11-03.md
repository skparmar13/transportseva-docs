# Shipper acceptance — 03/11/2026

Verified again on **04/11/2026 at 08:47 PM IST**. Implementation and test
evidence were present; this missing handoff report was completed during that
verification. The current database matches the recorded post-test state for
all ten checked marketplace/account tables. No additional QA records were
created during the 04/11 verification.

## Result and scope

The **15 non-deferred Shipper routes** were exercised in visible local Chrome.
The latest result for each of **46 distinct browser cases is passing**, across
explicit runs. This is a local acceptance result for the cases below.

| Route under /shipper | Verified behavior | Result |
|---|---|---|
| dashboard | Four totals and recent-load IDs match the authenticated API; reload works | Pass |
| post-load | Contact-number validation; labelled QA load saves and appears after reload | Pass |
| my-loads | Own real rows, currency and server pagination; reload | Pass |
| load-board/:id | Actual application, counter-offer, accepted amount and concurrent chat | Pass |
| applications | Owner-scoped received list, real pagination, visible failure and successful Retry | Pass |
| bookings | New accepted booking appears for both parties; reload retains its reference | Pass |
| reviews | Pending submission, locked/reloaded state, public feed excludes unapproved review; read failure/Retry | Pass |
| kyc | Pending QA upload, original-byte download; approved original record preserved; read failure/Retry | Pass |
| trips | Real owned history, filters, zero state and foreign-access rejection | Pass |
| trips/:id | Exact owned detail, recorded timeline, original POD, stale/error recovery and deep links | Pass |
| reports | Real totals, filters, paging, complete applied-filter CSV and relevant-item links | Pass |
| documents | Own POD/KYC only, original downloads, missing-file/error states, cross-account rejection | Pass |
| notifications | Server unread total, full-page paging/filter, failed-write feedback, persisted read/all acknowledgements | Pass |
| support | New private ticket validation, creation, one reply and exact history after reload | Pass |
| profile | Optional personal fields/preferences and business profile save/reload; original values restored | Pass |

The new marketplace journey ends at **awaiting_tokens**. Real payment, forced
payment-success simulation, new-trip advancement, GPS/mobile location ingestion
and outbound OTP/email/SMS delivery were excluded. Existing trip/POD records were
used for read/download checks. No review publication or KYC approval was performed.
Staff support resolution, company tenancy and other roles' prototype screens
remain separate work.

## Reproduced defects and repairs

The first 20-case acceptance run passed all 15 route checks and reproduced five
failure cases:

| Defect | Resulting behavior |
|---|---|
| Applications Received swallowed API failures into an empty success | Visible error and Retry; successful recovery retrieves real rows |
| My Loads silently capped its result without pagination | Server-backed Previous/Next, page and total; received applications also gain a bounded owner-only aggregate endpoint |
| Failed KYC read exposed a new submission form | Loading/error/loaded states are distinct; Retry required before submission |
| Failed review read exposed a writable new review | Same explicit read states; saved pending reviews remain locked |
| Notification reads changed client state before server acknowledgement | Acknowledged writes, retained unread state on failure, visible Retry and action feedback |

Notification totals now include unread records outside the current page. The
bell loads five recent records; the full page independently paginates all records.
Raw server dates are formatted once. Isolated tests exercise 101 loads, 101
applications on one load, 55 notifications and owner/foreign/role boundaries.

The private portal layout now loads lazily while retaining its parent/child
guards. This keeps the production startup bundle within the existing 1 MB hard
limit; no budget was increased.

## Validation evidence

| Check | Recorded result |
|---|---|
| Visible Chrome | 46/46 distinct cases passing, latest result per case across explicit runs |
| Angular regression suite | 298/298 passing |
| Backend selected regression suite | 137/137 passing; 1,506 assertions; transactional guarded test database |
| Source inventory | 5/5 passing; rerun on 04/11 |
| Production build | Passed; initial bundle 979.22 kB; existing 500 kB warning remains |
| Changed PHP files | Syntax checks passed |

Browser coverage comprises 20 acceptance route/failure cases, six Documents,
six Reports, six Trips, six action cases and two Shipper business-profile cases.
The initial browser run and intermediate failures remain in their original
artifacts. Subsequent test-fixture corrections used deterministic request gates,
client navigation and precise selectors. The chat notification route is resolved
from its validated load/application/message IDs, so a null optional action_url
is not a failed deep link.

Local artifacts, excluded from Git:

- [Consolidated browser results](../test-results/shipper-browser-summary-2026-11-03.json)
- [Created QA records](../test-results/shipper-actions-records-2026-11-03.json)
- [Before/after preservation comparison](../test-results/shipper-database-integrity-2026-11-03.json)
- [04/11 database verification](../test-results/shipper-verification-2026-11-04.json)

The backend run selected ShipperAcceptanceDataTest, ShipperReportsTest,
ShipperDocumentsTest, ShipperTripHistoryTest, AccountSupportTicketTest,
ContactInquiryTest, PlatformStaffPolicyTest, AccountOnboardingTest,
AccountBusinessProfileTest, MarketplaceDashboardTest and MarketplaceVehicleDetailsTest.
It used transportseva_employee_test; browser QA records use transportseva.

## Existing QA credentials used

No new users or passwords were created or changed.

| Role / purpose | Login email | Password |
|---|---|---|
| Shipper: marketplace, review and read checks | verify-shipper-1793028294862-61@transportseva.test | TransportSevaE2E@2026 |
| Shipper: KYC, support, profile and mark-all | qa-recovery-1793377725393@transportseva.test | RecoveryFinal@2026! |
| Truck owner: application, negotiation and chat | verify-truck-owner-1793028294862-62@transportseva.test | TransportSevaE2E@2026 |

Registered QA vehicle: **ALLOC036252590A**. No new vehicle was needed.

## Retained QA record IDs

Both loads are labelled **QA acceptance … DO NOT TRANSPORT**, Delhi to Jaipur.
Both bookings have agreed freight **₹17,000** and remain **awaiting_tokens**.

| Record | Reference | UUID |
|---|---|---|
| Load from earlier browser attempt | LD-000038 | 4cd5e46d-7f33-4b6d-bf3c-6f58ea69f192 |
| Its application | — | d568d53a-c9c0-4b8e-94ae-793dee6efb53 |
| Its booking | TS-DPZMCCIZKB | ca030313-c211-4665-ac66-8cf077f42bc5 |
| Load from fully passing marketplace case | LD-000039 | 3086dfc2-ce13-4f5c-b0d6-a72c10a287c0 |
| Its application | — | a55b68ff-26e8-4295-b0cc-382717fbb557 |
| Its booking | TS-DRLFEKM53D | 3527de3b-f022-4942-bcaa-bb5f402d7d46 |
| Pending review; labelled do not publish | — | ba23988c-a41f-4b78-9524-4dc98cdd2804 |
| Pending dummy QA KYC; labelled do not approve | QA-acceptance-do-not-approve.png | 78acd6ae-b0c8-4a7f-86ac-949d29523d0f |
| Private QA support ticket; no action needed | ST-20261103-2F8JL3B4SLMB | d9aee85b-cf8b-4044-84de-91fe06b2d6fc |

The earlier attempt created its booking successfully, then stopped at an overly
strict test assertion about the optional notification action_url. Its labelled
records were retained and disclosed rather than deleted. The final case verified
two open browser conversations, the recipient bell link and its persisted read
acknowledgement.

## Database preservation

A complete, checked **107-table** local backup was taken before business writes:

    .local-backups/transportseva-before-shipper-acceptance-2026-11-03-9882f7fc.sql

Size: **1,054,304 bytes**. SHA-256, rechecked on 04/11:

    3E5D1F459AC9F026C3B1978420A4D5B7F1515E6DCD18E287B91FDF702EA14751

| Table | Before → after | Pre-existing rows |
|---|---|---|
| loads | 37 → 39 | Unchanged |
| load_applications | 51 → 53 | Unchanged |
| marketplace_bookings | 24 → 26 | Unchanged |
| booking_token_orders | 27 → 27 | Unchanged |
| marketplace_settlements | 2 → 2 | Unchanged |
| marketplace_kyc_profiles | 3 → 4 | Unchanged |
| marketplace_reviews | 12 → 13 | Unchanged |
| account_support_tickets | 8 → 9 | Unchanged |
| account_support_events | 22 → 24 | Unchanged |
| account_business_profiles | 2 → 2 | Secondary QA profile version/timestamps advanced; original field values restored |

Users remain **103** and role memberships **11**. Identity/credential and access
table hashes are unchanged. Staff enforcement remains local and enabled.
Optional personal fields/preferences and business-profile values were restored;
their save versions/timestamps naturally advanced. Normal QA session bookkeeping,
new database bell notifications and QA read flags changed during execution.
No database reset, migration, import, deletion or backup restore was performed.

The 04/11 read-only verification found no missing, changed or added rows relative
to the recorded post-test state in these ten tables. The two bookings still await
tokens; the QA review and KYC still await moderation.
