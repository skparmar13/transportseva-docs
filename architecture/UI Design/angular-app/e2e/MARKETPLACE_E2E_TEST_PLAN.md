# Marketplace end-to-end test matrix

The browser suite runs against the local Angular UI at `http://localhost:4300`
and the Laravel API configured in `public/runtime-config.js`. It creates uniquely
named test users and data; it never resets a database.

| ID | Scenario | Expected outcome | Automated status |
| --- | --- | --- | --- |
| MKT-01 | Shipper signup, OTP verification, profile setup | A verified user is taken to the Shipper dashboard; a repeated verification does not create a second account. | Signup, verification and profile passed; repeat verification not yet tested |
| MKT-02 | Fleet owner login entry | The login page is available and accepts the correct role route. | Passed |
| MKT-03 | Shipper posts a load | A new API-backed load has an ID and is visible to eligible providers. | Passed within MKT-04 |
| MKT-04 | Two fleet owners register their own vehicles and apply to one load | Each owner sees only their registered vehicle in the application selector; the shipper sees both applications and their quoted amounts. | Both applications passed; a separate visible browser test verified one fleet's dropdown excludes the other fleet's vehicle and successfully submitted the owned vehicle. |
| MKT-05 | Negotiate/accept one applicant and automatically reject the other | One accepted offer creates one API booking; the competing pending application becomes `Rejected`. | Competing-application rejection passed; a separate visible browser run sent a ₹17,000 counter-offer, accepted it as fleet owner, and confirmed the same amount as shipper. The acceptance run resumed the saved load after a loading timeout. |
| MKT-06 | Token payment by shipper and provider | Both parties complete mock token checkout; the booking is confirmed only after both payments. | Passed in a visible browser run: awaiting tokens after the first payment, confirmed after both mock payments |
| MKT-07 | Vehicle and driver assignment | Provider selects an owned registered vehicle and registered driver; UI shows the persisted assignments. | Vehicle and driver assignment and reload passed in visible browser runs; driver owner isolation passed in the browser and backend |
| MKT-08 | Loading completed, advance recorded, and trip started | Timeline advances in order and the shipper can record the eligible advance milestone. | Passed in a visible browser run; milestone release records status only, not a transfer. Separate shipper confirmation of loading is not implemented. |
| MKT-09 | Tracking and mid-trip milestone | Tracking opens for the assigned vehicle; a mid-trip amount is recorded and reduces remaining balance. | Mid-trip status and balance passed in a visible browser run; the link identifies the vehicle but real GPS integration is not connected. No money was transferred. |
| MKT-10 | Delivery, final payment and settlement | Delivery is marked, final balance is collected, provider payout and platform fee are displayed, and trip is completed. | Trip completion, settlement calculation and test-only recorded status passed in a visible browser run; collection and payout are not integrated or verified. |
| MKT-11 | Chat and bell notifications | New chat messages and every relevant marketplace action create a notification for the other participant without duplicate polling requests. | One message appeared in the other user's open chat and its bell notification appeared in a visible two-browser run; all other action types and duplicate polling have not been fully tested. |
| MKT-12 | Marketplace safeguards | Contact numbers are rejected in public notes; provider cannot use another provider's vehicle; duplicate registration is handled cleanly. | Common contiguous, spaced, and hyphenated phone formats rejected in browser and API tests. Foreign vehicle rejected by API; owned vehicle and authoritative registered type passed API and browser tests. Duplicate registration remains untested here; phone filtering does not cover every possible disguise. |
| MKT-13 | Load and application request timeout | A stalled request shows a retryable error instead of an indefinite spinner or false empty state; retry reloads existing data. | Both timeout and retry paths passed in visible browser tests with simulated stalled requests; this does not resolve the underlying API slowness. |

## Test data policy

- Signup scenarios use timestamp-derived emails, mobile numbers, loads, and vehicle registrations. Follow-up scenarios may reuse explicitly supplied test users, bookings, or vehicles and retain any newly created load.
- No `migrate:fresh`, table drop, or cleanup operation is part of this suite.
- Failed-run data is retained for investigation unless the user explicitly requests cleanup.
