# Transporter Trips and Trip Details — 14/11/2026

## Implemented

Transporter `/trips` and `/trips/:id` now use the real operational trip pages
and a separate authenticated read API:

- `GET /api/account/transporter/trips`
- `GET /api/account/transporter/trips/{uuid}`

The server requires an actual Transporter account and scopes records to
bookings where that account is the canonical owner or provider. Creator,
application author, shared load and caller-supplied identity do not grant
access. A booking where both parties are the same account is counted once.
Existing Shipper and Truck Owner scopes remain separate.

The pages display actual vehicle/driver assignments, current booking stages,
stored workflow timestamps and original POD metadata/download availability.
Missing data is represented as missing. Damaged/deleted load links cannot
reveal unrelated load details. No separate copied trip records are created.

Lists support server pagination, stage/literal text search, global totals,
loading/error/retry and genuine zero states. Details refresh/poll, support
recorded timeline and POD tabs, and link to the exact
`/transporter/requests?booking=<uuid>` item. Counterparty labels and POD guidance
follow the server-reported owner/provider side. Back/load links stay within the
Transporter portal. The shared views retain English/Hindi copy and responsive
styles.

## Executed checks

| Check | Result |
| --- | --- |
| Transactional backend trip suites | 36 tests passed, 427 assertions: Transporter plus Shipper/Truck Owner regressions |
| Full Angular suite | 349 passed |
| Source inventory | 11 passed |
| Visible Chrome | 2 scenarios passed, 1.2 minutes |
| Production build | Passed; initial 985.95 kB below unchanged 1 MB error limit, existing 500 kB warning remains |
| PHP formatting/syntax and diff whitespace | Passed |

Backend tests cover both Transporter party roles, overlapping parties, denied
roles, authentication/onboarding, cross-account/deleted booking denial,
strict bounded filters, pagination/totals, literal search, damaged canonical
load relationships, actual assignments, recorded timeline, missing originals,
private original POD bytes and read-only behavior. They run in
`transportseva_employee_test` with transactions, fake mail/storage where
appropriate and stray HTTP blocked; no migration/reset was executed.

## Visible browser scope and limitation

The existing ready Transporter QA accounts have **zero bookings**. They were
not populated or reassigned merely to manufacture browser evidence.

The first Chrome scenario used real APIs to verify the zero list, reload,
filters, rejected forged scope, private 404 for an unrelated booking, denied
original POD and return navigation. The unrelated booking used for denial was
`5c18b398-8a75-4017-9ecf-e268282a4852`; no details or file were disclosed.

The second Chrome scenario used clearly labelled **controlled UI contract
responses**, not live Transporter bookings, to verify populated owner/provider
details, counterparty, exact booking links, stored timeline, missing-original
POD state, error/Retry and narrow viewport. The populated database behavior and
real original-byte downloads were verified separately by backend tests. This
is not a claim of a populated live Transporter booking lifecycle in Chrome.

Browser account:
`qa-onboarding-1793463324476-transporter@transportseva.test`
(`30180733-c0c8-4a18-b466-e337082948c0`). Browser network guards blocked business
mutations and external hosts; only authentication lifecycle POSTs and read
requests were allowed. No main users or booking records were created.

Artifacts: `test-results/transporter-trips-2026-11-14`, including the attached
controlled-contract scope note.

## Main database preservation

Before/after row counts and complete ordered-row SHA-256 hashes matched for:

| Table | Preserved rows |
| --- | ---: |
| loads | 39 |
| load_applications | 53 |
| marketplace_bookings | 26 |
| marketplace_settlements | 2 |
| booking_token_orders | 27 |
| marketplace_kyc_profiles | 4 |

Comparison artifact:
`test-results/transporter-trips-integrity-2026-11-14.json`.
This checks these six business tables; authentication bookkeeping is outside
that comparison. No main database import, restore, migration or reset was run.
