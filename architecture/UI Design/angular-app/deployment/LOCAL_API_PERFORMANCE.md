# Local API performance and restart instructions

Verified on 17/11/2026 with Windows PowerShell and Laragon PHP 8.3.3.
The local PHP CLI did not load OPcache; repeated Laravel bootstrap dominated
request latency. The launcher enables the installed matching OPcache extension
for its own process. It does not change global `php.ini` or build Laravel caches.

## Start and stop

Run from the Angular application directory:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\deployment\local-api.ps1 -Port 8080
```

The default backend is the sibling `transportseva-api` project. Optional
`-BackendRoot` and `-PhpBinary` arguments select another installation explicitly.
The launcher binds to `127.0.0.1`, warms three public reads and writes its process
identity and log paths under `.local-runtime/api/port-8080.json`. This directory
is Git-ignored and survives Playwright output cleanup. The Angular frontend
continues to use `http://localhost:8080`.

Stop only a server owned by this launcher:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\deployment\local-api.ps1 -Port 8080 -Stop
```

An occupied port is refused. The stop command requires a matching PID, creation
time, PHP executable, backend root, router and port. If an earlier manually
started server owns the port, stop it through its existing terminal or manager
before starting this launcher. Do not delete the ownership record while its
server is running. Execution-policy bypass applies only to the invoked process.

## Source changes remain visible

The process uses `opcache.validate_timestamps=1` and
`opcache.revalidate_freq=0`, which checks source timestamps on every request.
See the [PHP configuration reference](https://www.php.net/manual/en/opcache.configuration.php).
The integration harness verifies that an actually cached PHP fixture changes
from version 1 to version 2 without restarting its worker.

This caches PHP bytecode. It does not cache API responses, user identities or
database records. No application controller, schema or business data was changed
for this performance fix.

## Repeat verification

With the main API running, measure five sequential reads per endpoint:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\deployment\measure-local-api.ps1 -Samples 5
npx.cmd playwright test e2e/home-api-performance.spec.ts --headed --output=test-results/home-api-performance --reporter=list
```

The benchmark accepts only a plain loopback HTTP origin and writes timings under
`test-results/local-api`. The browser suite uses two existing local QA accounts;
it permits authentication bookkeeping and blocks business writes. Optional
`E2E_API_CONTROL_URL` compares public data with a separately started local control
server; it is unnecessary for normal verification.

To test launcher ownership and source freshness, use free ports 8087 and 8091:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\deployment\local-api.ps1 -Port 8087
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\deployment\local-api.tests.ps1
```

The successful harness stops its own test servers. If interrupted, use the
launcher stop command on 8087; inspect any standalone probe's recorded logs and
process identity before stopping it.

## Scope and rollback

Use this launcher after a local API restart to retain the improvement. Cold
startup still took approximately 2.7 seconds before warmup. The measured warm
public feeds averaged approximately 0.25 seconds on this machine; this is not a
production load test. Production PHP-FPM/Apache configuration requires its own
deployment validation; the PHP development server is for local work.

To revert locally, stop the owned process, then run the previous development
command from the backend directory:

```powershell
php artisan serve --port=8080
```

No database restore or global PHP configuration change is needed.
