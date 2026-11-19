# Admin operational dashboard

Implemented locally on 19/11/2026. The backend dashboard route selects the real
operational component. Explicitly disconnected prototype routing is unchanged.

## Access and data contract

`GET /api/admin/dashboard` requires an active, explicit `admin.dashboard.view`
grant on an active, unambiguous Super Admin mapping. It fails closed even when
the deployment-wide staff enforcement switch is off. It accepts no scope,
filter or pagination parameters, and returns private/no-store responses.

Every section also requires its existing domain capability:

| Section | Capability | Contents |
| --- | --- | --- |
| Marketplace | `marketplace.bookings.view` | Loads posted/open, live pending applications, bookings created/in transit/delivered |
| Disputes | Both booking and `marketplace.disputes.view` | Open/under-review cases on undeleted bookings where the administrator is not a party |
| Reviews | `marketplace.reviews.view` | Pending moderation count |
| KYC | `marketplace.kyc.view` | Pending review count |
| Support | `support.tickets.view` | Open/in-progress account support tickets |
| Contact | `contact.inquiries.view` | New enquiries |
| Newsletter | `newsletter.subscribers.view` | Pending confirmations, never labelled active subscribers |
| Activity | `admin.audit.view` | Ten latest recorded admin events, in stable timestamp/UUID order |

Missing domain grants omit their sections and totals; they do not return zero.
Queries use persisted rows in a consistent read transaction. Soft-deleted loads,
applications, bookings and disputes are excluded through their existing models;
applications on deleted loads do not inflate pending totals. Delivered means
the booking's recorded `completed` state. No money value or settlement claim is
derived from that state.

The activity allowlist contains event UUID, action, category, target UUID and
timestamp. It excludes actor names, target labels, notes and before/after state.
Individual activity links open the existing audit target filter. Queue links
use existing authorized routes. Aggregate booking counts do not grant access to
participant booking details; the existing Admin dispute-review restriction is
unchanged. This is an operational overview, separate from
[Admin Reports](ADMIN_REPORTS_OPERATIONS.md), and does not claim a complete
shipment-event stream.

## Local activation

The existing `admin@test.local` Super Admin received only the dedicated dashboard
read grant after a fresh verified backup. No memberships, unrelated grants or
deployment-wide enforcement defaults changed. Normal login now reaches the
dashboard for that account; staff without this grant continue to Staff Access.

The local/testing-only command follows the existing additive grant pattern:

```powershell
php artisan dashboard:prepare-access --actor=EXISTING_SUPER_ADMIN_UUID
php artisan dashboard:prepare-access --actor=EXISTING_SUPER_ADMIN_UUID --apply --backup=ABSOLUTE_SQL_BACKUP_PATH --backup-sha256=VERIFIED_SHA256
```

Default execution is preview only. Applying requires an existing eligible actor,
an active capability and a verified backup identifying the current database.
It adds only the missing permission/role association, records a security audit
and sends eligible staff a linked bell item. Replays do not duplicate these
events. The command refuses staging/production activation. Review any non-local
grant separately; do not change the staff enforcement default to deploy this
dashboard.

To disable local access, remove only the reviewed dashboard association through
the approved access process, retaining other grants and recorded history. No
database restore, migration rollback or table deletion is needed. Keep API and
frontend revisions together: a new API route alone does not authorize the UI.

## Verification and display

The dashboard has a 30-second read deadline, cancellation on navigation,
duplicate refresh locking, visible loading/error/retry and server-denial states.
Refresh clears old totals before reading; a denied result retains no cached
dashboard. It has no cross-user response cache or sample fallback. The adapter
rejects incomplete, negative, unexpected or unauthorized totals and unbounded
activity. English/Hindi copy, reduced motion and standard IST date/time display
are included.

See [test evidence and limits](../e2e/ADMIN_DASHBOARD_2026-11-19.md). Real dashboard
counts can be compared against independently captured local SQL counts by
setting `E2E_ADMIN_DASHBOARD_EXPECTED_TOTALS` to a JSON totals object for the
headed acceptance test. Without it, the browser still compares actual API
records to the rendered cards and links.
