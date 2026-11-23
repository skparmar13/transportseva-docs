# Booking matrix execution — 22–23/11/2026

The four supported role pairings and an additional no-advance journey completed
from real signup through delivery, approved POD and recipient-confirmed gross
freight receipts. Tests used visible Chrome and retained records in the existing
`transportseva` database. This is bounded scenario coverage, not a claim that
every possible business condition or real money movement has been tested.

Truck Owners provide vehicles only. Shippers and Transporters can post loads;
Transporters and Truck Owners can apply. A Transporter cannot apply to its own load.

## Users and access

All five accounts were created through signup, verified using local sandbox OTPs,
completed their dashboard profiles and email verification, and logged out/in.
Their stored password hashes were checked independently after the journeys.

**Password for all five QA users: `FullBookingQA@2026!22`**

| Code | Role | Login email | Mobile |
| --- | --- | --- | --- |
| S | Shipper | qa-full-20261122-01-s@transportseva.test | +917911220101 |
| TA | Transporter | qa-full-20261122-01-ta@transportseva.test | +917911220102 |
| TB | Transporter | qa-full-20261122-01-tb@transportseva.test | +917911220103 |
| OA | Truck Owner | qa-full-20261122-01-oa@transportseva.test | +917911220104 |
| OB | Truck Owner | qa-full-20261122-01-ob@transportseva.test | +917911220105 |

Each provider registered one vehicle and driver. Bank submissions used synthetic
account details. An existing authorized Super Admin performed documented manual
reviews; no staff memberships or grants were changed. OB's first bank version
was rejected, then a corrected second version was approved. Manual review does
not establish independent bank verification.

The local UI run used sandbox OTP delivery and the existing configuration with
mandatory marketplace KYC disabled. It does not establish production delivery
or mandatory-KYC readiness.

## Main journeys and payment breakdown

Amounts are INR. Each row had three competing applications, one winner and two
declines. Negotiation was exercised from both sides across the matrix.

| Flow | Load | Booking reference | Freight | Loading advance confirmed | Mid-trip confirmed | Final confirmed | Fee owed by each party |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| S → OA | LD-000044 | TS-IGH6IWP5H6 | 17,000 | 6,800 | 2,000 | 8,200 | 1,003 |
| S → TA | LD-000045 | TS-DMUIIN8DKU | 18,500 | 7,400 | 2,000 | 9,100 | 1,091.50 |
| TA → OA | LD-000046 | TS-4QYSVJDRUQ | 18,000 | 7,200 | 2,000 | 8,800 | 1,062 |
| TA → TB | LD-000047 | TS-L0Y9JO1EHS | 20,000 | 8,000 | 2 × 1,000 | 10,000 | 1,180 |
| S → OB; no advance | LD-000048 | TS-XKVZFOSMUF | 19,000 | 0 | 0 | 19,000 | 1,121 |
| **Main matrix total** | | | **92,500** | **29,400** | **8,000** | **55,100** | **5,457.50 per side** |

All five are operationally completed with approved private POD files and zero
confirmed unpaid freight. Fourteen confirmed direct receipts account for the
₹92,500 gross freight. Combined platform fees are ₹10,915 and remain separately
due; confirming freight does not collect those fees.

Each main booking has two ₹1,000 security token orders marked paid by the local
mock provider: ₹10,000 across these five bookings. Tokens are separate from
freight, fees and refunds. Completion does not imply token refund or release.
The legacy marketplace settlement rows remain pending; they are not falsely
marked settled by direct-payment confirmation.

| Booking reference | Canonical booking UUID |
| --- | --- |
| TS-IGH6IWP5H6 | 25664367-b254-429b-b4bc-14100ac9f110 |
| TS-DMUIIN8DKU | 9b99d118-93f8-4f1d-8796-6723579a4675 |
| TS-4QYSVJDRUQ | 355b39d8-e4a7-4a68-b8ad-780b5ce4c83d |
| TS-L0Y9JO1EHS | 6121d32e-2bcc-459e-9a1a-1541e2de5eb8 |
| TS-XKVZFOSMUF | 14f3b2a0-500d-42ad-974c-3ba1705a264c |

Open a booking as a participating Shipper using
`/shipper/bookings?booking=<UUID>`, a Truck Owner using
`/truck-owner/bookings?booking=<UUID>`, or a Transporter using
`/transporter/requests?booking=<UUID>` at `http://localhost:4300`.

## Flow and safeguards exercised

| Step or condition | Result |
| --- | --- |
| Signup → phone OTP → dashboard profile → email verification → relogin | Passed for all five QA users; onboarding gate enforced |
| Post → three applications → counter-offer → acceptance | Passed for all four role pairings; competitors declined |
| Canonical booking and role identity | One booking per accepted application/load; caller role spoofing rejected/normalized |
| Registered vehicle/driver selection and assignments | Passed using owned fleet dropdowns; isolated tests cover foreign/unavailable resources |
| Both token orders → loading report → owner confirmation → trip start | Passed; unpaid advance does not reduce actual outstanding freight |
| Bank capture, documented review, acknowledgement, private reveal/hide | Passed; sensitive values excluded from notices and browser recordings |
| Advance, mid-trip, split mid-trip and final direct receipts | Passed; payer report stays pending until recipient confirms |
| Exact booking/vehicle tracking handoff | Correct route and assigned registration retained; location signals not fabricated |
| Delivery → private POD upload → approval → final reporting | Passed, including live same-page final-stage enablement |
| Event notifications and bell navigation | Correct parties and declined applicants notified; bell opens relevant booking UUID |
| Concurrency | Seven separate-process regressions passed in the isolated test database |
| Invalid/repeated OTP, identity conflicts, ownership, amounts, dates, bank versions, replayed receipts and out-of-order actions | Covered by the backend regression selection; see execution logs |

## Focused retained bookings

| Load / booking | Scenario and observed result |
| --- | --- |
| LD-000049 / TS-VQLKBQVPOE | Cancel requested before tokens; only admin could decide; cancelled without invented token/refund orders |
| LD-000050 / TS-DCCNYIA2A8 | Assigned booking paused for dispute, continued after documented admin call, then cancelled; resources released. Refund/retention/fee-waiver decisions recorded. Existing paid token statuses were not misrepresented as refunded |
| LD-000051 / TS-WIBYOKKON3 | ₹500 transfer disputed, ₹16,500 final confirmed; ₹500 remains unpaid and reserved. POD rejection/correction/approval exercised; no further funds can be reserved against that disputed balance |
| LD-000053 / TS-BOPYWPOJ3E | Interrupted POD-refresh reproduction retained and resumed; final ₹17,000 reported/confirmed without duplicate receipt |
| LD-000054 / TS-SHWF8J9TOF | Fresh same-page POD approval regression passed; final ₹17,000 confirmed and unpaid balance zero |

LD-000052 is the retained open-load self-application guard case. The run added
11 loads, 10 bookings and 5 users; it did not replace earlier marketplace records.

## Defects corrected and validation

Two actual contention defects allowed delayed offer/rejection requests to undo
an accepted application. Consistent parent-load and fresh-application locks now
prevent both transitions. New real-process tests failed before these fixes and
passed afterwards. Duplicate application, competing acceptance, canonical booking
retry, excess receipt reservation and receipt idempotency are also covered.

Backend role validation now enforces the confirmed policy and derives stored
poster/applicant roles from the authenticated user. Truck Owner posting and
Shipper applications are rejected. Price and booking links were independently
checked against saved negotiation/application records.

The direct-payment component now refreshes when booking stage, loading
confirmation, POD status or milestone count changes, including when an earlier
read is still finishing. The same-page POD transition was verified in visible
Chrome. A stale local Angular process initially served an old parent template;
its workspace was verified before restarting it. Current source now runs at the
normal `http://localhost:4300` address.

| Validation | Result |
| --- | --- |
| Selected backend regressions | 128 passed, 1,601 assertions |
| Formatted concurrency/role tests rerun | 11 passed, 82 assertions, including seven real-process cases |
| Angular suite | 492 passed |
| Source/route audit | 18 passed |
| Production build | Passed; initial bundle 959.65 kB, above the 500 kB warning and below the 1 MB error limit |
| Final browser suite | 23 passed in 2.3 minutes on the saved run; first executions created records, resumed executions verified retained state |
| Independent database readback | Main five freight totals, fees, password hashes, canonical links, competing applications, reviewed banks and private POD files verified |
| Data preservation | All 113 table names unchanged; every pre-existing record in 17 critical table sets preserved, excluding user login/update timestamps |

The browser suite contains 23 functional cases. Earlier failing runs are retained
as diagnostic evidence; they are not counted as additional successful coverage.
The fresh POD approval test also passed its actual live transition in
`pod-current-ui.log` before the final saved-state run. It was not inferred from
reloading an already approved POD.

## Remaining implementation gaps

Disputed direct-receipt reservations still need an authorized administrative
adjudication workflow. The ₹500 disputed case deliberately remains unresolved.
Platform-fee collection and execution of token refund/retention decisions also
remain separate work. Documenting an admin decision does not execute a refund.
Freight receipts here are synthetic payer/recipient attestations, not evidence
that a bank transfer occurred.

## Evidence and preservation

- Test definition: `e2e/booking-full-matrix.spec.ts`; scenario plan: `e2e/BOOKING_FULL_MATRIX_PLAN_2026-11-22.md`.
- Local run manifest: `.local-runtime/booking-full-20261122/20261122-01.json`.
- Independent records: `verified.json`; preservation hashes/results: `before.json`, `after.json`, `integrity.json` in that runtime directory.
- Execution logs: `signup-ui.log`, `booking-ui.log`, `focused-rerun.log`, `pod-current-ui.log`, `final-resume-ui.log`, `backend-final.log`, `backend-formatted.log`, `angular-final.log`, `source-audit.log`, `build-final.log`.
- Pre-run backup: `.local-backups/transportseva-before-full-booking-2026-11-22.sql`, 1,303,761 bytes, 113 tables.
- Backup SHA-256: `0A1A418FBFB41EB9691922DDA5BA582F0DAAB6E73BB8E95ADEE9DB01B4677F7E`.

No database drop, reset, restore or import was performed. All QA additions remain
available for review. Concurrency/fault regressions use
`transportseva_employee_test`; the visible journeys use `transportseva`.
