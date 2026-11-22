# Recipient bank and direct-payment execution — 22/11/2026

The implemented flow is **provider bank setup → documented admin review → payer
acknowledgement → external-transfer report → recipient confirmation/dispute**.
It is active locally with the approved **gross freight** policy. Each party owes
its own TransportSeva fee separately. No funds were moved in these QA executions.

## Visible browser execution

Chrome ran headed. The synthetic bank review/receipt journey was executed on
21/11 and repeated on 22/11 to exercise a new bank version and preserved history.
Five booking/access/display regressions and the updated bank journey passed in
one six-test run; an additional headed test passed for notification deep links.

| Step | Observed result | Evidence scope |
| --- | --- | --- |
| Provider saves bank details | New pending version, leading zeroes preserved, masked after save | Real local UI/API |
| Payer opens pending instructions | No reveal or transfer-report action; pending bank metadata withheld | Real local UI/API |
| Super Admin opens review | Explicit capability required; password-protected reveal; documented synthetic evidence/note | Real local UI/API |
| Admin approves | Status is manually reviewed, without an independent bank-verification claim | Real local UI/API |
| Payer acknowledges | Booking bound to current bank version; password cleared | Real local UI/API |
| Payer reveals account | Explicit reveal, mask restored after hide/refresh; automatic 60-second clear also unit-tested | Real local UI plus unit test |
| Payer reports ₹1,000 | Awaiting confirmation; confirmed unpaid unchanged | Real local UI/API, each execution |
| Recipient confirms ₹1,000 | Confirmed unpaid falls by ₹1,000 | Real local UI/API, each execution |
| Payer reports ₹500; recipient disputes | ₹500 remains reserved; confirmed unpaid does not fall | Real local UI/API, each execution |
| New bank version | Requires review and fresh acknowledgement; prior receipts retain old bank reference | Repeated UI journey and isolated API tests |
| Notification links | Receipt decision opens exact booking; review request opens bank-review queue | Additional headed UI test |
| Full ₹17,000 reconciliation | Confirmation reaches zero unpaid and further reports are rejected | Isolated API test |
| Other transporter combinations | Customer→Transporter, Transporter→Truck Owner, Transporter→Transporter use canonical recipient and reject unrelated same-role users | Isolated API tests |

The already-delivered QA booking supplied the approved-POD final-payment stage.
This execution did not repeat signup, operational delivery or POD approval.
Loading/mid-trip caps, prerequisites and authorization were checked separately
in the isolated backend tests.

## Reused users and booking

No new users were created in the main database.

| Purpose | Existing account | Local QA password |
| --- | --- | --- |
| Payer / Shipper | `qa-matrix-20261120-01-s@transportseva.test` | `MatrixQA@2026!20` |
| Recipient / Truck Owner | `qa-matrix-20261120-01-oa@transportseva.test` | `MatrixQA@2026!20` |
| Manual reviewer / Super Admin | `admin@test.local` | `password123` |

| Booking detail | Value |
| --- | --- |
| Booking reference | **TS-ZQXTRJ91OQ** |
| Booking UUID | `563a6729-7d04-4a41-9043-74f64af1ae4c` |
| Load | **LD-000040** |
| Gross freight due to recipient | ₹17,000 |
| Shipper fee separately due to TransportSeva | ₹1,003 |
| Provider fee separately due to TransportSeva | ₹1,003 |
| Total calculated platform fees | ₹2,006; not marked collected by freight confirmation |
| Synthetic bank | `QA Synthetic Bank`, masked account `****9012` |
| Retained reviewed bank versions | 1 and 2; latest booking acknowledgement uses version 2 |

Across both visible QA executions, four synthetic receipts remain: two confirmed
₹1,000 reports and two disputed ₹500 reports. The direct ledger therefore shows:

| Direct ledger balance | Amount |
| --- | --- |
| Confirmed received | ₹2,000 |
| Disputed / reserved | ₹1,000 |
| Unpaid by confirmed receipts | ₹15,000 |
| Available for another transfer report | ₹14,000 |

These are clearly labelled test attestations, not evidence of real bank transfers.
Historical recorded advances/settlement flags were not silently imported into
the new recipient-confirmed ledger or overwritten.

## Validation

| Check | Result |
| --- | --- |
| Full Angular suite | **490 passed** |
| Recipient-payment backend suite | **10 passed, 159 assertions** on `transportseva_employee_test` |
| Related backend regressions | **41 passed** in the expanded run: booking performance, staff policy/audit, admin reports, viewer ownership and fleet/booking module |
| Visible Chrome scenarios | **7 passed** across the combined six-case run and the additional bell-link case |
| Source/route audit | **18 passed** |
| Application build | Passed; 959.65 kB initial bundle, existing 500 kB warning remains below the 1 MB error limit |
| Database preservation | Passed: original tables and audited original rows preserved |

The extended backend run exposed outdated onboarding/token fixtures; those were
corrected and the affected scenarios rerun. The final payment suite above is a
clean ten-test run. The 41 related cases passed in the expanded run; they were
not needlessly repeated after the payment-only fixture correction.

Reproduce from the Angular directory:

```powershell
npm.cmd run test:ci
npx.cmd playwright test e2e/booking-flow-audit.spec.ts e2e/recipient-payments.spec.ts --headed
node audit/screen-source-audit.test.mjs
npx.cmd ng build
```

The full browser command adds a fresh labelled synthetic bank version and test
receipts to the same QA booking. To check only notification routing without
adding reports, use `--grep='bell links'` on `recipient-payments.spec.ts`.
From the API directory, run `php artisan test --filter=RecipientPaymentsTest`
with the existing isolated testing configuration; never point it at the main DB.

Backend coverage includes encryption, masking, reauthentication, fresh staff
authorization, review evidence, stale versions, strict input fields, duplicate
request/reference protection, partial/full gross receipts, reserved disputes,
milestone/POD/token prerequisites, canonical-party scope and paginated history
with totals independent of the page. Unpaid token fixtures use the application's
actual `awaiting_payment` state; onboarding fixtures satisfy the existing gate.
No production authorization rule was weakened to make a test pass.

## Preservation and activation

The pre-change backup is
`.local-backups/transportseva-before-recipient-payments-2026-11-21.sql`
(1,272,015 bytes), verified to contain the original 109 tables and a completed
dump footer. SHA-256:

```text
1d76d89da89bd9cc02d809a66e269f5fc24c64e9225a6aee654787c378e8fa33
```

All original 109 table names remain. Only four tables were added, producing 113.
Row hashes in 13 audited record sets preserved every original row: 108 users,
43 loads, 65 applications, 75 offers, 30 bookings, 6 settlements, 35 token orders,
38 marketplace vehicles, 12 marketplace drivers, 7 disputes, 11 staff memberships,
9 roles and the original 101 role-permission associations. Login timestamps are
excluded from user comparison. Only one new role-permission association was
added for the existing Super Admin's `recipient.bank.review` capability.

New feature records: two bank versions, one booking instruction, four receipts
and 18 private audit events. Stored bank numbers and transfer references were
checked against their encrypted database values without logging full numbers.

The exact additive migration was applied; no database reset, restore, import or
existing-table drop was used. Other deployment defaults remain unconfigured.
The migration, capability grant and gross-policy activation are local only.

## Remaining boundary

Disputed receipts stay reserved. An authorized admin workflow to adjudicate and
amend/release those reservations is still required; the existing bank-review
capability does not grant receipt-ledger administration. Freight confirmation
also does not collect platform fees or execute security-token refunds.

See [the implemented payment contract](../deployment/DIRECT_RECIPIENT_PAYMENT_CONTRACT.md).
The reproducible browser cases are in `recipient-payments.spec.ts`; raw masked
verification summaries and preservation hashes are under the ignored
`.local-runtime/recipient-payments/` folder. Traces/video/screenshots were disabled
for the bank-capture and reveal journey.
