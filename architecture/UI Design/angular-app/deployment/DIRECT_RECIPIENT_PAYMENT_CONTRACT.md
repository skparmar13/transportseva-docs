# Direct recipient payments — 22/11/2026

Implemented locally: versioned recipient bank capture, documented manual admin
review, private booking instructions, external-transfer reporting and recipient
confirmation/dispute. This records evidence supplied by the booking parties;
it does not move money or independently verify a bank account.

The owner approved these rules:

| Obligation | Payee / treatment |
| --- | --- |
| Full agreed freight | Shipper pays the canonical booking provider directly |
| Shipper platform fee | Shipper separately owes TransportSeva |
| Provider platform fee | Provider separately owes TransportSeva |
| Booking security tokens | Separate obligations; completion does not imply refund |

For ₹17,000 freight and ₹1,003 fee on each side, the recipient receives ₹17,000
in freight. The shipper separately owes ₹1,003 and the provider separately owes
₹1,003. The old calculated ₹15,997 provider net is not the direct-transfer target.
A freight receipt does not mark TransportSeva's ₹2,006 fees collected.

## Screens and authorization

1. An onboarded Truck Owner or Transporter opens their dashboard **Profile /
   Business Settings → Recipient bank account**. Enter holder, account twice,
   IFSC, bank name, consent and current login password. Account numbers remain
   strings, including leading zeroes. Saving creates a new `pending` version.
2. An explicitly authorized Super Admin opens **Recipient Bank Reviews**.
   A manual approval/rejection requires current password, review method,
   documented evidence/case reference and note. The result is
   `manually_reviewed`, never independently bank-verified. Evidence references
   are retained encrypted and available to authorized reviewers.
3. Only actual booking parties can use **Bookings → Direct freight payments**.
   Pending/rejected details are not shared as payment instructions. Following
   manual review, the payer acknowledges the current bank version with their
   password. A separate password-protected reveal shows the full account for
   60 seconds. Reveals are audited; admin reveal reasons are encrypted.
4. The shipper transfers through their own bank service, then reports amount,
   date, reference/UTR and loading/mid-trip/final stage. The recipient confirms
   actual receipt or disputes it with a reason.

The provider is `provider_uuid`, including Transporter-to-Transporter bookings.
An assigned driver's personal bank fields never become freight instructions.
Unrelated applicants, staff and public/generic booking APIs cannot read bank
instructions or the direct-payment ledger. The dedicated bank-review capability
does not grant access to the parties' receipt ledger.

## Balance and workflow rules

```text
Confirmed unpaid = gross freight − recipient-confirmed receipts
Available for another report = gross freight − confirmed − pending/disputed
```

Amounts awaiting confirmation or disputed remain reserved. Only recipient
confirmation reduces confirmed unpaid. Partial reports are allowed; duplicate
references/request keys, conflicting retries and excess amounts are rejected.
Booking row locks serialize report decisions; database unique constraints
protect reference/request identities. This is not proof of bank settlement.

Loading advance requires shipper-confirmed loading, capped at 40% of freight.
Mid-trip receipts require an in-progress trip and saved milestone, with that
milestone's cap. Final receipts require delivery and approved POD. Both security
tokens must be paid; after delivery, recorded refunds do not invalidate receipt
history. Cancelled/disputed bookings lock receipt actions.

Bank changes create a new pending version and invalidate use of old instructions
for new reports/reveals. Following review, the payer must acknowledge the new
version. Prior receipts retain the original bank-version reference. Ledger totals
cover all records; the receipt list is paginated at 20 per page.

Legacy `released_milestones`, `final_payment` and settlement flags are not imported
as recipient-confirmed receipts. Historical flags remain in storage and are
labelled separately. Under the gross policy, legacy release/final-payment writes
are rejected so they cannot bypass the new review/receipt checks. Operational
booking status, allocation release, POD, commission and token records are not
silently rewritten by receipt confirmation.

Submission, review, acknowledgement, report and receipt decision generate private
bell notifications with relevant routes, without bank numbers or UTRs.

## Storage and activation

Four additive tables: `recipient_bank_accounts`, `booking_bank_instructions`,
`direct_payment_receipts`, `recipient_payment_events`. Sensitive bank attributes,
review evidence/notes, transfer references, decision notes and admin reveal
reasons are encrypted using the application's encryption key. Keep that key in
the deployment's protected recovery material. Default responses are masked and
private/no-store; full details are never put in localStorage or notification data.

Only local `.env` is set to `TS_DIRECT_FREIGHT_ALLOCATION=gross`. Other deployments
default to `unconfigured`, requiring explicit activation. The local-only
`recipient-bank:prepare-access` command requires an existing mapped Super Admin
and verified database backup. It adds only `recipient.bank.review`; existing staff
memberships and other grants remain unchanged. Production deployment requires
reviewed migration/configuration and explicit grants; do not copy QA bank records.

## Remaining boundaries

- Manual review needs genuine supporting evidence for genuine accounts. The
  retained QA account and review evidence are explicitly synthetic.
- Freight reports are party attestations; they do not establish receipt of
  platform fees or execution of token refunds.
- A disputed receipt remains reserved. Admin adjudication that amends/releases
  a disputed receipt reservation is not implemented in this patch. Do not work
  around it by changing references or editing database statuses; a separately
  authorized resolution workflow is required.
- There is no automatic payout, bank-verification integration or platform-fee
  collection implementation in this feature.
