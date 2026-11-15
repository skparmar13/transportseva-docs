# Session navigation — 14/11/2026

The portal parent and child guards previously each called `auth/me` during
the same navigation. Both independently imposed a 15-second timeout, which
could route a valid session to the recovery page when the local API was slow.

Guards now use one bounded server identity verification per navigation and
access token. The completed response is available to that navigation's child
guard, then discarded on navigation completion, cancellation or error. Later
navigation, reloads and token changes require another server check. There is no
cross-navigation identity cache and no trust in editable browser role data.

One retry after 250ms is allowed only for network failures and HTTP 502/503/504.
The entire verification has a 30-second deadline including that retry. Identity,
onboarding and staff authorization still use the actual server response.
Confirmed authentication or access failures are not retried by this layer.
Persistent failures still use the existing explicit session-check recovery UI.
This repairs client request duplication and slow-response handling; it does
not claim to remove every cause of backend or network latency.

Validation:

- Production build passed (985.13 kB initial bundle; existing 500 kB warning,
  below the unchanged 1 MB error limit). Whitespace validation passed.
- 28 focused authorization/session/token-refresh tests passed, including
  one HTTP subscription for sequential parent/child guards, fresh checks on
  new/cancelled navigation and token changes, slow valid response, total
  deadline, transient retry, confirmed denial, onboarding and staff access.
- Visible Chrome: 1 passing journey, 1.1 minutes. Existing Truck Owner login,
  Driver list, Vehicle list, Dashboard and reloads were checked against the real
  API. Exactly one `auth/me` request occurred on each ordinary navigation.
- A real successful identity response was deliberately held for 16 seconds;
  the guarded Dashboard loaded without redirecting to login and used one read.
- One controlled 503 followed by the real API response recovered automatically
  with exactly two reads and retained credentials.
- The initial browser execution reached all functional assertions but failed
  on a Jasmine-only matcher accidentally used in Playwright. Its corrected
  rerun passed. No product change was needed for that test error.
- Final artifacts: `test-results/session-navigation-final-2026-11-14`, including
  the attached `session-checks.json` request counts.

Account: `verify-truck-owner-1793028294862-62@transportseva.test`.
Business mutations and external hosts were blocked. No users or marketplace
records were created, and no backend source, database or service configuration
was modified.
