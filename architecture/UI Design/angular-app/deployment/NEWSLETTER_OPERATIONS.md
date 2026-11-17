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
at 30 seconds. The local homepage API feed latency observed during testing is
a separate performance item; longer form waits are not production performance
sign-off.

The existing Admin Newsletter Subscribers page remains a blocked prototype.
Implement a separately authorized server queue before presenting its data as
real administration. Do not import sample/browser-local subscribers or permit
an administrative toggle to silently opt a withdrawn address back in.

## Checks

Use `NewsletterConsentTest` with the configured isolated `_test` database and
transactional rollback. The suite blocks external HTTP and fakes mail. Angular
tests cover saved receipts, draft/idempotency recovery, loading/cancellation,
private proof bodies and explicit actions. The headed browser suite is
`e2e/newsletter-consent.spec.ts`; it uses clearly labelled QA newsletter
addresses in the main local database and sandbox links, not real mail.
