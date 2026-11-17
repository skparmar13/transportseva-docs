# Homepage current-load preview — 17/11/2026

Completed the next open homepage reliability item. Previously, pending and
failed public-load reads both became an empty array, showing the same no-match
message as a successful filtered result. There was no retry action.

## Result

- A pending read shows a labelled loading state and animated spinner. Filter
  controls are disabled until a usable response arrives. Reduced-motion users
  receive a static indicator.
- A failed request shows an error and explicit Try again action. A stalled read
  times out after 30 seconds and is cancelled. A retry shows loading immediately;
  repeated clicks cannot start another read while one is pending.
- A successful empty feed says no open loads are currently available. A populated
  feed with no filter matches offers Clear filters instead.
- Retry preserves source, destination, vehicle type and preview-limit values.
  Clearing filters does not make another API request or change the 10/20 limit.
- Copy explains that city/vehicle filters apply to the preview of up to 20
  recent public loads, rather than implying a search across the marketplace.
- Failed or malformed API envelopes are rejected by the recent-load adapter.
  Valid decimal budgets retain the existing normalization behavior.
- English and Hindi states and explicit accessible dropdown names are included.
  Navigating away cancels a pending read.

No backend source, schema, configuration or business records were changed.
No users, loads, applications or bookings were created; no login credentials
were required. Backend mode never substitutes prototype loads for an API
failure. Explicit prototype-mode behavior remains unchanged. The homepage
remains classified as mixed: marketing figures and partner content were outside
this repair.

## Executed checks

| Check | Result |
| --- | --- |
| Focused homepage/API tests | 27 passed |
| Full Angular regression suite | **427 passed**, including 10 new cases |
| Source-audit consistency | 15 passed |
| Production browser/SSR build | Passed; 11 static routes prerendered |
| Headed Chrome acceptance | **4 passed**, final run 12.8 seconds |
| Source diff whitespace check | Passed |

The build retains the existing 500 kB initial-bundle warning: 954.37 kB versus
the unchanged 1 MB error limit. This task does not certify production capacity.

## Visible browser flow

| Flow | Evidence type | Result |
| --- | --- | --- |
| Hold public-load request, observe spinner/disabled filters and reduced motion | Explicit browser-only delay | Passed |
| Return 503, observe error, click Retry twice while pending | Explicit browser-only failure | One retry request; passed |
| Release retry to the real local API, display actual reference/city and re-enable filters | **Real API response** | Passed |
| Successful empty feed in Hindi, with no invented rows | Explicit browser-only empty response | Passed |
| Show 10/20 rows, filter city/type/destination, then clear all filters without refetch | 20 explicitly labelled browser-only records | Passed |
| HTTP 200 with `success: false` must show an error | Explicit browser-only invalid envelope | Passed |

The recovery case returned existing load `LD-000022`, UUID
`413fd095-4b3b-4908-9f77-9d61d1d3a94f`, as its first real record. This was a read
of an existing QA load, not a newly executed marketplace booking journey.
All browser contexts restricted traffic to local hosts and denied non-read
requests. Their blocked-write arrays remained empty.

Initial browser attempts exposed implicit dropdown names that included option
text; explicit label associations fixed that accessibility issue. The test was
also corrected for Angular-scoped keyframe names and made to wait for hydrated
feed records before scrolling. The final full browser run passed with no retries
or skipped cases.

## Reproduce

With the existing frontend on port 4300 and API on port 8080:

```powershell
npm.cmd run test:ci -- --reporters=dots
node --test audit/screen-source-audit.test.mjs
npm.cmd run build
npx.cmd playwright test e2e/home-load-preview.spec.ts --headed --output=test-results/home-load-preview-verified-2026-11-17 --reporter=list
```

Final local browser status and four screenshots are under
`test-results/home-load-preview-verified-2026-11-17`. Screenshots show loading,
error, actual API recovery and filter recovery. Generated test artifacts can be
replaced by later runs; this report preserves their outcome and scope.
