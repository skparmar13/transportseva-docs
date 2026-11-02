# Shipper Documents — 01/11/2026

## Delivered scope

The Shipper Documents route now uses a dedicated, private API-backed hub instead
of sample fleet/driver/trip stores. It displays:

- Actual submitted POD records belonging to the authenticated shipper's bookings.
- The shipper's own existing business KYC document and its recorded review state.
- Original authenticated binary downloads, not generated text placeholders.
- Server-side review filters, literal search and pagination; global POD totals
  are distinct from filtered/page counts and from the separate KYC record.
- Recorded upload/review dates in DD/MM/YYYY hh:mm AM/PM, explicit missing dates
  and unavailable files, loading animations, duplicate-action guards, retry,
  empty/error states and English/Hindi copy.
- Exact links to booking/POD review, Trip Details and KYC Verification.

Vehicle and driver identity files are not the shipper's documents and are not
disclosed through this screen. Their owners' compliance workflows and the legacy
other-role Documents screens remain separate. Company-tenanted DocumentManagement
endpoints were not enabled or repurposed as account-owned storage.

This is a read/download hub over existing records. Uploads, resubmissions and
reviews remain in the existing KYC and Bookings workflows. It does not add an
invoice/e-waybill generator, arbitrary upload vault, new approval process, payment
or GPS integration. Merely reading/downloading creates no new business event
notification; existing KYC/POD mutation notifications are unchanged.

## Authorization and implementation

Read-only routes:

    GET /api/account/documents
    GET /api/account/documents/pods/{bookingUuid}/download
    GET /api/account/documents/kyc/{profileUuid}/download

The server requires the actual customer/shipper user type and scopes bookings to
the canonical owner UUID, not creator, provider, browser role or a query argument.
KYC is scoped to the authenticated user UUID. Cross-account downloads return 404;
other roles receive 403 even with local staff enforcement disabled. Existing
authentication and mandatory onboarding middleware remain enforced.

Only known query fields are accepted. Search is bounded to 100 characters and
treats SQL wildcard characters literally; per-page is bounded to 50. Deleted
bookings and unrelated/deleted load metadata are excluded. Unsubmitted bookings,
null PODs and not-submitted placeholder statuses are not document records.

Responses expose allowlisted metadata only. They do not load/decrypt PAN/GSTIN,
return file paths, reviewer/user identifiers, raw workflow or financial fields.
Original files must exist beneath their own booking/user storage prefix.
Traversal, control characters and cross-record storage paths are rejected.
Download names are sanitized, responses are private/no-store and use nosniff.

Frontend:

    src/app/core/api/api-shipper-document.service.ts
    src/app/features/shipper/documents/
    e2e/shipper-documents.spec.ts

Backend, in the sibling transportseva-api project:

    app/Http/Controllers/ShipperDocumentController.php
    tests/Feature/ShipperDocumentsTest.php
    routes/api.php

The existing ShipperTripReadService supplies owner scoping and safe load
projection. No new table, migration, grant, account or duplicate document entity
was introduced. Other dirty worktree changes were preserved.

## Verification

| Check | Result | Scope |
|---|---|---|
| New backend Documents tests | 13 passed, 148 assertions | Canonical owner, role/foreign access, pagination, global counts, wildcard search, actual downloads, missing/unsafe files, encrypted-ID exclusion, refresh and onboarding |
| Expanded backend regression | 118 passed, 1,298 assertions | Documents, Trips, Support, Contact enquiries, staff policy, onboarding, business profiles, dashboards and vehicle details |
| Angular suite | 258/258 passed | Includes 13 new Documents UI tests and 3 new HTTP contract tests |
| Production build | Passed, exit 0 | Initial 996.56 kB, existing 1 MB error limit unchanged; existing 500 kB warning remains |
| Source audit | 4/4 passed | Route assessments/anchors valid; inventory regenerated |
| TypeScript application check | Passed | No-emit compilation |
| PHP syntax / whitespace checks | Passed | New controller/test and route changes |
| Final visible Chrome regression | 12 passed, 0 failed/skipped/flaky | Six Documents checks plus six existing Trip checks |

Backend tests run transactionally in transportseva_employee_test with a guard
requiring testing environment and an actual *_test database. File storage is
faked within those isolated tests. External HTTP/mail is disabled. No migrations,
database reset, import, seeding, main-database upload or payment was executed.

### Browser scenarios

Browser contexts permit only local read requests and normal authentication
login/refresh/logout POSTs. Business writes and external destinations are blocked.
Existing accounts are reused; trace/video recording is disabled for auth secrets.

| Scenario | Expected/verified behavior |
|---|---|
| Owned POD list and filters | Real server totals and saved metadata; exact reference filter; original byte comparison; exact Trip/Booking links; reload |
| Own KYC | Actual private record; original byte comparison; reload; real KYC management destination |
| Empty and cross-account | Genuine zero POD/KYC; foreign original downloads 404; forged ownership filter 422; provider hub/downloads 403 and portal redirect |
| Slow/failing reads | Visible spinner, disabled duplicate read, honest 503 state, old private content cleared, successful real retry |
| Interrupted download | Same disabled button cannot send a duplicate; error is shown without fake file/success; refresh disabled while pending |
| Missing original / no match | Browser-only missing-file response fixture retains actual review states, hides download; real no-match preserves global totals; Hindi/narrow view |
| Existing Trip regression | Six prior private history/detail/original-POD/deep-link/failure checks remain valid |

The initial combined run completed with 11 passes and one browser-test failure.
That test selected “Download original” again after its label changed to
“Downloading…”. The locator waited for the completed request's enabled retry and
therefore issued a legitimate second request. The corrected test targets the
same stable button and holds the failure response until disabled/duplicate
assertions finish. No product-code workaround or forced click was added.
The initial JSON/failure artifacts are retained separately.

Final evidence:

- [Final browser report](../test-results/shipper-documents-final-2026-11-01.json)
- [Documents screenshot](../test-results/shipper-documents.png)
- [Hindi/narrow screenshot](../test-results/shipper-documents-narrow-hindi.png)
- [Final browser artifact directory](../test-results/shipper-documents-final-run/)

The full corrected collection passed on its first rerun (about 3.1 minutes).
Both visible preflight navigations were free of dev-server overlays. No overlay
was suppressed and no user-owned server was restarted.

### Existing records/accounts used

| Item | Value |
|---|---|
| Main database | transportseva |
| Owner login | verify-shipper-1793028294862-61@transportseva.test |
| Owner password (local QA only) | TransportSevaE2E@2026 |
| Booking | TS-KOQKWAZAA8 |
| Booking UUID | 5c18b398-8a75-4017-9ecf-e268282a4852 |
| POD original | corrected-pod.png, existing 68-byte QA image |
| Own KYC profile UUID | 9108a5e3-9c6f-45be-9ac0-c94ea0fb79f7 |
| KYC original | test-business-document.png, existing 68-byte QA image |
| Original-file SHA256 (both existing QA images) | 431ced6916a2a21a156e38701afe55bbd7f88969fbbfc56d7fe099d47f265460 |
| Empty shipper login | qa-recovery-1793377725393@transportseva.test |
| Empty shipper password (local QA only) | RecoveryFinal@2026! |
| Provider boundary login | verify-truck-owner-1793028294862-62@transportseva.test |
| Provider password (local QA only) | TransportSevaE2E@2026 |

These are existing development accounts, not production credentials. No password
or membership was changed. The real images prove byte-preserving retrieval of
stored QA files, not production compliance approval or new uploads.

## Data preservation and remaining work

Before tests, read-only per-record SHA256 baselines were captured for loads,
applications, bookings, settlements, token orders and KYC profiles. Baseline:
107 base tables, 103 users, 11 memberships, local staff enforcement true,
37 loads, 51 applications, 24 bookings, 2 settlements, 27 token orders, 3 KYC
profiles.

After all visible checks finished, the 01/11/2026 06:00:52 PM UTC read-only
comparison matched every saved original row hash and all counts in all six
tables. Tables/users/memberships remain 107/103/11; local staff enforcement is
unchanged. No added, deleted or modified domain/KYC rows were detected.
Normal authentication session/last-login bookkeeping is not represented as an
unchanged whole-users-table hash.

The hub shows the current stored POD revision per booking. It does not recreate
or claim an immutable archive of earlier replaced file revisions.

The source inventory now classifies Shipper's 19 routes as 14 API-connected,
1 prototype (Reports), and 4 deferred payment/GPS routes. API-connected is not a
certification of every production action or external provider.

Next scoped repair: real, owner-scoped Shipper Reports. Other-role legacy
Documents and Company tenancy remain separate. Real payments, GPS, provider
delivery and staging are still deferred.
