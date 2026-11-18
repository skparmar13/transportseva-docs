# Admin newsletter consent queue — 18/11/2026

Completed: `/admin/newsletter` now reads real saved consent records instead of
browser-local sample subscribers. It provides global totals, status filtering,
exact normalized-email lookup, server paging and private paged request history.
It does not change subscriber consent.

## Implemented flow

| Step | Behavior |
| --- | --- |
| Log in as an authorized Super Admin | Fresh server identity exposes the newsletter route only with its active dedicated grant |
| Click the access notification | The bell item opens `/admin/newsletter` |
| View the queue | Shows actual pending, subscribed and unsubscribed totals; totals cover all saved records |
| Apply an email/status filter | Exact whole-email digest lookup and filtered server totals/pages; no bulk email decryption search |
| Page results | 25 records per page; unapplied draft filters do not silently change pagination |
| Open history | Exact subscriber UUID in the URL; reload preserves that target |
| Inspect requests | 25 requests per history page, policy/delivery/expiry/confirmation metadata and current consent status |
| Pending or failed read | Animated loading, disabled repeated actions, 30-second deadline, cancellation and retry |
| Access revoked or denied | Cached private rows/history are cleared; no sample fallback |

English/Hindi labels, accessible form controls, reduced-motion-aware indicators
and the shared DD/MM/YYYY hh:mm AM/PM formatter are used. Pending requests are
not labelled subscribed. Sandbox delivery says no email was sent; mail handoff
is not represented as confirmed inbox delivery. Historical request confirmation
does not override a currently withdrawn subscriber state.

The old resubscribe, unsubscribe and delete controls were removed. There are no
admin consent mutations, broadcast, export, resend or campaign actions. Fresh
subscriber confirmation remains necessary for re-subscription.

## Authorization and local activation

The new GET endpoints require `newsletter.subscribers.view` on an active,
unambiguous Super Admin membership with an active database grant. The controller
checks that permission independently of deployment-wide staff enforcement.
Support, Operations, KYC, Finance, marketplace accounts and unmapped admins are
denied; an accidental grant to another role cannot bypass the role catalogue.
Successful responses are private/no-store and expose only explicit fields.
Internal keyed hashes, consent epochs, client-address hashes and capabilities
are excluded.

Only local activation was performed, using the reviewed additive
`newsletter:prepare-access` command and a verified full backup. Existing account
`admin@test.local`, UUID `ddf20522-1558-4c80-ae1b-22b6c8860bd0`, retains its
Super Admin membership. Exactly one permission record and one role association
were added to role `5d9ce9c1-d773-46c7-a2a6-e0dd4ff589af`; other memberships,
grants and enforcement settings were preserved. The command records a security
audit and linked bell notification, and idempotent replay adds neither again.
Its staging/production execution is refused; other deployment grants require
separate review. See [operations and rollback](../deployment/NEWSLETTER_OPERATIONS.md).

## Executed verification

| Check | Result |
| --- | --- |
| Focused Angular queue/API/navigation suite | 15 passed before two additional cancellation/paging cases |
| Final full Angular suite | **440 passed**, including 13 new cases |
| Isolated AdminNewsletterTest | 9 passed, 83 assertions |
| Combined admin newsletter, public consent, staff policy and contact suites | **51 passed, 458 assertions** |
| Source audit | **16 passed** |
| Final visible Chrome suite | **4 passed**, no skips or configured retries; 1.7 minutes |
| Production browser/SSR build | Passed; 11 static routes prerendered |
| Focused PHP formatting/syntax and diff whitespace checks | Passed |

The production build retains the existing warning: initial bundle 954.41 kB
against a 500 kB warning threshold and unchanged 1 MB error limit. This feature
is not a production readiness sign-off.

Backend fixtures run only under the guarded `transportseva_employee_test`
database, using transaction rollback, fake mail and blocked external HTTP.
They cover anonymous/role/permission denial, enforcement-off denial, filtered
global totals, stable paging, bounded history, private field allowlists,
unsupported writes and dry-run/additive/idempotent local grant preparation.

Initial tests caught empty-JSON GET validation and numeric-primary-key/role-UUID
lookup errors in the new backend code. They were corrected before activation.
The first visible attempts also exposed a strict-template translation-key error
and an old development overlay while compilation settled. The final production
build and full visible suite passed; no failure was hidden by removing a case.

## Visible browser cases and records

| Case | Record source | Result |
| --- | --- | --- |
| Real access bell → exact email search → consent history → reload | Existing main-database records and real API | Passed |
| Held read → injected 503 → explicit retry → actual queue | Browser-only delay/failure, then real API | Passed |
| Existing Support/KYC logins → hidden navigation, direct API 403 and route denial | Real staff identities and APIs | Passed |
| Page 1/2 → page 2, then Hindi empty state | Explicit browser-only response fixtures | Passed |

Accounts reused; no users or passwords were created or changed:

| Purpose | Existing account |
| --- | --- |
| Authorized Super Admin | `admin@test.local` |
| Denied Support staff | `qa-staff-20261029-support@transportseva.test` |
| Denied KYC staff | `qa-staff-20261029-kyc@transportseva.test` |

The live queue contains six existing QA subscriber records: three pending,
zero subscribed and three unsubscribed, with nine saved requests. The exact
history opened was `qa-newsletter-1794892905773@transportseva.test`, currently
unsubscribed, with two saved requests. This task did not activate it or execute
a new marketplace booking journey.

Browser traffic was local-only. Writes were restricted to authentication and
notification-read bookkeeping; unexpected business-write arrays remained empty.
No external messages were sent.

## Database preservation

Full backup before local access activation:

- `.local-backups/transportseva-before-newsletter-admin-2026-11-18.sql`
- 1,152,616 bytes; all 109 CREATE TABLE statements and completion footer verified.
- SHA-256: `68be1f58709817ed1ed7d6c34f729b04c6adcaa96f4b8b08829fbaac18b5c43f`.

Final database-scoped snapshots preserve all 109 table names and ordered full-row
hashes/counts of the following nine sets:

| Table | Rows before/after |
| --- | ---: |
| `loads` | 39 |
| `load_applications` | 53 |
| `marketplace_bookings` | 26 |
| `marketplace_settlements` | 2 |
| `booking_token_orders` | 27 |
| `marketplace_kyc_profiles` | 4 |
| `newsletter_subscribers` | 6 |
| `newsletter_consent_requests` | 9 |
| `role_user` | 11 |

Exactly one permission and one role grant were added as described above, with
audit/bell records. Login/session and notification-read bookkeeping also occurred.
The hash comparison is not a full-database row audit. No migration, reset,
drop, seed, import, restore or consent mutation was run in the main database.

## Reproduce and evidence

```powershell
npm.cmd run test:ci -- --reporters=dots
node --test audit/screen-source-audit.test.mjs
npm.cmd run build
npx.cmd playwright test e2e/newsletter-admin.spec.ts --headed --output=test-results/newsletter-admin-verified-2026-11-18 --reporter=list
```

From the backend directory:

```powershell
php artisan test --filter='AdminNewsletterTest|NewsletterConsentTest|PlatformStaffPolicyTest|ContactInquiryTest'
```

- Browser status/screenshot: `test-results/newsletter-admin-verified-2026-11-18`.
- Preservation comparison: `test-results/newsletter-admin-integrity-2026-11-18.json`.
- Backend source: `app/Http/Controllers/AdminNewsletterController.php`,
  `app/Console/Commands/PrepareNewsletterAccess.php`, `app/Services/PlatformStaffPolicy.php`
  and the two new GET routes in `routes/api.php`.
- Backend regression: `tests/Feature/AdminNewsletterTest.php`.

Generated evidence and the private SQL backup are Git-ignored. They remain local;
the report preserves outcomes if later test runs replace generated artifacts.
