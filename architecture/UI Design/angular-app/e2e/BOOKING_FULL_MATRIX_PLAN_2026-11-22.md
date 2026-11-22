# Booking regression plan — 22/11/2026

This is a bounded, reproducible scenario matrix, not a claim that every possible
input or interleaving can be exhausted. Failures and unsupported paths stay
visible in the final execution report.

| Area | Cases / expected outcome | Execution |
| --- | --- | --- |
| Signup and login | New Shipper, two Transporters, two Truck Owners; phone OTP, forced profile gate, optional fields/preferences, mandatory email verification, logout/relogin | Visible UI, real local records |
| Signup failures | Invalid/expired/reused/replaced OTP, duplicate identity, stale profile, protected fields, incorrect password, unfinished onboarding | Isolated API and Angular regressions |
| Fleet | Owned registered vehicle/type dropdown and registered driver; unavailable/foreign resources denied | UI positives; isolated negatives |
| Pairings | Shipper→Truck Owner, Shipper→Transporter, Transporter→Truck Owner, Transporter→different Transporter | Four complete UI journeys |
| No advance | Additional full journey with no advance or mid-trip transfer; final gross receipt must equal entire freight | Fifth UI journey |
| Applications | Three competing providers per load; duplicate/late/self application denied; owner-only actions scoped | UI plus isolated API |
| Negotiation | Owner counter-offer accepted by provider; applicant counter-offer accepted by owner; own-offer acceptance denied; competing applicants rejected | UI and API |
| Booking identity | One canonical booking; retries return same booking; cross-user reads denied | UI/API and independent DB checks |
| Concurrency | Duplicate application, competing acceptance, duplicate booking, offer/accept contention; vehicle/driver/subcontract reservation races | Separate processes in isolated DB |
| Tokens | Both parties use existing local mock provider; only both paid unlock operations; completion must not imply refund | UI and isolated API |
| Bank instructions | Synthetic bank capture; consent/password/version rules; documented authorized manual approval/rejection; pending instructions hidden | Visible UI and isolated API |
| Direct receipts | Advance, mid-trip, split mid-trip, final gross balance; payer report stays pending until recipient confirms; fees remain separate | Full UI journeys |
| Receipt failures | Duplicate/replayed references, stale bank version, excess/invalid amounts/dates, wrong stage/party, unapproved POD, disputed reservation | Isolated API; focused UI |
| Operations | Own vehicle/driver assignment, loading report and shipper confirmation, trip start and delivery | Visible UI |
| Tracking handoff | Tracking action opens the exact assigned booking/vehicle; no location signal fabricated | UI route/read checks |
| POD | Real file upload, authenticated download, rejection/resubmission/approval; final receipt locked until approved | UI plus isolated API |
| Cancellation/dispute | Party request, paused actions, admin documented call decision to continue or cancel; resources released on cancellation; no automatic refund claim | Focused UI and isolated API |
| Notifications | Correct event recipient and relevant booking/profile/admin route; no bank numbers in notices | UI and API |
| Readback | Reload both parties; real trip/detail records; financial sums and canonical booking verified independently | UI/API/DB |
| Known incomplete flows | Disputed-receipt administrative adjudication and platform-fee collection assessed honestly against implemented contract | Report as gaps where applicable |
| Preservation | Backup before new main-DB QA data; all existing tables and critical original rows retained; no reset/restore/drop | Hash comparison |

New main-database records are labelled QA and retained. Backend fault/race tests
are restricted to `transportseva_employee_test`. Existing delivery settings,
staff memberships and KYC enforcement are not changed for the tests. Browser
traces, videos and automatic screenshots are disabled around credentials and
bank forms; business requests are local only.
