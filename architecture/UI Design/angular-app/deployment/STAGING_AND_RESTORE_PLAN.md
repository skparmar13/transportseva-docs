# Staging preparation and restore plan

Prepared locally on 30/10/2026. No staging host, domain or approved staging
database is available. No deployment or real SMS/email/payment/GPS test has
been performed. These are templates and gates, not production sign-off.

## Ordered launch gates

| Gate | Required evidence |
| --- | --- |
| Recovery | Local API and visible-browser tests, then approved real SMTP/SMS recipient tests |
| Delivery | Verified sender/domain, SPF/DKIM/DMARC, approved SMS template, secrets, TLS and failure monitoring |
| Infrastructure | Approved host/domain/DB, HTTPS, private storage, restricted DB/firewall, off-host backups, restore and rollback owners |
| Staff | Separately approve non-local enforcement, mappings, least-privilege Finance/Support scope and admin lockout recovery; current activation stays local-only |
| Dynamic screens | Inventory every route by role; connect or disable mock screens; test empty, error, loading and permission states, not just successful navigation |
| Money / GPS | Still excluded: real provider order/webhook/refund/payout reconciliation and authorized GPS/mobile tracking ingestion |
| Operations | Supervised queues/scheduler, health and failure alerts, dependency/security scans, retention policy and rollback rehearsal |

## Staging setup — operator review required, not executed

1. Provision separate database and storage with synthetic QA data. Never point
   staging at the existing transportseva database or copy personal data casually.
2. Review backend.staging.env.example and replace every placeholder through a
   secret store. Generate a unique APP_KEY per environment. Keep original keys
   securely with encrypted backups; never put them in reports.
3. Build immutable artifacts from reviewed backend/frontend revisions:
   composer install --no-dev --prefer-dist --optimize-autoloader;
   npm ci; npm run build. No secrets belong in Angular runtime configuration.
4. Point the backend web server at Laravel's public directory, not repository
   root. Protect .env, logs, backups and private KYC/POD files. Configure exact
   CORS origins and HTTPS. This project builds Angular SSR: review Node hosting
   and allowed SSR hosts explicitly rather than assuming static-only hosting.
5. Back up and inspect the target's migration history and planned SQL. Apply only
   reviewed additive migrations. Never use migrate:fresh, db:wipe, destructive
   seeders or unreviewed full-dump imports.
6. Supervise an auth worker:
   php artisan queue:work --queue=auth --tries=1 --timeout=30.
   Supervise default jobs and the scheduler separately. Recovery queue bodies
   are encrypted: worker and API must share that environment's APP_KEY.
   Monitor challenge delivery_status failures as well as failed_jobs.
7. Run php artisan auth:delivery-check (read-only). Its --production option also
   requires APP_ENV=production and safe delivery configuration. Configuration
   PASS is not proof of delivered messages, TLS negotiation, worker health or
   application-wide readiness.
8. After authorizing actual test recipients, test signup, resend, OTP expiry,
   provider failure, both recovery channels, notification visibility, old-session
   rejection and new-password login.
9. Run full role/route, marketplace and permission regression. Approve release
   only with explicit exclusions and no unlabelled mock success.

## Local non-destructive restore drill

Run deployment/restore-drill.ps1 in a reviewed PowerShell session.
Default mode inventories only: no files, databases or tables are created.
The -Execute switch enables a fresh export and isolated local restore.
Run restore-sql-guard.tests.ps1 first to check its non-mutating safety fixtures.
If Windows blocks unsigned local scripts, an operator may use a process-only
execution-policy allowance; do not change the machine's permanent policy.

The script uses the local MariaDB developer instance at 127.0.0.1 and its existing
root login, with no password in command arguments. It exports transportseva fresh
WITHOUT --databases and imports only into a new timestamp-labelled database.
It rejects existing targets, database-switching/destructive SQL, source-qualified
references, special SQL objects and non-InnoDB tables that need extra review.
It compares every table name, row count and EXTENDED checksum and detects source
changes during the drill. Target and private artifacts remain on success OR
failure. It never automatically drops a database/table or cleans up artifacts.

Do not import a historical --databases dump with a different database argument:
its embedded USE transportseva would override that argument.
Do not adapt the local developer drill into an unattended production import.

Database-only verification excludes uploaded POD/KYC files, key/secret recovery,
external services and application boot against the restored environment. A staging
drill must restore private files and keys into an isolated environment, disable
outbound/payment/GPS jobs, reconcile records and run the business smoke tests.

Reference guidance:
[OWASP recovery checklist](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)
and [Laravel mail documentation](https://laravel.com/framework/docs/13.x/mail).
