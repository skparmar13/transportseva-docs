# Fresh signup and booking role matrix - 20/11/2026

21/11 follow-up: the two financial display defects listed as remaining below
are now fixed. Bank setup and recipient-confirmed receipt handling remain
separate work. See [financial display fixes](BOOKING_FINANCIAL_FIXES_2026-11-21.md).

**All four supported booking pairings completed using newly signed-up accounts
in `transportseva`.** Five accounts passed signup, mandatory profile completion,
sandbox email verification and real logout/login. Each fresh load received
three applications. One negotiated offer was accepted and the other two were
rejected. All four bookings reached approved POD and recorded final settlement.

The tests ran in visible Chrome. They used real local API/database records,
not intercepted successful business responses or manually inserted bookings.
Token checkout used the configured local mock provider; advance/mid-trip/final
actions recorded status only. This is not bank-collection, payout or live GPS
verification. Local KYC enforcement was already off; no KYC approval was forged
or requirement disabled for the test. OTP/email delivery remained sandbox-only.

## Role combinations

Rows are the load poster; columns are the selected provider. "Unavailable"
means no supported workflow in the current UI, not a newly tested API permission
restriction.

| Poster / Provider | Shipper | Transporter | Truck Owner |
| --- | --- | --- | --- |
| Shipper | Unavailable: Shipper has no provider workflow | **Passed** | **Passed** |
| Transporter | Unavailable: Shipper has no provider workflow | **Passed with two different accounts** | **Passed** |
| Truck Owner | Unavailable: no posting workflow | Unavailable: no posting workflow | Unavailable: no posting workflow |

An actual self-application by the posting Transporter returned HTTP 422.
The Transporter-to-Transporter positive case used different users; it did not
permit self-booking. Sidebar checks confirmed the unavailable Shipper provider
and Truck Owner posting entries were absent. Those unsupported combinations
were not presented as completed bookings.

## New retained users and credentials

Login: `http://localhost:4300/auth/login`.
Password for **all five local QA accounts**: **`MatrixQA@2026!20`**.

| Code | Role | Email | Mobile |
| --- | --- | --- | --- |
| S | Shipper | `qa-matrix-20261120-01-s@transportseva.test` | `7811200101` |
| TA | Transporter, poster and provider | `qa-matrix-20261120-01-ta@transportseva.test` | `7811200102` |
| TB | Second Transporter | `qa-matrix-20261120-01-tb@transportseva.test` | `7811200103` |
| OA | Truck Owner | `qa-matrix-20261120-01-oa@transportseva.test` | `7811200104` |
| OB | Competing Truck Owner | `qa-matrix-20261120-01-ob@transportseva.test` | `7811200105` |

All five passwords were independently checked against their saved hashes after
the journeys. All five accounts are profile-complete and email-verified. These
are retained accounts in the main local database, unlike the rolled-back
fixtures in the earlier booking audit. No existing account/password was changed.

Each provider registered a vehicle and driver through its own portal:
`QAMX6112001TA`, `QAMX6112001TB`, `QAMX6112001OA`, `QAMX6112001OB`.
All are clearly labelled QA records. No new administrator was created or used.

## Bookings and financial breakdown

All amounts are INR. Commission includes the application's configured tax on
both side fees; it is not a verified receipt of money.

| Case | Owner → provider | Load | Booking | Freight | Combined fees including tax | Recorded final amount |
| --- | --- | --- | --- | ---: | ---: | ---: |
| Shipper → Truck Owner | S → OA | LD-000040 | **TS-ZQXTRJ91OQ** | 17,000.00 | 2,006.00 | 9,203.00 |
| Shipper → Transporter | S → TA | LD-000041 | **TS-SXBBM7PMLW** | 18,500.00 | 2,183.00 | 10,191.50 |
| Transporter → Truck Owner | TA → OA | LD-000042 | **TS-GU9HRESAPQ** | 18,000.00 | 2,124.00 | 9,862.00 |
| Transporter → Transporter | TA → TB | LD-000043 | **TS-M90RRWPIY1** | 20,000.00 | 2,360.00 | 11,180.00 |

| Breakdown | LD-000040 | LD-000041 | LD-000042 | LD-000043 |
| --- | ---: | ---: | ---: | ---: |
| Shipper/owner fee | 1,003.00 | 1,091.50 | 1,062.00 | 1,180.00 |
| Provider fee | 1,003.00 | 1,091.50 | 1,062.00 | 1,180.00 |
| Combined fee before configured tax | 1,700.00 | 1,850.00 | 1,800.00 | 2,000.00 |
| Combined configured tax | 306.00 | 333.00 | 324.00 | 360.00 |
| Owner total obligation, excluding token | 18,003.00 | 19,591.50 | 19,062.00 | 21,180.00 |
| Calculated provider net entitlement | 15,997.00 | 17,408.50 | 16,938.00 | 18,820.00 |
| Loading advance recorded released | 6,800.00 | 7,400.00 | 7,200.00 | 8,000.00 |
| Mid-trip recorded released | 2,000.00 | 2,000.00 | 2,000.00 | 2,000.00 |
| Remaining freight | 8,200.00 | 9,100.00 | 8,800.00 | 10,000.00 |
| Final including owner fee | 9,203.00 | 10,191.50 | 9,862.00 | 11,180.00 |

Each booking has two paid mock token orders of 1,000 each. Tokens remain separate
from freight and fees. Final records use reference
`QA-MATRIX-STATUS-ONLY-20261120-01`. Independent reads confirmed one canonical
booking per load, correct fee conservation, approved POD, completed booking,
settled record and the expected final amount in every case.

UUIDs and the complete numeric breakdown are available in the private local
[matrix CSV](../test-results/booking-matrix-records-2026-11-20.csv) and
`.local-runtime/booking-matrix/verified.json`.

## Flow executed for every supported pairing

| Stage | Exercised behavior | Result |
| --- | --- | --- |
| Signup | Actual role selection, unique phone/email, password, phone OTP | Passed for all five accounts |
| Mandatory onboarding | Profile gate, saved optional fields/preferences, sandbox email challenge, verification and relogin | Passed for all five |
| Fleet | Four owned vehicle registrations and four registered drivers | Passed |
| Load | New Delhi → Navi Mumbai load with budget 22,000 | Passed for all four loads |
| Multiple applicants | Three distinct providers per load; includes two Truck Owners on three cases | Passed; 12 applications |
| Negotiation | Initial quotes 21,000; owner or applicant counter-offer; opposite party accepts | Passed at exact agreed freight |
| Competing offers | Selected application accepted, other two rejected | Passed; eight declined applications |
| Tokens | Owner and provider use mock checkout; booking becomes confirmed | Passed; eight token orders |
| Assignment | Provider selects its own registered vehicle and driver | Passed |
| Loading | Provider marks loading complete; owner confirms | Passed |
| Advance/departure | Owner records 40% advance; provider starts trip | Passed |
| Mid-trip | Owner creates 2,000 milestone and records release | Passed |
| Delivery/POD | Provider completes trip and uploads file; owner approves signed POD | Passed |
| Final settlement | Owner prepares settlement, checks amount, records final status | Passed |
| Persistence/access | Both participant views survive reload; unrelated applicant's booking read returns 403 | Passed |
| Notifications | Expected event recipients and exact booking bell links | Passed |

The first and third cases use an owner counter-offer accepted by the provider.
The second and fourth use an applicant counter-offer accepted by the owner.
The cases test independent bookings, not a linked multi-leg subcontracting chain.
They all release the advance; the previously reported unreleased-advance defect
was not silently treated as covered or fixed.

## Product fix discovered by this matrix

The load-details screen previously decided ownership by comparing poster role
to current role. That made another Transporter appear to own a
Transporter-posted load, preventing the provider workflow.

The private load resource now returns `viewer_is_owner`, derived from the
authenticated account UUID and canonical load owner. No other person's UUID is
exposed. Backend mode uses that boolean and fails closed when absent; explicit
prototype behavior remains separate. Server permission checks remain unchanged.

The new UI regression first failed two of three cases against the old logic,
then passed all three after the fix. The backend regression checks two same-role
accounts against detail/list responses and confirms caller query flags cannot
forge ownership. It is retained in the API's normal Feature suite as
`LoadViewerOwnershipTest.php`.

## Executed checks

| Check | Result |
| --- | --- |
| Headed fresh signup/profile/email/relogin/fleet cases | **5 passed** |
| Headed four complete booking pairings plus role boundary case | **5 passed** |
| Headed notification matrix | **1 passed** |
| Full Angular suite | **467 passed** |
| Ownership backend regression | **1 passed, 12 assertions** |
| MarketplaceWorkflow and MarketplacePublicApi backend suites | **12 passed, 204 assertions** |
| Source audit | **18 passed** |
| Production browser/SSR build | Passed, 11 prerendered routes |
| Independent persisted records and password checks | All passed |
| Existing-row preservation | All 13 checked sets preserved; expected additions only |

Backend total: **13 distinct tests, 216 assertions**. The build retains the
existing 954.70 kB initial bundle warning against 500 kB; the unchanged 1 MB
error limit passes. Backend regression fixtures remain in the guarded isolated
test database; the actual browser-created accounts and bookings are in
`transportseva`.

Journeys ran across resumed visible runs. Completed cases were re-verified
instead of duplicated. Initial harness issues used the Truck Owner vehicle,
driver and booking URL conventions for Transporter; they were corrected to
`/fleet`, `/fleet/drivers`, `/requests`. The provider negotiation button is
"View Negotiation", distinct from owner "View Offers"; the selector now covers
both. No business permission was weakened to satisfy these harness corrections.

## Notification coverage

For every booking, the owner received vehicle/driver assignment, loading request,
trip start/completion and POD submission events. The provider received loading
confirmation, milestone release, mid-trip creation, POD approval and final
settlement events. Both declined applicants and the counter-offer recipient
were checked. Four real bell clicks opened the correct participant booking route,
including `/transporter/requests?booking=...`. Notification checks allowed only
auth and read-acknowledgement writes. No unexpected business write occurred.

## Backup, preservation and retained additions

A full verified backup was exported before new accounts or bookings:

- `.local-backups/transportseva-before-role-matrix-2026-11-20.sql`
- 1,171,339 bytes, 109 CREATE TABLE statements and completion footer verified.
- SHA-256: `970e8e130b0b83d921245e1851aa44c0a7348a71ca781856f910a597f29809d3`.

All **109 table names** and hashes of all pre-existing rows in these 13 checked
sets were preserved. Only expected additions occurred:

| Table | Before | After | Added |
| --- | ---: | ---: | ---: |
| users | 103 | 108 | 5 |
| loads | 39 | 43 | 4 |
| load_applications | 53 | 65 | 12 |
| negotiation_offers | 59 | 75 | 16 |
| marketplace_bookings | 26 | 30 | 4 |
| marketplace_settlements | 2 | 6 | 4 |
| booking_token_orders | 27 | 35 | 8 |
| marketplace_vehicles | 34 | 38 | 4 |
| marketplace_drivers | 8 | 12 | 4 |
| marketplace_disputes | 7 | 7 | 0 |
| role_user | 11 | 11 | 0 |
| roles | 9 | 9 | 0 |
| role_permission | 101 | 101 | 0 |

User row hashes exclude `last_login_at` and `updated_at` authentication
bookkeeping. Other checked rows use their full stored values. This is not a
full-database row audit; new profile, challenge, notification and auth records
are expected outside these sets. There was no schema migration, reset, drop,
import, restore, cleanup or change to older bookings. Staff mappings/grants and
deployment defaults were retained.

## Remaining limits and issues

- The earlier unreleased-advance final-balance defect remains unresolved.
- The token "Released" label still derives from completion without proof of
  refund/credit; actual token disposition is not validated by these mock orders.
- Booking headers/counterparty roles still contain generic labels, visible in
  the Transporter-to-Transporter screenshot. Those labels need real metadata.
- Visual review shows SQL-style booking/settlement timestamps displayed on a
  different time basis from ISO workflow timestamps. Timezone normalization
  remains necessary; the requested date/time shape alone does not solve it.

These passes establish the supported role combinations with an advance released;
they are not an unconditional production sign-off or a claim that every financial
edge case, tracking device or delivery channel is verified.

## Reproduce and artifacts

Set a fresh local run identifier only after the local backup/baseline preflight:

```powershell
$env:E2E_MATRIX_RUN='20261120-01'
npx.cmd playwright test e2e/booking-signup-matrix.spec.ts --headed
npx.cmd playwright test e2e/booking-matrix-notifications.spec.ts --headed
```

The recorded run identifier intentionally resumes its retained records; it does
not create another copy. Generated artifacts are private and Git-ignored:

- `.local-runtime/booking-matrix/20261120-01.json`: users, credentials, steps and responses.
- `.local-runtime/booking-matrix/verified.json`: independent persisted proof.
- `test-results/booking-matrix-signups-2026-11-20`: final signup/fleet cases.
- `test-results/booking-matrix-flows-2026-11-20`: original first full journey.
- `test-results/booking-matrix-flows-resumed-2026-11-20`: final pairing run and owner/provider screenshots.
- `test-results/booking-matrix-notifications-2026-11-20`: notification recipient/link evidence.
- `test-results/booking-matrix-integrity-2026-11-20.json`: preservation proof.
- `test-results/booking-matrix-records-2026-11-20.csv`: booking IDs and amounts.
- `.local-runtime/booking-matrix/*-junit.xml`, Angular/source/build logs: executed check results.
