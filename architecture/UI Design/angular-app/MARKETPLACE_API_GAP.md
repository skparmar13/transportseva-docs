# Marketplace API gap

The Angular prototype has two separate concepts:

- **Load**: a public/marketplace shipment posted by a shipper or transporter, with applications and negotiation.
- **Booking**: the accepted commercial agreement created after an application is accepted.

The current Laravel Booking module only exposes:

- `GET /api/bookings`
- `POST /api/bookings`
- `GET /api/bookings/{uuid}`
- `PUT /api/bookings/{uuid}`
- `DELETE /api/bookings/{uuid}`

It does **not** expose `/api/loads`. Its `BookingRequest` also requires `customer_uuid`, `booking_type`, and `total_fare`; pickup, drop and goods are separate domain requests. Therefore the Angular Post a Load form must not be wired to `/api/bookings`.

## Required marketplace contract

Add a dedicated load resource before enabling `API_CONFIG.useBackend` for marketplace screens:

- `GET /api/loads` with pickup, destination, vehicle type and pagination filters
- `POST /api/loads`
- `GET /api/loads/{uuid}`
- `PUT /api/loads/{uuid}`
- `POST /api/loads/{uuid}/applications`
- application and negotiation endpoints
- an accepted-application operation that creates a booking

The first load slice is now present in the Laravel Booking module with authenticated `GET/POST/PUT /api/loads` and `GET /api/loads/{uuid}` routes, a `loads` migration, validation request, model, resource and ownership-checked controller. Applications and negotiation remain intentionally separate follow-up work.

The current Angular adapter (`ApiMarketplaceService`) targets these routes and remains disabled by default. Before enabling it, run the migration and resolve the project-wide duplicate Sanctum/JWT module-route registration documented in the backend audit.
