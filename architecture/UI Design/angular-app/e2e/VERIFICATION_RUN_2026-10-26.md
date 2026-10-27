# Marketplace verification — 26/10/2026

Completed against the existing `transportseva` database, Angular at
`http://localhost:4300`, and Laravel at `http://localhost:8080/api`.
The browser tests ran visibly in headed Chrome.

## Results

| Area | Result | What was exercised |
| --- | --- | --- |
| Shipper and fleet-owner KYC | Passed | Real signup, OTP/profile completion, private document submission, admin download, rejection with feedback, resubmission of the same record, approval for both roles, and bell navigation. |
| KYC access control | Passed | Fleet owner received 403 when requesting the shipper's document or the admin KYC queue. Raw PAN/GSTIN and storage paths were absent from the response; PAN was masked. |
| Cancellation | Passed | Provider requested cancellation, booking actions paused, participant admin-decision attempt returned 403, admin continued the booking, shipper requested another review, and admin cancelled. Both participants' bell links opened the correct cancelled booking and decision summary. |
| POD correction | Passed | Provider marked delivery, uploaded an initial signed sample, shipper downloaded it and requested correction, provider uploaded a replacement, and shipper approved it. |
| POD access and approval lock | Passed | Unrelated user download/approval returned 403. Settlement stayed disabled until approval. Re-review and approved-file overwrite returned 422. Upload controls disappeared after approval. |
| Cancellation stage controls | Passed | Cancellation remained available after loading and disappeared when the trip started. |
| Angular notification tests | Passed | Three focused route tests, including the admin cancellation deep link. |
| Production build | Passed | Angular build completed; the existing initial-bundle size warning remains. |

All three focused browser scenarios passed across the initial KYC run and the
follow-up cancellation/POD run. The initial cancellation authorization test
omitted mandatory decision fields and received 422 before the permission check.
The test request was corrected to contain valid fields; its rerun returned the
expected 403. The failed-run booking was retained for diagnosis.

## Product fixes made during verification

- Corrected the Booking module's Git exclusions so nested PHP controllers,
  resources, migrations, and support files are visible to Git. No commit or
  staging operation was performed.
- Added admin notification routing to the exact cancellation/disputed booking.
- Added an authenticated signed-POD download button with busy and error feedback.
- Displayed cancellation submission errors inside its modal.
- Kept cancellation available across every stage before trip start.
- Updated the older final-settlement test to submit and approve a POD first.

## Login credentials

These are local test accounts. Password for all three: `TransportSevaE2E@2026`.
Login at `http://localhost:4300/auth/login` using the email or mobile below.

| Role and purpose | Email | Mobile |
| --- | --- | --- |
| Shipper: KYC and booking owner | `verify-shipper-1793028294862-61@transportseva.test` | `7028294923` |
| Fleet owner: KYC and booking provider | `verify-truck-owner-1793028294862-62@transportseva.test` | `7028294924` |
| Unrelated fleet owner: POD privacy checks | `verify-truck-owner-1793028294862-63@transportseva.test` | `7028294925` |

The existing `admin@test.local` account performed moderation and decisions;
no new administrator was created. The shipper and selected fleet owner both
completed repeated successful UI logins. The unrelated user completed signup
and authenticated privacy checks.

## Records retained

| Purpose | Load | Booking | Final test state |
| --- | --- | --- | --- |
| Cancellation: continue, then cancel | `LD-000029` | `TS-28HC72SJHV` | Cancelled, admin token/commission decisions recorded |
| POD rejection, correction, and approval | `LD-000030` | `TS-KOQKWAZAA8` | Delivered; POD approved; settlement enabled but no final payment recorded |
| Initial stopped cancellation test | `LD-000028` | `TS-OSOJMO8D7B` | Disputed; retained from the corrected test setup |

Record UUIDs:

- Cancellation load: `707a2696-710e-4ab1-acfd-1e750c60a586`
- Cancellation booking: `03de9a0a-57fa-416e-b5c1-1cd611bcc650`
- POD load: `d3bb161e-026f-4c5e-a550-6ce51db3fc37`
- POD booking: `5c18b398-8a75-4017-9ecf-e268282a4852`
- Retained first-attempt booking: `1853ee62-25e6-4e73-9fe7-77ca471daa59`
- Shipper KYC: `9108a5e3-9c6f-45be-9ac0-c94ea0fb79f7`
- Fleet-owner KYC: `64085729-c4cf-4627-81ed-8477a656303d`
- Registered test vehicle: `VERIFY028294862`

## Scope and evidence

Real payment collection, refunds, provider payout, and GPS were skipped.
Only local mock tokens were used to prepare the POD booking. Cancellation
tested admin decisions, not execution of a refund. KYC enforcement remains
opt-in; it was not enabled by this verification.

The UI steps are listed in [VERIFICATION_FLOWS.md](VERIFICATION_FLOWS.md).
Bookings were prepared through the normal authenticated load/application/
acceptance APIs; operational fixtures used the normal workflow endpoints.
Cancellation, admin decisions, delivery, POD upload/review/download, and bell
navigation were performed through the visible UI. No database reset, deletion,
or migration was performed during this run.

Machine-readable reports (generated test artifacts):

- [Initial run, including the successful KYC scenario](../test-results/verification-20261026-results.json)
- [Successful cancellation/POD follow-up](../test-results/verification-20261026-followup-results.json)

Each scenario attaches `verification-records.json`; access tokens are excluded.
