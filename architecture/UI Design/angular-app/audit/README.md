# Screen data-source audit

This is a diagnostic inventory, not a production-readiness badge.
Application behavior and backend permissions are not changed by these tools.

Run from the Angular workspace:

    node audit/screen-source-audit.test.mjs
    node audit/screen-source-audit.mjs --emit

The four in-process Node checks avoid the extra subprocess required by node
--test on restricted Windows sessions. No extra package is installed.

The source audit parses Angular routes using the installed TypeScript compiler,
selects the backend-enabled branch, maps each active component to a reviewed
assessment and verifies its evidence anchor still exists. An unreviewed component,
unsupported dynamic route or stale anchor fails rather than being labelled ready.
It also inventories planned/missing sidebar links and inactive route branches.
Each generated screen record includes a component SHA256 so the inspected source
version can be distinguished from later implementation changes.

Generated local artifacts:

- test-results/screen-audit-2026-10-31/source-inventory.json
- test-results/screen-audit-2026-10-31/source-inventory.csv

The classification is manual source review supported by parsing, not a guess
based on a service containing the word Mock. For example, notifications use real
APIs through CommunicationMockService, while tickets in that same service do not.
API-connected means a source-level backend integration exists; it does not prove
every action, role, error path or external provider is working.

Browser observations are collected separately in visible Chrome using existing
local QA accounts. Business POST/PUT/PATCH/DELETE and non-local hosts are blocked
before any diagnostic form action. Only normal login/refresh/logout session
operations are permitted. GET data, source files and backend permissions remain
unchanged. Local browser-only drafts/subscriptions are discarded with test contexts.

After generating the inventory, run the dedicated diagnostic configuration:

    npx playwright test --config=playwright.audit.config.ts --headed

For a compact summary after choosing the JSON reporter/output file:

    node audit/summarize-browser-audit.mjs test-results/screen-audit-browser-final-2026-10-31.json --emit

Ordinary Playwright regression runs explicitly exclude this collector. It uses
the local application on ports 4300/8080 and never mints an impersonation token,
changes a stored password, creates a user or assigns a new role to gain coverage.

Diagnostic collections must remain separate from ordinary regression tests:
they can successfully collect an observation of an unfinished feature. A passing
collection must never be reported as that feature being complete.

Current findings and the next implementation order are documented in
[the dated audit report](../e2e/SCREEN_AUDIT_2026-10-31.md).
