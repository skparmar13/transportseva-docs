# Staff permissions acceptance plan

Prepared: 29/10/2026 (Asia/Calcutta).
Status: **Policy approved; first-phase coverage executed. Full acceptance remains incomplete.**

Policy: [approved staff permission matrix](STAFF_PERMISSION_MATRIX_DRAFT_2026-10-29.md).
The passing 27/10/2026 administrator-boundary suite is baseline evidence only,
not proof that the proposed fine-grained rules are implemented.

## Test setup after approval

- Use the existing `transportseva` main database for visible browser journeys.
  Identify approved existing Super Admin accounts before any grant changes.
- Create/login-verify only explicitly approved staff accounts for the five roles.
  Record their emails, initial test credentials, UUIDs and actual assigned roles.
- Backend unit/feature fixtures may use the established isolated test database;
  never present those fixture accounts as main-database logins.
- Retain current bookings/users. New cases use unique fixtures; no reset/drop,
  destructive cleanup or replacing existing grants without an approved diff.
- Run visible UI checks in headed Chrome with separate role contexts. Capture
  requests and redacted evidence without publishing auth tokens/private files.
- No real payment/GPS execution. No test may bypass approved POD/ownership locks.

## Acceptance cases

The table below defines full target acceptance, not an all-pass execution log.
The [29/10/2026 report](STAFF_PERMISSIONS_RUN_2026-10-29.md) records the actual
46 backend, 41 Angular and seven final headed checks. Only their implemented
subset is verified. Exercise direct APIs as well as UI navigation; an absent
button alone is insufficient evidence.

| ID | Scenario | Expected result |
| --- | --- | --- |
| STAFF-01 | Anonymous/inactive/public-signup user opens staff routes/APIs | Authentication/status denial; public signup cannot create an admin or attach staff grants |
| STAFF-02 | Customer/driver/company admin has a staff role name or forged browser grants | No platform staff access despite local role/cache manipulation or attached privileged label |
| STAFF-03 | Approved staff role with missing/inactive/deleted grants, unknown code, or multiple role assignments | Denied by default; no fallback to broad `isAdmin()` access |
| STAFF-04 | All five roles attempt every implemented matrix action | Explicit eligible/scoped success or 403 as specified; forbidden requests do not change records |
| STAFF-05 | Alter object UUID, case assignment, search/filter, pagination or document URL | No cross-scope records, fields, totals or private files; unassigned/foreign cases denied |
| STAFF-06 | Operations reviews a submitted customer review | Can publish/request changes; cannot edit author text/rating, moderate own review, or inspect raw KYC/finance |
| STAFF-07 | KYC Officer reviews assigned business KYC | Can read required files and approve/request correction; cannot moderate reviews, access unrelated bookings or finance |
| STAFF-08 | Finance inspects authorized ledger/settlement | Read-only approved fields; no money writes, private KYC, review moderation or dispute decisions |
| STAFF-09 | Support works an assigned case and calls parties | Can add case notes; no dispute outcome, raw documents, unrelated case access, or booking-state mutation |
| STAFF-10 | Super Admin records post-call continue/cancel decision | Correct state restoration/cancellation, audit and participant bell links; token/commission choices do not execute money |
| STAFF-11 | Operations/Finance/Support call the decision endpoint directly | 403 even if they can view the case; customer role-name spoofing also denied |
| STAFF-12 | Staff tries POD approval or participant fleet/trip/negotiation actions | Denied, including Super Admin; original shipper/provider operations still succeed for owned records |
| STAFF-13 | Staff reviews own KYC/review/dispute or changes its own protected role | Denied; independent authorized admin required; pending state preserved |
| STAFF-14 | Super Admin invites staff, changes an allowed grant, suspends staff | Real persistence, constrained fields, recorded actor/target/diff; affected user's next request honors revocation and receives a safe notification |
| STAFF-15 | Manipulate protected role, arbitrary permission slug, user type or another tenant's membership | No mass-assignment/escalation; reviewed catalogue only; no implicit promotion from legacy `user.*` grants |
| STAFF-16 | Concurrent removal/suspension/demotion of last active Super Admin | At least one active Super Admin survives; self-role editing blocked; no lockout from a race |
| STAFF-17 | Audit write fails while a privileged change is saved | Entire decision/grant/membership change rolls back; no success response with missing event |
| STAFF-18 | Scoped audit reads plus attempted event update/delete | Domain/object filters enforced server-side; security events restricted; no application audit mutation API |
| STAFF-19 | Download authorized KYC/POD evidence | Correct scope, private streaming and read event; no document content/path or tax IDs copied into audit |
| STAFF-20 | Pending action, duplicate click, API 403/422/503, expired token | Visible pending animation, no duplicate mutation, honest error/retry; transient refresh failures preserve credentials |
| STAFF-21 | Open existing tab with revoked grants or stale JWT/cached capabilities | Next API denies revoked action; UI refreshes allowed menu/buttons; cache cannot restore grants |
| STAFF-22 | Migrate approved mappings and retry migration; rehearse rollback on a copy | Idempotent approved diff, preserved unrelated grants/history, verified recovery; no permanent ADMIN wildcard |
| STAFF-23 | Shipper/fleet-owner marketplace regression | Signup, owned loads/applications/negotiation, mock tokens, fleet, POD, review, disputes and bell routes retain existing checks |
| STAFF-24 | Real-money, GPS and incomplete/deferred admin modules | Remain unavailable under this rollout; mock-only pages do not claim changes were persisted |

## First-phase coverage and remaining cases

| Coverage | Evidence / remaining limit |
| --- | --- |
| Role identity/ceilings, unknown/inactive/multiple roles, forged cache, extra grants | Strict JWT-backed tests plus five real login/permission browser scenarios |
| Review/KYC moderation boundaries, self-review, private KYC download audit | Backend fixtures; role queues viewed visibly; full assigned-case scoping is not implemented |
| Dispute decisions | Independent Super Admin continuation and own-case denial tested in backend; staff cannot invoke participant/money actions |
| Audit domains, security-event filters, same-token grant revocation | Backend tests; visible per-role audit reads and Super Admin access-change bell link |
| Staff/grant editing, self-edit and last-admin concurrency | Not implemented; write APIs remain denied. STAFF-14/16 and the grant-writing portion of STAFF-17 remain pending |
| Finance reconciliation and Support case work | Not implemented; STAFF-08/09 stay pending instead of granting unscoped reads |
| Restore rehearsal, repeated successful preparation and full rollback | Not executed; verified export/checksum is not full STAFF-22 acceptance |
| Marketplace regression | Backend regressions plus read-only two-tab booking test; no new full signup-to-completion browser journey in this staff task |

## Exit evidence

- Record exact commands, outcomes, failed attempts and corrected reruns separately.
- Provide the per-role action result matrix, real login-verified users and role UUIDs.
- Link case/booking/review/KYC identifiers, safe audit events and bell destinations.
- Verify restore/rollback safeguards before enabling role editing on real data.
- Obtain owner sign-off for any change from the approved matrix. Never silently
  weaken a policy because a test fails or requires additional assignment support.
