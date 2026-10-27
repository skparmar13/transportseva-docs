# KYC, cancellation, and POD browser verification

Suite: `e2e/kyc-cancellation-pod.spec.ts`.

The suite uses headed Chrome at `http://localhost:4300` and the configured local
API. Accounts are created through signup, OTP verification, and profile setup
in the existing `transportseva` database. Fresh booking fixtures are prepared
through authenticated APIs. Existing accounts and bookings are preserved.

Real payments, provider refunds, and GPS are excluded. The POD fixture requires
the local mock payment provider and asserts that token checkout returns a mock
session. Cancellation records an admin decision without transferring funds.

| Case | Browser steps and assertions |
| --- | --- |
| KYC-01 | Create a shipper and fleet owner, complete OTP/profile setup, and submit KYC for each role. Both see Awaiting verification; IDs are masked and storage paths are absent. |
| KYC-02 | Fleet owner attempts to download the shipper document and access the admin queue. Both requests must return 403. |
| KYC-03 | Admin follows the bell notification to KYC, downloads the document, requests a correction from the shipper, and approves fleet-owner KYC. |
| KYC-04 | Shipper follows the correction notification, resubmits the same KYC record, and receives admin approval. Both roles follow approval bell links to their verified KYC page. |
| CAN-01 | Create a fresh load/application/booking through APIs; the fleet owner requests cancellation in the booking UI. The booking pauses and operational actions fail. |
| CAN-02 | A participant submits a fully valid admin decision request. The API must reject it with 403. |
| CAN-03 | Shipper and admin follow cancellation bell links to the exact booking. Admin records Continue after a simulated phone review, restoring the prior stage. |
| CAN-04 | Shipper requests a second review; admin records Cancel plus token/commission decisions. Both participants follow decision bell links and see the cancelled booking with its summary and no further operational controls. |
| POD-01 | Prepare a fresh load/application/booking and the required operational stages through APIs using mock tokens. Cancellation remains available after loading and disappears once the trip starts. |
| POD-02 | Provider marks delivery complete in the UI and uploads a signed sample image. Final settlement remains locked. |
| POD-03 | An unrelated user cannot download or approve the POD (403). The shipper downloads the signed file from the booking and requests correction. |
| POD-04 | Provider follows the correction notification and uploads a replacement. Shipper approves it; settlement becomes available. |
| POD-05 | Reopening an approved review or replacing its file is rejected (422), and the provider no longer has an upload control. |

## Running the suite

```powershell
npx playwright test e2e/kyc-cancellation-pod.spec.ts --headed --workers=1
```

Each test attaches `verification-records.json` with test account credentials,
KYC IDs, and any newly created loads and bookings. Access tokens are excluded.
Test data from failed runs is retained for diagnosis.

To continue cancellation/POD checks after a completed KYC scenario, set
`E2E_VERIFICATION_RUN_ID` to the recorded run ID and select the relevant tests
with `-g`. This reuses the saved users and registered vehicle. A POD scenario
creates its unrelated user through signup, so use a fresh run or account if
that scenario already reached signup during an earlier attempt.
