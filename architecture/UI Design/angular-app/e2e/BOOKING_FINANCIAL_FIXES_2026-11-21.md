# Booking financial display fixes - 21/11/2026

**22/11 follow-up:** Bank capture, documented manual review and recipient-confirmed
receipts are now implemented. The approved gross-freight policy keeps both fees
separate; the earlier modal calculations below describe the historical display
patch, not the current direct-receipt screen. See
[the recipient-payment execution report](RECIPIENT_PAYMENTS_2026-11-22.md).

**Resolved the unpaid-advance final-amount defect and the completion-based
token-release display defect.** The owner selected direct shipper-to-recipient
payments. Bank-details capture and independent receipt confirmation are not
implemented by this display patch; their concrete contract is linked below.

## Corrected final balance

Final payment and the payment-modal default now use freight less **recorded
released** milestones. Planned advance and pending mid-trip allocations are
not treated as paid. The planned settlement preview remains explicitly labelled
"after planned milestones" and is distinct from outstanding freight.

| Case | Freight | Advance recorded released | Mid-trip recorded released | Owner fee | Correct final amount |
| --- | ---: | ---: | ---: | ---: | ---: |
| Neither payment recorded | 17,000 | 0 | 0 | 1,003 | 18,003 |
| Advance only | 17,000 | 6,800 | 0 | 1,003 | 11,203 |
| Mid-trip only | 17,000 | 0 | 2,000 | 1,003 | 16,003 |
| Both | 17,000 | 6,800 | 2,000 | 1,003 | 9,203 |
| Existing no-advance example | 18,000 | 0 | 0 | 1,062 | **19,062** |

The last case previously displayed 10,800 freight and 11,862 payable. It now
displays 18,000 freight and 19,062 payable, with **19,062** prefilled in the modal.
This matches the backend rule; it does not record a new payment.

Settlement fee snapshots can contain decimal strings. Their commission total
is now added numerically instead of concatenated into an invalid number. When
the booking fee is absent, its persisted settlement snapshot supplies the fee.
Currency-cent and modal-default regressions cover the calculation.

## Corrected token presentation

The backend screen no longer displays a "Provider Status Released" heading
derived from booking completion. Each party displays the token order's actual
recorded state:

| Provider state | UI label |
| --- | --- |
| No order / awaiting_payment | Awaiting payment |
| paid | Paid |
| refund_pending | Refund pending |
| refunded | Refunded |
| forfeiture_pending | Forfeiture pending |
| forfeited | Forfeited |
| Unknown future value | Status unavailable |

Delivered or settled bookings keep Paid tokens as Paid. An admin refund
decision is not interpreted as a completed refund. Legacy return/disposition
flags are true only when both saved token states are `refunded`, independently
of trip stage. The backend template displays the individual recorded states.

The booking API now includes `owner_token_amount` and `provider_token_amount`
from the already-loaded orders, or the server-controlled amount when an order
has not been created. The UI no longer hardcodes 1,000. The regression checks
different side amounts and a changed server default without additional queries.
Missing/invalid amounts do not become invented successful payments.

English/Hindi labels explain that trip completion and manual settlement do not
refund a token. The unconditional "Booking token accounted for" and future
automatic payout wording were removed from this backend view. Provider fees
are labelled calculated deductions, not proof of actual withholding.

## Direct payment choice and bank setup

Selected approach: **shipper pays the recipient directly**. The recipient is
the canonical booked Truck Owner/Transporter, not automatically the assigned
driver. The application should capture the recipient's account-holder name,
account number, IFSC and bank details securely, verify them separately, and
disclose instructions only within an eligible confirmed booking.

The current application has no provider bank-details capture/reveal or
recipient-confirmed receipt workflow. Existing driver bank fields are not that
feature. This patch adds neither an automatic payout API nor a bank-verification
claim. The UI explicitly states that a settlement record does not transfer money
or confirm recipient/platform receipt.

The [direct-recipient implementation contract](../deployment/DIRECT_RECIPIENT_PAYMENT_CONTRACT.md)
specifies fields, encrypted/masked handling, account-specific access, verification,
versioned changes, payer UTR claims, separate recipient confirmation and separate
platform-fee receipts. It also records the unresolved net-split versus gross-fee
remittance choice. The existing combined final total must not be presented as
one bank-transfer instruction to the recipient.

Bank verification is a separate check of account existence/activity and name,
not a consequence of saving fields; see the official
[Cashfree account-verification description](https://www.cashfree.com/penny-drop-verification/).
Token refunds remain tied to their own payment-provider flow, not the freight
recipient bank-account setup.

## Checks executed

| Check | Result |
| --- | --- |
| Full Angular regression | **480 passed** |
| Backend MarketplaceWorkflow and MarketplaceBookingPerformance | **15 passed, 261 assertions** |
| Visible Chrome acceptance | **5 passed** |
| Source wiring audit | **18 passed** |
| Production browser/SSR build | Passed; 11 prerendered routes |
| PHP syntax and whitespace checks | Passed |
| Main-database preservation | 109 table names and all rows in 13 checked sets preserved |

The build retains the existing 500 kB initial-bundle warning. The final initial
bundle is 958.04 kB, below the unchanged 1 MB error limit. Angular completed all
tests successfully; its launcher needed its normal forced Chrome shutdown after
the test results. No budget was raised.

The initial focused tests correctly exposed missing fee values in the narrow
booking fixtures. The mapper now uses the persisted settlement fee fallback.
The first headed run missed its first login response during cold/concurrent
startup. The existing response wait was made explicit at 60 seconds; the final
five-case run passed with real authentication and no middleware bypass.

## Browser evidence and record scope

| Case | Actual or controlled data | Result |
| --- | --- | --- |
| Existing shipper booking read/reload | Real QA login, API and saved TS-KOQKWAZAA8 | Passed |
| Existing provider booking read/reload | Real QA login and same booking | Passed |
| Older account's profile gate | Real TS-SXIFZM3X1R owner; profile redirect and onboarding 403 | Passed |
| No advance, pending settlement, final modal | Real TS-KOQKWAZAA8 plus a browser-only pending-settlement response | Passed at 18,000 / 19,062; no submission |
| Completed paid tokens, then mixed refund/forfeiture states | Real TS-ZQXTRJ91OQ first; explicit browser-only state/amount fixtures afterward | Passed, including Hindi |

No real refund or forfeiture was performed. The controlled responses were GET
overrides only. All business writes were blocked; unexpected-write arrays were
empty. Existing credentials were reused; no users, bookings, settlements, bank
records or payment references were created or edited in `transportseva`.

Backend regressions run in guarded `transportseva_employee_test`. They exercise
recorded token states, amounts, query count, ownership and the existing lifecycle
without running the main-database workflow. Real payment delivery and bank
verification are not claimed.

## Main data preservation

The following counts and existing-row hashes match before/after:

| Table | Rows |
| --- | ---: |
| users | 108 |
| loads / load_applications / negotiation_offers | 43 / 65 / 75 |
| marketplace_bookings / marketplace_settlements / booking_token_orders | 30 / 6 / 35 |
| marketplace_vehicles / marketplace_drivers | 38 / 12 |
| marketplace_disputes | 7 |
| role_user / roles / role_permission | 11 / 9 / 101 |

User hashes exclude allowed login timestamps (`last_login_at`, `updated_at`).
All other checked row values are included. This is not a full-database row audit.
No migration, reset, drop, import, restore, seeding or business-data repair ran.
No deployment flags, real credentials or staff grants changed.

## Artifacts and reproduction

- `test-results/booking-financial-fixes-verified-2026-11-21`: final five-case run,
  corrected-balance JSON and token-state screenshots.
- `test-results/booking-financial-fixes-integrity-2026-11-21.json`: preservation.
- `.local-runtime/booking-fixes`: before/after hashes, Angular/backend/source/build
  logs and JUnit results. These generated artifacts are private and Git-ignored.

```powershell
npm.cmd run test:ci -- --reporters=dots
npx.cmd playwright test e2e/booking-flow-audit.spec.ts --headed
node --test audit/screen-source-audit.test.mjs
npm.cmd run build
```

From the API directory:

```powershell
php vendor/bin/phpunit --configuration phpunit.xml --filter 'MarketplaceBookingPerformanceTest|MarketplaceWorkflowTest' tests/Feature
```

Deploy the frontend and the additive API amount fields together. Earlier audit
documents describe their historical findings; this report supersedes the two
display defects, not their separate bank/receipt implementation gaps.
