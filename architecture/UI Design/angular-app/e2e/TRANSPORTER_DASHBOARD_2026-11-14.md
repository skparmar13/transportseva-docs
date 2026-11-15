# Transporter Dashboard — 14/11/2026

## Delivered behavior

The Transporter Dashboard now uses the existing authenticated provider
dashboard API. It displays the account's actual registered vehicle total,
vehicles on trip, available vehicles and pending sent applications. Recent
vehicles show persisted registrations, type, make/model, allocation status
and formatted registration time. Totals cover the account; the recent preview
is capped at six vehicles by the API.

Sample KPIs/trends, sample booking requests and browser-only dashboard request
acceptance were removed. Loading, duplicate-refresh prevention, genuine empty
state, error/Retry, English/Hindi and the existing dashboard styles are reused.
Quick actions open Load Board, Fleet, Drivers and Booking Requests.

The existing Transporter `applications` screen reads applications received on
the user's posted loads. A separate `/transporter/sent-applications` route now
reads `applications/mine`; both views have distinct sidebar links. The pending
dashboard card opens the sent view. The received route remains available and
its page title now describes that view. Existing list bounds were retained;
this change does not add pagination to either Transporter application view.

The visible journey found an encoded nested path (`fleet%2Fdrivers`) in the new
Drivers quick action. It was repaired using an absolute route string, along
with the corresponding registered-driver Back to Drivers link. A precise URL
regression now covers the dashboard action.

## Validation

| Check | Result |
| --- | --- |
| Full Angular suite after dashboard/application implementation | 341 passed |
| Final focused suite after nested driver-link repair | 28 passed: all three real dashboard variants, registered driver and Transporter application modes |
| Source audit | 10 passed, including dashboard and sent-applications wiring |
| Production build | Passed; initial 985.45 kB, below unchanged 1 MB error limit; existing 500 kB warning remains |
| Visible Chrome journey after repair | 1 passed, 3.1 minutes |
| Whitespace validation | Passed |

The browser compared dashboard values with the real dashboard API and vehicle
directory, checked recent-record rows, opened sent and received applications,
verified all four quick actions, reloaded the dashboard and sent view, and
checked a narrow viewport. It held a dashboard refresh to verify loading and
disabled refresh, returned HTTP 503, then recovered actual totals through Retry.

The original browser run stopped at the encoded Drivers quick-action URL.
The passing rerun used the repaired URL. Source-audit validation also caught a
stale reference to the prior direct session check; that audit anchor now points
to the implemented navigation-scoped verification service.

## Account, artifacts and data limits

Existing account: `qa-onboarding-1793463324476-transporter@transportseva.test`.
The dashboard API determines identity and scope. No user/owner identifier is
submitted by this UI. The page does not fall back to sample data when the API is
unavailable or backend mode is disabled. Non-zero, genuine zero, denied/malformed
dashboard response, refresh and Hindi behavior are covered by unit fixtures;
the visible journey uses whatever real records the existing account owns.

Artifacts: `test-results/transporter-dashboard-2026-11-14` (original failure)
and `test-results/transporter-dashboard-final-2026-11-14` (passing rerun).
The passing test attached `transporter-dashboard.json` with account, actual
totals, preview count, sent-application count and blocked-write evidence.

Business mutations and external hosts were blocked during the browser journey;
only authentication lifecycle POSTs and read requests were allowed. No users,
vehicles, applications or bookings were created. No database migration/reset,
backend source change or backend configuration change was required.
