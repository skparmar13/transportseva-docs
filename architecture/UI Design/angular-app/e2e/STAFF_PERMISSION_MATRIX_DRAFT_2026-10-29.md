# Proposed TransportSeva staff permission matrix

Date: 29/10/2026 (Asia/Calcutta). Status: **Role split approved; local first-phase rollout verified.**

This document began as a policy proposal. The owner approved the role split,
the initial administrator selection and four new QA staff accounts. See the
[implementation report](STAFF_PERMISSIONS_RUN_2026-10-29.md) for actual mappings,
tested capabilities and remaining disabled features; the full matrix is not yet
implemented. Real payment execution and GPS remain excluded.

## 1. Pre-rollout evidence

A read-only Laravel/Eloquent query against `transportseva` found these active
roles and stored grants. Membership counts below are `role_user` rows, not a
claim that each linked account is an active TransportSeva administrator.

| Stored role | Code | Membership rows | Stored permission slugs |
| --- | --- | --- | --- |
| Admin | ADMIN | 3 | role.view/create/edit/delete/assign; permission.view/create/edit/delete; user.view/create/edit/delete; company.view/create/edit/delete |
| Manager | MANAGER | 2 | role.view; permission.view; user.view/create/edit/delete; company.view/create/edit/delete |
| Employee | EMPLOYEE | 1 | role.view; permission.view; user.view; company.view |
| Driver | DRIVER | 1 | company.view/create/edit/delete |

Slash-separated actions in this inventory abbreviate separate stored slugs;
they are not wildcard permissions. The Driver company's write grants need
review before fine-grained enforcement is enabled. Stored grants alone do not
prove an endpoint authorizes or executes those actions. No grants were removed.

The five staff titles below exist in the UI's prototype staff catalogue, not as
five configured roles in the database. Existing `Admin`, `Manager`, `Employee`,
and `Driver` records must not be silently renamed or mapped by label.

Current implementation constraints:

- `User::isAdmin()` checks the actual `user_type`, not a displayed role name.
  Protected user/role/permission groups require an active admin account.
- KYC/review moderation uses broad admin checks. Dispute decisions additionally
  match selected role names, rather than stable permission slugs.
- The real Roles & Permissions page is read-only. The separate User Management
  page still edits an in-memory sample list, not real staff membership.
- Role editing needs service-contract repair: the controller imports a different
  interface namespace from the provider binding, and `update()` has incompatible
  declared return types in the interface and implementation.
- The admin navigation currently labels all admin accounts as Super Admin.
  That label is not evidence of actual Super Admin membership.
- Existing POD approval belongs to the booking's shipper; staff do not inherit it.

## 2. Proposed roles

All platform staff must be active, server-authenticated accounts with
`user_type=admin` plus an explicitly assigned, active staff role. A company
administrator, marketplace user, or driver remains outside platform staff access,
even if a cached label or a mistakenly attached role says otherwise.

| Proposed role | Stable code | Responsibility |
| --- | --- | --- |
| Super Admin | SUPER_ADMIN | Staff access, final dispute/cancellation decisions, protected configuration |
| Operations Manager | OPERATIONS_MANAGER | Booking oversight, review moderation, operational case coordination |
| KYC Officer | KYC_OFFICER | Business verification and necessary private KYC documents |
| Finance Manager | FINANCE_MANAGER | Read-only financial reconciliation and settlement records in this phase |
| Support Agent | SUPPORT_AGENT | Assigned support cases and minimum necessary customer/booking summaries |

Recommended initial assignment: one staff role per account. Multiple-role
combinations require explicit approval and separate tests before being enabled.
No automatic conversion of existing accounts is proposed.

## 3. Proposed action matrix

`Allow` means eligible subject to server-side object, field, and workflow checks.
`Scoped` means only server-authorized queues/cases and minimum necessary fields.
`Deny` means denied even if the URL or API is called directly. `Deferred` means no
capability is enabled by this proposal. An assignment/queue scope that has not
been implemented must fail closed; a client-supplied case ID is not assignment.

| Action | Super Admin | Operations | KYC | Finance | Support |
| --- | --- | --- | --- | --- | --- |
| Staff dashboard with permitted data only | Allow | Scoped | Scoped | Scoped | Scoped |
| Marketplace customer/company/vehicle/driver summaries | Allow | Scoped | Scoped | Scoped | Scoped |
| View marketplace booking details | Allow | Scoped | Deny | Scoped | Scoped |
| Suspend/reactivate marketplace accounts | Allow | Deny | Deny | Deny | Deny |
| Inspect business KYC queue and full submitted details | Allow | Deny | Scoped | Deny | Deny |
| Download necessary private KYC documents | Allow | Deny | Scoped | Deny | Deny |
| Approve KYC or request corrections | Allow | Deny | Scoped | Deny | Deny |
| Read KYC status only, without tax IDs/documents | Allow | Scoped | Scoped | Scoped | Scoped |
| Inspect submitted customer reviews | Allow | Scoped | Deny | Deny | Deny |
| Publish/unpublish reviews or request corrections | Allow | Scoped | Deny | Deny | Deny |
| View disputes and record post-call case notes | Allow | Scoped | Deny | Scoped | Scoped |
| Decide whether a disputed booking continues or cancels | Allow | Deny | Deny | Deny | Deny |
| Record token/commission outcome as part of that decision | Allow | Deny | Deny | Deny | Deny |
| Read POD evidence for an authorized dispute | Scoped | Scoped | Deny | Scoped | Deny |
| Approve/reject POD on behalf of shipper | Deny | Deny | Deny | Deny | Deny |
| Negotiate, accept an application, assign fleet, or advance a trip as a participant | Deny | Deny | Deny | Deny | Deny |
| View ledger, token status, commission and settlement records | Allow | Deny | Deny | Scoped | Deny |
| Manually record collected money or release/refund/payout real money as staff | Deferred | Deferred | Deferred | Deferred | Deferred |
| Work assigned support tickets, with no implied booking-state changes | Allow | Scoped | Deny | Deny | Scoped |
| Read administrative audit history | Allow | Scoped | Scoped | Scoped | Scoped |
| Modify/delete audit events | Deny | Deny | Deny | Deny | Deny |
| Inspect platform staff, role catalogue and grants | Allow | Deny | Deny | Deny | Deny |
| Invite/suspend staff or assign/change staff roles | Allow | Deny | Deny | Deny | Deny |
| Change role grants through an allowlisted editor | Allow | Deny | Deny | Deny | Deny |
| Create arbitrary permission definitions | Deferred | Deferred | Deferred | Deferred | Deferred |
| Change platform security/API settings | Allow | Deny | Deny | Deny | Deny |
| CMS, careers, newsletters, bulk exports and notification broadcasts | Deferred | Deferred | Deferred | Deferred | Deferred |
| Real GPS/device operations | Deferred | Deferred | Deferred | Deferred | Deferred |

This matrix is deliberately not a wildcard for Super Admin. Participant-owned
actions, audit mutation, and excluded money/GPS capabilities stay unavailable.
Existing shipper/provider flows retain their own ownership checks; the staff
restriction must not remove a shipper's right to approve its own booking's POD.

Scope definitions for implementation:

- Operations: authorized operational queues; no raw KYC files or financial ledger.
- KYC: business verification queues, not unrelated bookings, payment data, or users.
- Finance: approved reconciliation records and related identifiers; no raw KYC
  files. POD evidence requires an authorized dispute and an evidence-read grant.
- Support: explicitly assigned tickets/disputes and related booking summaries;
  no bulk customer search/export, raw documents, or settlement control.
- Audit: Super Admin sees all allowed event metadata; other roles see only their
  domain and authorized record scope. Category/UUID query filters alone are not
  authorization. Security/grant-change events remain Super Admin-only.

## 4. Non-negotiable workflow boundaries

1. TransportSeva handles disputes over a phone call; only the authorized deciding
   admin records continue/cancel and token/commission choices. Operations and
   Support may coordinate the call but cannot decide through another API.
2. A recorded refund/forfeiture/commission choice is not money movement. It does
   not mark a provider refund, commission receipt, or payout as executed.
3. Super Admin and staff cannot approve their own submitted KYC/review or their
   own booking dispute. Detect actor/subject overlap server-side and require an
   independent authorized reviewer; lack of another reviewer leaves it pending.
4. No staff impersonation, password viewing, or arbitrary password overwrite.
   An approved account-recovery flow must use a separate, audited reset process.
5. Staff cannot promote themselves or edit a role they currently hold. Block
   removal/suspension/demotion of the last active Super Admin, including
   concurrent requests. A second authorized administrator handles such changes.
6. Protected staff roles and permission definitions cannot be deleted through
   ordinary CRUD. Grant editing uses server-maintained, reviewed capabilities.
7. Every privileged decision/grant/membership change must record actor, target,
   reason indicator and safe before/after values atomically. Document-read
   auditing must not copy document contents or paths into events. Existing
   activity storage must be extended explicitly; no historical backfill claims.
8. Committed permission changes invalidate the affected access cache immediately.
   The next API request must honor revocation despite an old JWT/browser tab.
   Notify the affected staff account with a safe link to its access/session view;
   existing business-event bell links must remain intact.
9. A single approved role has explicit active grants; missing, inactive, deleted,
   unknown, or multiply assigned staff roles fail closed. User type alone is not
   a future blanket permission. Browser controls mirror, never replace, the API.
10. Apply status/ownership/dispute/POD locks after permission checks. Staff grants
    do not bypass valid booking states, cross-user privacy, or allocation locks.

## 5. Capability and route contract to implement after approval

These proposed slugs are not currently seeded or enforced. Reuse existing
`role.view`, `role.edit`, and `role.assign` where their meaning matches; do not
silently expand broad existing `user.*` grants into platform-staff authority.

| Capability group | Proposed capability identifiers | Existing integration point / gap |
| --- | --- | --- |
| Booking/case access | marketplace.bookings.view; marketplace.disputes.view; marketplace.disputes.note; marketplace.disputes.resolve | Marketplace booking/dispute controllers; scoped view and case-note persistence need implementation |
| KYC | marketplace.kyc.view; marketplace.kyc.status; marketplace.kyc.document; marketplace.kyc.moderate | `/api/admin/marketplace-kyc`, `/api/marketplace-kyc/{uuid}/document`; preserve owner document access separately |
| Reviews | marketplace.reviews.view; marketplace.reviews.moderate | `/api/admin/reviews`; preserve author editing and approved-only public publication |
| POD evidence | marketplace.pod.evidence | Existing POD download controller; staff dispute scope must be enforced separately from participant access |
| Finance inspection | marketplace.finance.view | Map real ledger/token/settlement reads; do not imply a real-money write API exists |
| Support | support.cases.view; support.cases.update | Assignment and persistence must exist before scoped staff access is enabled |
| Audit | admin.audit.view | `/api/admin/audit-events`; add server-enforced domain/object scoping |
| Staff administration | platform.staff.view; platform.staff.manage; platform.accounts.suspend | Replace in-memory User Management actions with validated, scoped APIs |
| Role inspection/editing | role.view; role.edit; role.assign; permission.view | `/api/admin/access/roles` plus repaired legacy write services; restrict protected-role and membership operations |
| Protected settings | platform.settings.manage | Inventory real endpoints first; mock-only controls must not report successful persistence |

Route guards, navigation, dashboard queries, notifications and action buttons
must consume server-returned capabilities. Server policy remains authoritative
for each API and document stream. Allowed actions show pending animation, block
duplicate submits, and display real success/error; denied actions are absent or
clearly disabled. Direct forbidden requests return 403 without mutation.

## 6. Safe implementation sequence after sign-off

1. Confirm the five roles, action matrix and per-person mapping. Resolve the
   stored Driver/Manager grants explicitly; do not infer intended scope by name.
2. Take and verify a recoverable backup before any permission data migration.
   Export current role/grant/membership mappings without exposing credentials.
   Identify the initial Super Admin account by reviewed UUID, not email/label.
3. Repair legacy role service/controller contracts. Add a permission catalogue,
   policies, field/record scoping and assignment persistence before exposing UI.
4. Prepare an additive, idempotent migration and reversible grant-diff plan.
   Bootstrap the explicitly approved Super Admin mapping atomically before
   switching enforcement; do not leave a permanent legacy ADMIN wildcard.
5. Enforce reads and writes together. Do not grant scoped staff access to a
   whole unscoped endpoint as a temporary shortcut. Incomplete modules stay off.
6. Implement real staff CRUD, constrained role editing, last-admin safeguards,
   cache revocation, audit events, and staff-access notifications. Do not offer
   fake saves on legacy mock-only pages.
7. Execute the [planned acceptance cases](STAFF_PERMISSION_TEST_PLAN.md), then
   visible browser tests for each approved role and the marketplace regression.
8. Hand over actual account credentials and record IDs only for accounts really
   created and login-verified in `transportseva`. No isolated fixture presented
   as a usable main-database account; no cleanup/reset/drop of existing data.

## 7. Approval and rollout status

Recommended defaults: KYC Officer handles KYC; Operations moderates public
reviews; Finance is read-only for this phase; Support handles assigned cases;
only Super Admin decides disputes/cancellations or changes staff access. POD
approval remains with the shipper. Real payments, GPS and deferred modules stay off.

The owner approved this split, allowed selection of the initial administrator,
and explicitly approved four new QA staff accounts. The initial mapping is the
existing `admin@test.local` account; exact QA mappings are in the implementation
report. Activation is local only. Existing staff/role editing remains disabled;
future changes to other accounts still require authorized, safeguarded handling.

## Source references

- [Previous verified boundaries and limits](ADMIN_ACCESS_AUDIT_RUN_2026-10-27.md)
- [Prototype staff titles](../src/app/core/services/auth-mock.service.ts)
- [Current real role inspection](../src/app/core/api/api-admin-access.service.ts)
- [Current sample-only user management](../src/app/features/admin/user-management/user-management.component.ts)
- [Backend user type and roles](../../../../../transportseva-api/Modules/User/Models/User.php)
- [POD ownership and current booking/dispute checks](../../../../../transportseva-api/Modules/Booking/Http/Controllers/MarketplaceBookingController.php)
- [Legacy role service interface](../../../../../transportseva-api/Modules/Role/Services/Contracts/RoleServiceInterface.php)
- [Legacy role service implementation](../../../../../transportseva-api/Modules/Role/Services/Implementations/RoleService.php)
- [Legacy role controller](../../../../../transportseva-api/Modules/Role/Http/Controllers/RoleController.php)

Preparation used read-only database inventory and source review. Subsequent
authorized first-phase implementation/testing is recorded separately in the
report; the original inventory above remains a before-rollout snapshot.
