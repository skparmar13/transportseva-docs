# Newsletter consent operations

The public footer saves a pending consent request. An email confirmation link
must be opened and its Confirm button selected before subscription becomes
active. Unsubscribe also requires an explicit click and a private capability;
opening either page alone makes no state change.

## Storage and deployment

The additive migration is
`transportseva-api/database/migrations/2026_11_16_100000_create_newsletter_consent_tables.php`.
It creates only `newsletter_subscribers` and `newsletter_consent_requests`.
Existing tables are retained. Before applying it to another approved target,
verify that database, take and verify a backup, inspect this exact migration's
SQL, and run only the reviewed path. Do not reset a database or apply unrelated
pending migrations to deploy this feature.

Subscriber emails are encrypted using the application's encryption key. A keyed
digest enforces normalized-email uniqueness. Keep the existing APP_KEY securely
with the existing backup/key plan; changing it also invalidates capabilities.
Consent requests retain their server policy version, expiry, confirmation time,
hashed client address and idempotency payload digest. No raw capability is stored.
Withdrawal increments the consent epoch so earlier confirmation links cannot
reactivate consent. Re-subscription requires a fresh confirmation.

The migration's down method deliberately refuses automatic deletion of consent
records. Roll back application behavior while retaining these tables; review
retention/export/removal separately rather than dropping recorded consent.

## Delivery configuration

`NEWSLETTER_SANDBOX=true` is the safe default. Only local/testing environments
with the existing auth debug flag enabled return a local test confirmation
capability. No email is sent in that mode. Staging and production never return
that capability; the form honestly reports unavailable confirmation delivery.

Before real delivery, separately configure and approve the SMTP sender and
recipient test. Then set `NEWSLETTER_SANDBOX=false` and set
`NEWSLETTER_FRONTEND_URL` to the approved HTTPS frontend origin/base path.
User information, query strings and fragments are rejected in this configured
base URL. Log/array mail transports are not accepted as successful delivery.
The confirmation capability expires after 48 hours. Mail rendering preserves
the exact plaintext fragment URL. No broadcast/campaign sender was added.

Delivery is attempted once per saved request, after its transaction commits.
Failures retain a pending request and expose no SMTP exception details. An
uncertain replay keeps the same request ID; a new link can be requested using
the form's explicit restart action. A saved request alone never reactivates a
withdrawn address. A process interrupted during delivery may leave a request
marked sending; this is not an active subscription or a delivery guarantee.

## Public contracts

| POST endpoint | Fields |
| --- | --- |
| `/api/public/newsletter/subscriptions` | `submission_id`, `email`, explicit `consent`, empty `website` honeypot |
| `/api/public/newsletter/confirm` | `request_id`, private `token` |
| `/api/public/newsletter/unsubscribe` | `subscriber_id`, private `token` |

Unknown fields/query credentials and payloads over 4 kB are rejected. Request
limits are two per minute/five per hour per email digest, ten per minute per
client address, and thirty proof actions per minute per client address.
Responses are private/no-store. They do not provide a public subscriber lookup.
Capabilities travel in POST bodies; frontend links use fragments which the
action page removes from the visible URL. No proof is written to localStorage.

The footer has a bounded 60-second save window with duplicate locking and
request-ID-preserving retries; confirmation/withdrawal requests remain bounded
at 30 seconds. The local API performance fix and its restart instructions are
documented in [Local API performance](LOCAL_API_PERFORMANCE.md).

## Staff inspection

`/admin/newsletter` now reads real consent records through private, read-only
endpoints. It requires the active `newsletter.subscribers.view` permission on
an active, unambiguous Super Admin mapping. This API authorization applies even
when the broader staff-enforcement switch is off. Support, Operations, KYC,
Finance, unmapped administrators and marketplace accounts cannot inspect this
directory. An accidental database grant to another role does not enable it.

| GET endpoint | Query |
| --- | --- |
| `/api/admin/newsletter/subscribers` | `page`, `per_page` (1–50, UI uses 25), optional `status`, optional exact `email` |
| `/api/admin/newsletter/subscribers/{uuid}` | `page` for request history (25 rows) |

Status is `pending`, `subscribed` or `unsubscribed`. Email lookup trims and
lowercases the whole address, then matches its indexed keyed digest. It is not
a substring search or a bulk decryption scan. The four summary totals cover all
saved subscribers; list totals and pages respect filters. Both lists use stable
creation-time/UUID ordering. Responses are private/no-store and explicitly
allowlisted; no capability, digest, client-address hash or consent epoch is
returned. GET reads do not write audit rows or change consent.

History includes policy version, recorded delivery outcome, expiry and request
confirmation time. A historical confirmed request does not override the current
subscriber state. `sandbox` means no email was sent, and `sent` records handoff
to the mail transport rather than inbox receipt. The UI uses the application's
DD/MM/YYYY hh:mm AM/PM display and shows dashes for missing timestamps.

There are no admin subscribe, unsubscribe, delete, resend, export or campaign
actions in this implementation. Do not import sample/browser-local subscriber
records. Re-subscription continues to require a fresh subscriber confirmation.

## Local access preparation

The additive `newsletter:prepare-access` command is local/testing only. It
requires an explicitly selected existing mapped Super Admin with role-inspection
access. Preview from the backend directory:

```powershell
php artisan newsletter:prepare-access --actor=EXISTING_SUPER_ADMIN_UUID
```

After reviewing the exact target and verifying a full backup of that database:

```powershell
php artisan newsletter:prepare-access --actor=EXISTING_SUPER_ADMIN_UUID --apply --backup=ABSOLUTE_SQL_BACKUP_PATH --backup-sha256=VERIFIED_SHA256
```

The command adds only the missing read permission and its Super Admin role
association. It preserves other grants, passwords, memberships, consent records
and enforcement settings. An inactive existing capability is refused. Successful
new grants are recorded in the admin audit and produce a linked bell item for
eligible affected administrators; a replay does not duplicate these events.
Local activation was verified for the existing `admin@test.local` account.
The tool refuses staging/production activation. Review production grants
separately; no deployment-wide enforcement default was changed.

To disable inspection, remove only the reviewed newsletter role grant through
the approved access process. Do not restore the whole database or drop consent
tables to undo a UI or permission change.

## Checks

Use `NewsletterConsentTest` with the configured isolated `_test` database and
transactional rollback. The suite blocks external HTTP and fakes mail. Angular
tests cover saved receipts, draft/idempotency recovery, loading/cancellation,
private proof bodies and explicit actions. The headed browser suite is
`e2e/newsletter-consent.spec.ts`; it uses clearly labelled QA newsletter
addresses in the main local database and sandbox links, not real mail.

`AdminNewsletterTest` uses the same guarded transaction-rolled-back test
database. It verifies authorization, private field allowlists, paging/filtering,
unsupported writes and additive audited access preparation. The visible
`e2e/newsletter-admin.spec.ts` reuses existing staff accounts and saved consent
records; browser business writes are blocked. Controlled populated paging
responses are explicitly browser-only fixtures, not new subscriber records.
