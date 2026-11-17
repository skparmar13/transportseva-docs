# Public newsletter consent — 17/11/2026

Completed real public newsletter request, confirmation and unsubscribe behavior. The footer no longer reports a browser-local subscriber as saved. The Admin subscriber-management screen remains a separate, blocked prototype task.

## Flow and scope

| Step | Verified behavior |
| --- | --- |
| Submit an email | Requires an affirmative consent checkbox; validates email, bounded fields and honeypot; saves a pending request |
| Retry after failure | Preserves draft and request UUID; an acknowledged replay does not create duplicate consent or resend mail |
| Receive acknowledgement | Shows saved/pending delivery status; an unavailable mail transport does not activate or claim delivery |
| Open a confirmation link | No GET mutation or automatic activation; the private fragment is removed from the visible URL |
| Confirm | Posts a private capability; activates consent only after explicit confirmation; repeated confirmation preserves its result |
| Unsubscribe | Explicit capability-protected action; repeated withdrawal is safe |
| Request updates again | Saving another request preserves withdrawn status until a fresh link is confirmed |
| Replay earlier links | Prior confirmation cannot reactivate withdrawn consent; an old unsubscribe capability cannot change a newly confirmed consent epoch |

Emails are encrypted in storage and matched by a keyed normalized-email digest. Requests retain consent version, expiry, confirmation metadata, a keyed client-address digest and idempotency payload hash. Confirmation proofs expire after 48 hours. No public subscriber directory or existing-email status lookup was added. Anonymous requests cannot choose subscriber state, owner, delivery mode or policy version.

The deferred footer form keeps its UI loading feedback local, cancels requests on navigation and retains details on failure. Its save acknowledgement has a bounded 60-second window; proof actions remain bounded at 30 seconds. EN/HI copy, explicit pending/sandbox messages, reduced-motion-aware spinners and mobile layout are covered. Prototype subscriber records are not imported into the backend.

Local tests use sandbox confirmation links. Staging/production never expose debug proof, and log/array mailers do not count as successful delivery. Real SMTP is prepared behind explicit configuration but was not sent or verified here. The rendered plaintext mail URL is tested byte-for-byte so `&token` is not broken by HTML escaping. Delivery failures log only request UUID and exception class, not destination, capability or SMTP secrets.

## Verification

| Check | Result |
| --- | --- |
| Focused Angular newsletter tests | 14 passed |
| Final full Angular suite | 417 passed |
| Final isolated newsletter backend suite | 14 passed, 103 assertions |
| Existing public Contact regression | Earlier combined consent/contact run: 26 passed |
| Source audit | 15 passed |
| Final headed Chrome run | Both cases passed from the homepage |
| Additional headed real journey | Shared About-page footer journey passed |
| Production build | Passed, 952.54 kB initial bundle; existing 500 kB warning and unchanged 1 MB hard limit |
| Focused PHP formatting/syntax and diff checks | Passed |

The backend suite uses `transportseva_employee_test`, transaction rollback, a testing/database-name guard, fake mail and blocked external HTTP. Coverage includes encrypted pending storage, normalized duplicates, idempotency conflicts, proof expiry/tampering/cross-subscriber denial, re-subscription after withdrawal, production debug denial, invalid frontend URLs, throttling and safe delivery failure logs.

The final browser run uses real main-database newsletter endpoints and real proof/state transitions. One deliberately intercepted 503 checks draft/idempotency recovery. A separate explicitly controlled case checks delayed busy feedback, unavailable-delivery UI, narrow layout and invalid capability handling. Both restrict non-read traffic to the three newsletter endpoints; unexpected business writes are asserted absent. No emails or SMS were sent and no login accounts were created.

Earlier attempts and limits are preserved. A development compilation overlay, a Chrome profile lock and short test response waits interrupted earlier runs. The local homepage feed APIs also measured approximately 23–31 seconds, causing the original 30-second save acknowledgement to expire while storage completed. The bounded save window was corrected to 60 seconds and its timeout/cancellation regression updated. Final response waits allow application deadlines and homepage feed readiness is observed before the journey. This is functional verification, not production performance sign-off; local API performance is the next priority.

## Database preservation and backup

Only the reviewed additive migration `database/migrations/2026_11_16_100000_create_newsletter_consent_tables.php` was applied, first to the guarded test database and then to the main database after a complete backup. Its preview contained only the two new tables, their indexes and a foreign key. No reset, drop, seed, import, restore, broad migration run, staff-access change or existing subscriber import was executed.

The main database now has **109 tables**: all **107 original tables** plus `newsletter_subscribers` and `newsletter_consent_requests`. Ordered full-row hashes and counts of `loads` (39), `load_applications` (53), `marketplace_bookings` (26), `marketplace_settlements` (2), `booking_token_orders` (27) and `marketplace_kyc_profiles` (4) match the pre-migration baseline.

Backup: `.local-backups/transportseva-before-newsletter-2026-11-16.sql` — 1,141,645 bytes, 107 CREATE TABLE statements.

SHA-256: `9cc1b0440f03b58741a2db6d53c78241880cf2e1d7c6681fffa8d486c65b175e`.

The backup and test artifacts are Git-ignored. They remain private local files, outside public deployment assets. The migration does not automatically delete recorded consent on rollback; see the operations notes for retained-table rollback and delivery configuration.

## Newsletter QA records

These are anonymous newsletter addresses, with no login passwords or user-account provisioning. Successful real journeys finish unsubscribed. Interrupted-attempt requests remain pending and never activated; sandbox delivery sent no messages. No QA records were deleted to conceal failed attempts.

| Address | Final state | Saved requests |
| --- | --- | ---: |
| `qa-newsletter-1794888762523@transportseva.test` | pending | 1 |
| `qa-newsletter-1794889625586@transportseva.test` | pending | 1 |
| `qa-newsletter-1794890394978@transportseva.test` | unsubscribed | 2 |
| `qa-newsletter-1794890820764@transportseva.test` | pending | 1 |
| `qa-newsletter-1794892344193@transportseva.test` | unsubscribed | 2 |
| `qa-newsletter-1794892905773@transportseva.test` | unsubscribed | 2 |

## Reproduction and artifacts

- Browser suite: `e2e/newsletter-consent.spec.ts`; set `E2E_NEWSLETTER_PAGE=/` for the homepage, otherwise its isolated default is About.
- Final homepage artifacts: `test-results/newsletter-consent-confirmed-2026-11-17` (`.last-run.json` passed).
- Additional real About journey: `test-results/newsletter-consent-about-verified-2026-11-17`.
- Backup/schema/business-hash/QA-state evidence: `test-results/newsletter-integrity-2026-11-17.json`.
- Backend suite: `C:/laragon/www/ts/transportseva-api/tests/Feature/NewsletterConsentTest.php`.
- Delivery/consent/rollback notes: [Newsletter operations](../deployment/NEWSLETTER_OPERATIONS.md).

Next separate work: address homepage/API latency, then replace the blocked Admin Newsletter Subscribers prototype with an explicitly authorized real queue while retaining proof-based re-subscription.
