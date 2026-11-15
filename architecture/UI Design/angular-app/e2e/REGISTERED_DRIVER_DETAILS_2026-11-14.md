# Registered Driver Details — 14/11/2026

## Delivered

The backend-enabled Driver Details route now displays the matching record from
the existing authenticated employer-scoped `GET /api/marketplace-drivers`
directory. The directory's View action is visible and opens the real UUID route.

The page shows the saved name, phone, licence number/expiry, experience and
address, plus the API's current active-booking allocation. Booking assignments
remain managed through the existing Bookings screen, which is linked from the
profile. Sample ratings, trip totals, document upload controls and timeline
events are not rendered in backend mode.

The view supports English/Hindi, responsive fields, an animated loading state,
duplicate-refresh prevention, retry, explicit denied/missing states and stale
request cancellation on route changes. Invalid IDs are rejected locally. A
valid UUID absent from the authenticated directory is shown as missing.

The shared component also uses this real view for Transporter; Company remains
subject to the existing API's provider-role denial. No backend policy changed.
The current implementation reads the scoped directory to select a driver; it
does not add a dedicated driver-detail API or driver document storage.

## Executed validation

| Check | Result |
| --- | --- |
| Focused Angular tests | 5 passed: persisted/escaped values, zero experience, allocation, missing/invalid UUID, stale responses, loading, retry, denied/malformed response and Hindi |
| Production build | Passed; existing initial-bundle warning remains |
| Visible Chrome journey | 1 passed, 2.4 minutes; list → real profile → reload → narrow view → missing/malformed links → real profile → failed refresh → Retry → Bookings |
| Source inventory tests | 9 passed |
| Whitespace validation | Passed |

The browser used existing account
`verify-truck-owner-1793028294862-62@transportseva.test` and the existing
`Allocation Driver 1793036252590` record returned by its directory. It compared
displayed values with the real API response. All business writes and external
hosts were blocked; only authentication lifecycle POSTs were allowed. No users,
drivers or bookings were created. No database migration or reset was run.

The first browser attempt timed out after 12 seconds during the app-wide guard
on reload. Its snapshot showed only the global loading state. The final run
used a 60-second guard expectation and passed without a product guard change.

Artifacts: `test-results/registered-driver-details-2026-11-14` (initial failure)
and `test-results/registered-driver-details-final-2026-11-14` (passing rerun).
