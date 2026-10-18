# Marketplace end-to-end test matrix

The browser suite runs against the local Angular UI at `http://localhost:4300`
and the Laravel API configured in `public/runtime-config.js`. It creates uniquely
named test users and data; it never resets a database.

| ID | Scenario | Expected outcome | Automated status |
| --- | --- | --- | --- |
| MKT-01 | Shipper signup, OTP verification, profile setup | A verified user is taken to the Shipper dashboard; a repeated verification does not create a second account. | Passed |
| MKT-02 | Fleet owner login entry | The login page is available and accepts the correct role route. | Passed |
| MKT-03 | Shipper posts a load | A new API-backed load has an ID and is visible to eligible providers. | Passed within MKT-04 |
| MKT-04 | Two fleet owners register their own vehicles and apply to one load | Each owner sees only their registered vehicle in the application selector; the shipper sees both applications and their quoted amounts. | Passed (visible browser run) |
| MKT-05 | Negotiation, accept one applicant and reject the other | Offers are recorded, one accepted application creates one booking, and the other applicant is notified of rejection. | To implement and run |
| MKT-06 | Token payment by shipper and provider | Both token orders are created and paid; the booking becomes confirmed only after both succeed. | To implement and run |
| MKT-07 | Vehicle and driver assignment | Provider selects an owned registered vehicle and registered driver; UI shows the persisted assignments. | To implement and run |
| MKT-08 | Loading completed, advance released, and trip started | Timeline advances in order and shipper can release the eligible advance. | To implement and run |
| MKT-09 | Tracking and mid-trip milestone | Tracking opens for the assigned vehicle; a mid-trip amount is recorded and reduces remaining balance. | To implement and run |
| MKT-10 | Delivery, final payment and settlement | Delivery is marked, final balance is collected, provider payout and platform fee are displayed, and trip is completed. | To implement and run |
| MKT-11 | Chat and bell notifications | New chat messages and every relevant marketplace action create a notification for the other participant without duplicate polling requests. | To implement and run |
| MKT-12 | Marketplace safeguards | Contact numbers are rejected in public notes; provider cannot use another provider's vehicle; duplicate registration is handled cleanly. | Partially covered; add browser cases |

## Test data policy

- Every browser run uses a timestamp-derived email, mobile number, load, and vehicle registration.
- No `migrate:fresh`, table drop, or cleanup operation is part of this suite.
- Failed-run data is retained for investigation unless the user explicitly requests cleanup.
