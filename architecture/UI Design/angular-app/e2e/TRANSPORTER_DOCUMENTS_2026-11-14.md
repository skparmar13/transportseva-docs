# Transporter Documents — 14/11/2026

## Delivered

The Transporter Documents route now uses the real private document hub and
separate authenticated endpoints:

- `GET /api/account/transporter/documents`
- `GET /api/account/transporter/documents/pods/{uuid}/download`
- `GET /api/account/transporter/documents/kyc/{uuid}/download`

The server permits PODs only from canonical bookings where the actual
Transporter is owner or provider. A record involving that account on both sides
is counted once. KYC is always the signed-in account's own profile; a booking
relationship does not share the other party's KYC or fleet identity documents.

The shared page displays stored POD/KYC metadata, review states and original
file availability. It supports bounded server paging, review-status and literal
text filters, global POD totals, loading, duplicate-action prevention, retry,
English/Hindi and exact links to Transporter trips, Booking Requests and KYC.
Missing originals retain their recorded review status. Upload, correction and
review remain in their existing booking/KYC workflows.

Downloads authorize the requested record and restrict files to the expected
booking/account storage prefix. Unsafe, missing and unrelated paths cannot be
downloaded. The hub returns private/no-store responses and does not expose
storage paths, PAN/GSTIN values or reviewer identifiers.

## Verification

| Check | Result |
| --- | --- |
| Backend document suites | 36 passed, 494 assertions: Transporter plus Shipper/Truck Owner regressions |
| Full Angular suite | 356 passed |
| Source audit | 12 passed |
| Visible Chrome | 2 scenarios passed, 1.5 minutes |
| Production build | Passed, initial 986.23 kB under unchanged 1 MB error limit; existing 500 kB warning remains |
| PHP formatting/syntax and whitespace | Passed |

Backend tests use the guarded `transportseva_employee_test` database with
transactions, fake mail/storage where needed and stray HTTP blocked. They cover
both Transporter booking parties, overlapping parties, creator/applicant
non-authority, self-only KYC, global totals, paging/filter/search, canonical
load privacy, role/onboarding boundaries, original bytes and private headers,
cross-account denial, unsafe/missing paths and unchanged records on reads.

## Browser evidence and limits

Existing account:
`qa-onboarding-1793463324476-transporter@transportseva.test`.
Its real POD list is empty. No bookings/documents were created to manufacture
populated browser evidence.

1. The real account/API journey checked the empty hub, KYC state and link,
   reload, held-read loading and disabled Refresh, HTTP 503 then Retry recovery,
   rejected forged scope, unrelated POD denial and unrelated KYC denial.
2. A clearly labelled controlled-contract journey checked populated metadata,
   escaped review text, paging, exact Transporter trip/booking links, both typed
   downloads with exact byte hashes, preserved Approved states with missing
   originals, no-match with unchanged global totals and a narrow viewport.

The second journey's records and binary files are controlled UI responses,
not real documents belonging to that live account. Populated ownership and
actual storage-byte download behavior are verified separately in backend
tests. This is not a claim of a populated live Transporter document lifecycle.

Artifacts: `test-results/transporter-documents-2026-11-14`, including the attached
controlled-contract scope note. Browser guards blocked business writes and
external hosts while allowing authentication lifecycle POSTs and read requests.

## Main data preservation

Before/after ordered-row counts and SHA-256 hashes matched for all six checked
business tables: loads (39), applications (53), bookings (26), settlements (2),
token orders (27) and KYC profiles (4). Comparison artifact:
`test-results/transporter-documents-integrity-2026-11-14.json`.
Authentication bookkeeping is outside this comparison. No main users,
bookings or documents were created; no migration, reset, import or restore ran.
