# Booking flow and financial audit - 20/11/2026

**Result: the core authenticated booking lifecycle passes, but the entire
booking UI is not ready for an unconditional pass.** An unreleased-advance
balance defect and misleading token-release display remain. Historical QA
records also contain incomplete evidence. This task checked and documented
these gaps; no financial policy or existing booking was changed.

## What was checked

| Layer | Execution | Result |
| --- | --- | --- |
| Main database | Read-only audit of all 26 saved marketplace bookings in `transportseva` | All stored fee snapshots match configured policy; both saved final amounts reconcile; no duplicate booking per load/application |
| Fresh authenticated lifecycle | Two transactional JWT API journeys, one with loading advance released and one without | Both passed through delivery, approved POD and recorded final settlement |
| Commission calculations | Fixed-fee threshold, percentage fee and configured tax rounding | Passed |
| Booking/onboarding regressions | Workflow, fleet allocation including competing processes, KYC, cancellation, performance, signup OTP and mandatory profile/email verification | 42 passed, 543 assertions |
| New lifecycle/commission checks | Two full journeys plus fee boundary test | 3 passed, 165 assertions |
| Visible Chrome | Both saved-booking participants, old-account onboarding enforcement, controlled balance-defect reproduction | 4 checks passed; the fourth confirms an unresolved defect, not correct financial display |

Total backend execution: **45 tests, 708 assertions**. No production build or
full Angular regression was necessary because product source was not changed.
The main UI checks were read-only; the full action replay used the guarded
`transportseva_employee_test` database. Token checkouts there used the mock
provider; advances/final payments recorded application status only. No bank
collection, transfer, commission receipt or token refund was verified.

Signup/onboarding regressions ran separately from the booking journeys. The
journeys started with profile-complete, email-verified transactional accounts;
this was not a new single uninterrupted browser signup-to-settlement run.

## Saved bookings and amounts

These identifiers already exist in `transportseva`; they are not newly created
main-database test records. Monetary values below are INR. Commission totals
include the application's configured tax component.

The configured policy charges each side a fixed 300 plus configured tax for
freight up to 10,000; above that it charges 5% of freight plus 18% tax on that
fee. These are application settings, not a tax-compliance determination.

| Item | TS-VFFGTIOL3U | TS-SXIFZM3X1R | TS-KOQKWAZAA8 |
| --- | ---: | ---: | ---: |
| Load | LD-000037 | LD-000013 | LD-000030 |
| Agreed freight | 11,500.00 | 18,500.00 | 18,000.00 |
| Shipper platform fee | 678.50 | 1,091.50 | 1,062.00 |
| Provider platform fee | 678.50 | 1,091.50 | 1,062.00 |
| Total platform fees including configured tax | **1,357.00** | **2,183.00** | **2,124.00** |
| Combined fee before configured tax | 1,150.00 | 1,850.00 | 1,800.00 |
| Combined configured tax | 207.00 | 333.00 | 324.00 |
| Total shipper obligation, excluding security token | 12,178.50 | 19,591.50 | 19,062.00 |
| Calculated provider net entitlement | 10,821.50 | 17,408.50 | 16,938.00 |
| Loading advance recorded released | 4,600.00 | 7,400.00 | 0.00 |
| Mid-trip amount recorded released | 2,000.00 | 2,000.00 | 0.00 |
| Remaining freight | 4,900.00 | 9,100.00 | 18,000.00 |
| Final amount including shipper fee | **5,578.50** | **10,191.50** | **19,062.00** |
| Shipper / provider token status | Paid / Paid | Paid / Paid | Paid / Paid |
| Token amount per party | 1,000.00 | 1,000.00 | 1,000.00 |
| POD | Approved | Missing in historical workflow | Approved |
| Recorded settlement | Settled | Settled, explicitly test-only reference | Not prepared |

The third booking's final amount is the **server-correct amount still due**,
not a recorded payment. The second contains reference
`E2E-TEST-ONLY-NO-PAYMENT`. A `settled` row and calculated provider entitlement
are not proof of receipt or payout. Token amounts remain separate from freight
and commission; neither final calculation credits those tokens automatically.

| Booking | UUID | Load UUID |
| --- | --- | --- |
| TS-VFFGTIOL3U | `20c93bbb-1815-4d56-aae8-7e12895ed976` | `dc9e08b5-f1b8-4db7-b949-b595ea0dc2f4` |
| TS-SXIFZM3X1R | `346c7138-9071-4698-886c-37ba3e80c85e` | `7aa9c4d6-5c83-429c-a8e7-83ee1a508764` |
| TS-KOQKWAZAA8 | `5c18b398-8a75-4017-9ecf-e268282a4852` | `d3bb161e-026f-4c5e-a550-6ce51db3fc37` |

All 26 records, user emails, amounts and states are in the private local
[booking CSV](../test-results/booking-audit-records-2026-11-20.csv).

## Users

| Purpose | Account | Booking / result |
| --- | --- | --- |
| Browser-tested shipper | `verify-shipper-1793028294862-61@transportseva.test` | TS-KOQKWAZAA8 visible, approved POD, reload retained record |
| Browser-tested truck owner | `verify-truck-owner-1793028294862-62@transportseva.test` | Same saved booking visible from provider portal |
| Browser-tested older shipper | `e2e-shipper-90594444-11@transportseva.test` | TS-SXIFZM3X1R owner; login correctly redirects to Profile and booking API returns ACCOUNT_ONBOARDING_REQUIRED |
| Historical settled-booking shipper, database audit only | `shipper@yopmail.com` | TS-VFFGTIOL3U |
| Historical settled-booking transporter, database audit only | `test.transporter@yopmail.com` | TS-VFFGTIOL3U |
| Historical selected owner, database audit only | `e2e-truck-owner-90594444-2@transportseva.test` | TS-SXIFZM3X1R |

No main users or passwords were created/reset. Existing QA credentials were
used for the three visible logins. Browser traffic blocked business writes.

## Fresh complete-flow replay

Primary isolated booking: **TS-CYIVNFEIBE**,
UUID `41bc2c1a-7b27-4707-9b65-072322f92683`.
Load UUID: `f271ce74-842f-42d4-95bf-be2e433f0eee`.
These fixtures were rolled back and cannot be opened in the main UI.

| Step | Exercised outcome |
| --- | --- |
| Load post | Shipper posted Delhi to Navi Mumbai at budget 20,000 |
| Multiple applicants | Two distinct truck owners applied at 19,000 and 18,000 using their own vehicles |
| Negotiation | Shipper offered 17,000 to the first applicant; provider accepted; competitor became rejected |
| Booking creation | One canonical booking at 17,000; repeated create returned the same UUID |
| Fee snapshot | Shipper fee 1,003; provider fee 1,003; combined fees 2,006; shipper total 18,003; provider net 15,997 |
| Token gate | Each party's mock token 1,000; premature trip start denied; both paid statuses confirmed booking |
| Assignments | Provider assigned owned registered vehicle and available registered driver |
| Loading gate | Premature advance/departure denied until shipper confirmed loading |
| Advance / departure | Advance 6,800 recorded released; provider started trip |
| Mid-trip milestone | Over-limit amount rejected; 2,000 created and recorded released |
| Delivery / POD | Provider completed trip and uploaded signed POD; foreign read/download denied; shipper downloaded and approved |
| Settlement | Preparation blocked before POD approval; then pending settlement created |
| Final amount | Wrong amount rejected; 8,200 freight plus 1,003 shipper fee = **9,203** recorded once; duplicate final action denied |
| Notifications | Expected application, assignment, loading, trip, POD and settlement bells persisted for concerned parties |
| Terminal restrictions | Delivered booking rejected further operational changes |

A second isolated booking, **TS-JXLCNRMHEI**, repeated the journey without
releasing the loading advance. The server correctly required 15,000 remaining
freight after the 2,000 mid-trip record, plus 1,003 fee = **16,003**. It did not
deduct an unpaid advance. This exposes the UI mismatch described below.

Primary temporary fixture users, **all rolled back**:

| Role | Fixture email |
| --- | --- |
| Shipper | `booking-audit-be03087d-fc9f-4ca1-ab5c-7041b1a34686@example.test` |
| Selected owner | `booking-audit-0cda5bae-38e0-4636-a463-ffc44beb7144@example.test` |
| Competing owner | `booking-audit-c30de0e9-7c36-4417-86ea-e9779c360ed7@example.test` |

These are test implementation fixtures, not retained login accounts. Full
actor UUIDs and the second journey are in the private lifecycle JSON evidence.

## Findings requiring follow-up

| Priority | Finding | Evidence and effect |
| --- | --- | --- |
| High | Unreleased advance deducted from UI final balance | `mapBackendBooking` always subtracts planned 40% advance. On an 18,000 booking with no released advance/mid-trip payment, a controlled pending-settlement response displays freight 10,800 and final due 11,862. Server-correct values are 18,000 and 19,062: undercount **7,200**. The default final-payment input would be rejected by the server. |
| High | Token "Released" display is inferred from delivery | The mapper sets token/escrow status to Released when booking status is completed. TS-KOQKWAZAA8 is delivered with paid token orders but no settlement/refund record; the display still says Released. This is not evidence that the security tokens were returned. |
| Medium | Historical settled QA booking lacks current prerequisite evidence | TS-SXIFZM3X1R has no approved POD or loading-confirmation timestamp in its saved workflow. Fresh JWT tests enforce those gates. Do not fabricate documents/timestamps or treat that old row as proof of today's full flow. |
| Medium | Booking header uses generic metadata | Backend mapper still supplies "Marketplace booking", "General Cargo" and a generic counterparty/role instead of the actual linked load and party. Exact booking/assignment/POD records are real, but these header labels need correction. |

The balance-defect browser case intercepts only a GET response to present a
pending settlement; it does not prepare or settle a real booking. Its assertion
passes because the known wrong values were reproduced. It must be replaced by
a correctness regression when the calculation is fixed.

Token disposition and actual commission collection remain unverified. Current
completion records do not execute a token refund/credit or demonstrate a bank
receipt for platform fees. These should not be claimed as collected revenue.

The five delivered bookings comprise two recorded settled rows and three
without settlement records: TS-S5HPUKJ1FH, TS-KOQKWAZAA8 and TS-MBNEEWBCMC.
The last also lacks an approved POD. These pending states are not automatically
errors: delivery and financial settlement are separate stages.

## Corrections made during verification

Only test code was corrected. The legacy operational user fixture now reloads
its persisted row before saving profile/email verification timestamps. The
model does not return its database-generated ID immediately after creation, so
saving verification on the unreloaded instance had left those fields null.
The previous JWT smoke test therefore failed correctly with onboarding 403.
Its final rerun passes without weakening middleware. The test assertion now
includes a safe response body on failure for diagnosis.

The runner guard initially booted an extra Laravel kernel and produced risky
exception-handler warnings. It now checks the explicit testing environment,
database and absence of cached config without booting another kernel. Final
execution has zero failures/errors/skips. A browser interceptor initially
missed `?per_page=100`; correcting the URL pattern reproduced the balance gap.

## Preservation and evidence

All **109 table names** remain. Main counts are unchanged: 103 users, 39 loads,
53 applications, 59 offers, 26 bookings, 2 settlements, 27 token orders,
34 vehicles, 8 registered drivers and 7 disputes. All nine checked business
table full-row hashes match. Participant identities match. The full users hash
changed with allowed login bookkeeping; it is not claimed unchanged.
No schema change, reset, drop, import, restore, main booking mutation or password
change was performed. Test records stayed in the isolated test database.

Local Git-ignored evidence:

- `.local-runtime/booking-audit/before.json`, `after.json`, `analysis.json`.
- `lifecycle.json`, `unreleased-advance.json`, `lifecycle-junit.xml`,
  `regression-final-junit.xml` in the same directory.
- `test-results/booking-audit-verified-2026-11-20`: four final visible cases,
  participant screenshots, profile gate and known balance-gap evidence.
- `test-results/booking-audit-integrity-2026-11-20.json`.
- `test-results/booking-audit-records-2026-11-20.csv`.

From the API directory, run the new transactional cases with:

```powershell
php vendor/bin/phpunit --configuration phpunit.xml 'C:/laragon/www/ts/transportseva-docs/architecture/UI Design/angular-app/e2e/support/BookingLifecycleAuditTest.php'
```

From the Angular directory:

```powershell
npx.cmd playwright test e2e/booking-flow-audit.spec.ts --headed
```

Next corrective work: calculate final balance from **recorded released** amounts,
derive token labels from actual token disposition, then replace the defect
reproduction with passing correctness assertions.
