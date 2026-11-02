import { ShipperReportPage } from '../../../core/api/api-shipper-report.service';
export const reportUuid = '5c18b398-8a75-4017-9ecf-e268282a4852';
export const reportFixture: ShipperReportPage = {
  table: 'loads', filters: { from: null, to: null, q: '', timezone: 'Asia/Kolkata', basis: 'created_at' },
  summary: {
    loads: { total: 1, applications: 2, pending_applications: 1, with_booking: 1, statuses: { open: 0, applications_received: 0, booked: 1, closed: 0, cancelled: 0, other: 0 } },
    bookings: { total: 1, stages: { awaiting: 0, planned: 0, active: 0, delivered: 1, paused: 0, cancelled: 0, other: 0 }, approved_pods: 1, delivered_without_approved_pod: 0 },
  },
  rows: [{ uuid: reportUuid, reference: 'RPT-QA-LOAD', pickup_city: 'Delhi', drop_city: 'Jaipur', material: '<script>escaped goods</script>',
    status: 'booked', applications: 2, pending_applications: 1, bookings: 1, created_at: '2026-10-30T18:30:00Z' }],
  generated_at: '2026-11-02T10:00:00Z', page: 1, lastPage: 1, matching: 1,
};
export const reportBookingFixture: ShipperReportPage = {
  ...reportFixture, table: 'bookings',
  rows: [{ uuid: reportUuid, reference: 'RPT-QA-BOOKING', load_uuid: reportUuid, load_reference: 'RPT-QA-LOAD',
    pickup_city: 'Delhi', drop_city: 'Jaipur', stage: 'delivered', vehicle: 'ACTUAL1234', driver: 'Stored QA Driver', pod_status: 'approved',
    created_at: '2026-10-31T10:00:00Z', started_at: null, delivered_at: null }],
};
