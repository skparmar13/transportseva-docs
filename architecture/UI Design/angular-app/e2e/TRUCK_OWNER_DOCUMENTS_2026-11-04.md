# Real Truck Owner Documents — 04/11/2026

Truck Owner **Documents** now displays real booking POD records and the signed-in
user's own business KYC document. The sample compliance/document store is no
longer used by this route.

| Area | Verified behavior |
|---|---|
| POD records | Canonical provider-owned bookings, recorded review statuses and private metadata |
| KYC | Self-only legal business/document metadata and recorded verification status |
| Downloads | Actual original bytes, safe filenames, private cache headers and nosniff |
| Navigation | Exact Truck Owner booking/POD, real trip and KYC management links |
| Filters | Literal bounded search, status filtering, server pagination and totals independent of the current filter/page |
| Empty/missing files | Genuine empty states; missing originals do not change recorded review status |
| Feedback | Loading, failed-read Retry, failed-download feedback and duplicate-action guards |
| Language/layout | English, Hindi and narrow viewport checks |
| Privacy | Other providers and wrong-role users cannot claim the hub or its originals |

Uploads and review actions continue through the linked existing Bookings and
KYC workflows. This task creates no users, loads, bookings or document records.

## Implementation

The guarded Truck Owner Documents route uses the shared document view with a
route-level API provider, role-specific copy and correct portal navigation.
Shipper retains its separate endpoint and authorization.

Private Truck Owner endpoints:

    GET /api/account/truck-owner/documents
    GET /api/account/truck-owner/documents/pods/{booking_uuid}/download
    GET /api/account/truck-owner/documents/kyc/{profile_uuid}/download

A shared AccountDocumentController contains the existing validated metadata and
original-file handling. Separate Shipper/Truck Owner controllers bind their
strict canonical booking scope services. Creator/applicant identity and request
query parameters cannot choose another account's records.

A load is shown only when its poster matches the booking's canonical shipper,
including damaged references between two bookings belonging to the same provider.
KYC is always queried by the current user. PAN/GSTIN are neither selected nor
decrypted. File paths and reviewer/user identifiers are excluded from responses.

Download paths must stay within the exact booking/user storage prefix. Traversal,
foreign paths, missing originals and unowned record UUIDs cannot produce downloads.

## Verification

| Check | Result |
|---|---|
| Visible local Chrome | Six Truck Owner Documents cases and six Shipper Documents regression cases passed |
| Angular regression suite | 312/312 passed, including seven new provider API/UI cases |
| Backend regression suite | 48/48 passed; 590 assertions |
| Source inventory | 7/7 passed |
| Production build | Passed; initial bundle 982.95 kB, within the existing 1 MB hard limit |
| Changed PHP syntax and diff checks | Passed |

The existing 500 kB startup warning remains; no budget was increased.

Backend execution selected TruckOwnerDocumentsTest, ShipperDocumentsTest,
TruckOwnerTripHistoryTest and ShipperTripHistoryTest in the guarded transactional
transportseva_employee_test database. Storage originals were faked only inside
those isolated tests. Main-database browser tests used existing real files.

The first browser run passed 11/12 cases. One reused test still searched for the
Shipper label "Open booking / POD review" instead of the intended provider label
"Open booking / POD actions". Correcting that test selector and explicitly
rerunning its full download/trip/booking/reload case passed. The initial failure
remains in its original artifact.

Local evidence, excluded from Git:

- [Latest browser results and original-file metadata](../test-results/truck-owner-documents-summary-2026-11-04.json)
- [Main database preservation comparison](../test-results/truck-owner-documents-integrity-2026-11-04.json)
- Initial run: test-results/truck-owner-documents-2026-11-04.json
- Explicit recheck: test-results/truck-owner-documents-recheck-2026-11-04.json

Missing-original UI tests modify only the browser response; real stored files and
review decisions remain untouched. Browser business writes and non-local hosts
were blocked before navigating.

## Existing QA accounts and records

| Purpose | Existing login | Password |
|---|---|---|
| Truck Owner with real KYC/POD | verify-truck-owner-1793028294862-62@transportseva.test | TransportSevaE2E@2026 |
| Different Truck Owner / zero POD records | verify-truck-owner-1793028294862-63@transportseva.test | TransportSevaE2E@2026 |
| Shipper regression and wrong-portal checks | verify-shipper-1793028294862-61@transportseva.test | TransportSevaE2E@2026 |

| Original tested | Record | Filename | Bytes |
|---|---|---|---|
| Booking POD | TS-KOQKWAZAA8 / 5c18b398-8a75-4017-9ecf-e268282a4852 | corrected-pod.png | 68 |
| Truck Owner KYC | 64085729-c4cf-4627-81ed-8477a656303d | test-business-document.png | 68 |

Both existing QA originals have SHA-256:

    431ced6916a2a21a156e38701afe55bbd7f88969fbbfc56d7fe099d47f265460

Each UI download was compared byte-for-byte with the authenticated original
response for its own typed record.

## Data preservation

The final read-only comparison found no added, removed or changed records in the
ten tracked marketplace/account tables: loads, applications, bookings, token
orders, settlements, KYC, reviews, support tickets/history and business profiles.
Counts remain 107 base tables, 103 users and 11 role memberships. Identity,
credential and access-table hashes match the preceding baseline.

No schema, role, password, review decision or main-database test-data changes
were made. Normal QA authentication bookkeeping may change during login.

Source inventory now classifies Truck Owner Documents as API-connected.
Truck Owner has 16 API-connected routes and two remaining prototype routes.
