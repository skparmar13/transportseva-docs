# Truck Owner Reports — 04/11/2026

## Delivered

Truck Owner Reports now reads only the signed-in provider's real marketplace
records. It has separate views for applications sent and provider bookings,
with independent India-time creation-date cohorts, current status breakdowns,
search, pagination, safe record links and complete matching CSV exports.

Applications keep the proposed vehicle separate from the actual vehicle
assigned to a booking. Booking rows use canonical live load ownership and do
not expose owner identifiers, driver phone numbers, storage paths or financial
amounts. A linked conversion is counted only when the application, provider,
load and shipper match and the booking is not cancelled.

The shared report helpers provide Asia/Kolkata date formatting, inclusive date
filters, RFC-compatible UTF-8 CSV, spreadsheet-formula neutralisation and an
explicit 10,000-row export limit. The existing Shipper report query was also
corrected to select the booking owner needed for valid canonical load metadata.

## Validation

- Backend feature suite: 50 passing tests, 610 assertions, covering ownership,
  cohorts, malformed filters, linked conversion, deleted/damaged references,
  CSV safety and bounded exports.
- Angular unit suite: 320 passing tests.
- Production build: passed.
- Visible Chrome regression: six read-only scenarios passed across the final
  run and authorization retry: provider scope, pagination, links, exports,
  privacy, unauthorized access, loading/retry, invalid dates, no-match,
  Hindi and narrow layouts.
- Browser network guards permitted only authentication lifecycle requests and
  GET/HEAD/OPTIONS. No marketplace business write was made.

The original port 4300 development server was no longer running and the only
remaining Angular listener served a different route setup. Verification used a
separate current-source listener on port 4300 without stopping that process.

## QA records used

- Primary Truck Owner: `verify-truck-owner-1793028294862-62@transportseva.test`
- Secondary Truck Owner: `verify-truck-owner-1793028294862-63@transportseva.test`
- Shipper authorization check:
  `verify-shipper-1793028294862-61@transportseva.test`
- Existing canonical booking checked through report links:
  `TS-KOQKWAZAA8` (`5c18b398-8a75-4017-9ecf-e268282a4852`).

Passwords and access tokens are intentionally not recorded here.
