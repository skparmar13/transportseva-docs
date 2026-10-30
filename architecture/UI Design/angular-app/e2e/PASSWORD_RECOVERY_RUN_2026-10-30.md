# Password recovery and local restore verification

Date: 30/10/2026, Asia/Calcutta.
Result: local implementation and verification complete for this step.
Real delivery and deployment remain deferred at the owner's request.

## Verified flow

| Step | Observed result |
| --- | --- |
| Actual signup UI | New labelled Shipper QA accounts created in transportseva, sandbox OTP verified, profile completed, dashboard opened |
| Request recovery by email/mobile | Real API challenge created, generic account-safe response, visible busy state and disabled duplicate submission |
| Invalid OTP | Rejected with a visible error; form remains usable |
| Correct OTP | Advances to new-password form; retrying the same valid verification returns the same short-lived proof before reset |
| Resend and expiry | 60-second resend cooldown; old challenge/proof invalidated on resend; 10-minute code and maximum 5-minute proof expiry tested |
| Invalid new password | Server strength/confirmation checks and UI mismatch feedback prevent the reset |
| Successful reset | Password hash changes; all previous JWT access/refresh sessions revoked; database security notification created |
| Replay or wrong proof | Rejected; successful reset proof cannot be reused |
| Login | Original and intermediate passwords rejected; final password opens the Shipper dashboard |
| Unknown/inactive account | Same generic request response; cannot verify or reset, even with a local debug code |
| Network/provider failure | Busy state clears, useful error shown; failed provider delivery cannot authorize reset |
| OTP secrecy | Recovery hashes stored, queue body encrypted, OTP SMS content/context redacted, production debug/sandbox paths blocked |
| Existing signup/MPIN routes | Shared request/verification throttles, including role-route aliases and phone-format variants |

Recovery no longer uses AuthMockService. Reset proof exists in memory only, not
URLs or browser storage. Successful reset does not silently authenticate a user.
English/Hindi recovery copy, paste/backspace support and reduced-motion-friendly
activity feedback are included.

## Executed checks

| Check | Result |
| --- | --- |
| Backend targeted suite | 40 passed, 308 assertions: PasswordRecoveryTest, SmsGatewayTest, SignupOtpVerificationTest, PlatformStaffPolicyTest |
| Angular suite | 119/119 passed in ChromeHeadless |
| Visible Chrome E2E | 3/3 passed twice; final run includes the completed OTP-throttling changes |
| Production Angular build | Passed; 11 prerendered routes; initial bundle 992.41 kB with the 500 kB warning still outstanding |
| Local delivery preflight | Passed application key, routes and recovery-table checks |
| Production delivery preflight | Correctly BLOCKED on local environment/debug/sandbox/sync queue/unconfigured real transports |
| Restore SQL guard | 15 safe/unsafe SQL fixtures passed without database writes |
| Target protection | Main database name and existing restore target refused |
| Database restore | 100/100 table names, row counts and EXTENDED checksums matched; source unchanged during drill |

An initial Angular countdown assertion needed its timer created inside fakeAsync;
an HTTP-provider rejection fixture needed an ordered fake response sequence.
Both were corrected and the final suites passed.

## QA credentials — local only

Both accounts are in the existing transportseva database, not a separate QA
database. Existing marketplace and staff passwords were not reset.

| Run | Email | Mobile | User UUID |
| --- | --- | --- | --- |
| Initial visible run | qa-recovery-1793376581721@transportseva.test | 6376581721 | 50f6d908-8978-4a42-b2d3-2caa60f8aee9 |
| Final visible run | qa-recovery-1793377725393@transportseva.test | 6377725393 | 28e6ac01-ca7b-4ad5-b4ec-eacca9eb4e8c |

Final password for either account: **RecoveryFinal@2026!**

Login page: http://localhost:4300/auth/login

These synthetic phone numbers are NOT authorized real SMS destinations. Never
carry these QA accounts/passwords into a production release. No loads, bookings,
payments or GPS records were created by this recovery test.

Private ignored evidence:
test-results/password-recovery-2026-10-30.json and
test-results/password-recovery-final-2026-10-30.json.
Browser traces/video were disabled for this suite to avoid retaining recovery
proofs, tokens or OTP request bodies.

## Backup and restore evidence

Before the additive migration, all 99 original base tables were backed up:

- File: .local-backups/transportseva-before-recovery-2026-10-30.sql
- Size: 855429 bytes
- SHA256: F868A2324831C268C70ECDCD58B99A9FC4ABE21C0D538B33DF21E2F54FD7A521
- Dump completion footer and 99 CREATE TABLE definitions verified.

The tested migration adds only password_reset_challenges, bringing the main
database to 100 base tables. No existing table was dropped or recreated.

The fresh post-migration export was actually imported and checked:

- Restored database retained: transportseva_restore_verify_20261030_215325
- File: .local-backups/transportseva_restore_verify_20261030_215325.sql
- Size: 856892 bytes
- SHA256: 6FDD4DB44AE9D47A6DE7F5E577AA0BE72FE621C04A05E40B4AF775635E6C4FDB
- All 100 table inventories, row counts and data checksums matched.
- The source database remained unchanged during the drill.
- An earlier export was rejected before import because the first guard treated
  email-domain data as a source-qualified SQL reference. The guard now inspects
  SQL outside escaped data literals; it still rejects actual cross-database SQL.
  That rejected export was retained; no target database was created for it.

This verifies the fresh 100-table database export, NOT restoration of the older
99-table pre-migration backup, nor file storage, secrets, remote staging or
application boot against the restored copy. It is a snapshot before the final
browser rerun, so the second QA account is not expected inside that restored copy.

## Deployment boundaries and next step

Local .env explicitly enables sandbox SMS/email and local debug OTPs. Production
responses cannot expose debug OTPs even if the flag is mistakenly set. Real
recovery delivery requires SMTP and a durable auth queue; log/array/failover-to-log
mail is refused. Generic HTTP SMS acceptance requires a successful response with
a non-empty message_id; that adapter contract still needs provider verification.

No real SMS/email, staging deployment, payment, payout, refund or GPS test was
performed. Password-change notification is currently in-app/database, not an
externally delivered security email/SMS. Those delivery checks remain launch gates.
Staff enforcement remains local-only; no broader staff rollout was enabled.

Next: role-by-role route/data-source audit to identify remaining mock/static
screens and prioritize their backend wiring, while provider/GPS work remains
deferred. Staging configuration and supervised queue/restore instructions are in
[the local preparation plan](../deployment/STAGING_AND_RESTORE_PLAN.md).
