import { TruckOwnerReportPage } from '../../../core/api/api-truck-owner-report.service';
export const ownerReportUuid = '5c18b398-8a75-4017-9ecf-e268282a4852';
export const ownerReportFixture: TruckOwnerReportPage = {
  table: 'applications', filters: { from: null, to: null, q: '', timezone: 'Asia/Kolkata', basis: 'created_at' },
  summary: {
    applications: { total: 4, with_booking: 1, statuses: { pending: 2, negotiating: 1, accepted: 1, rejected: 0, withdrawn: 0, other: 0 } },
    bookings: { total: 1, stages: { awaiting: 0, planned: 0, active: 0, delivered: 1, paused: 0, cancelled: 0, other: 0 }, approved_pods: 1, delivered_without_approved_pod: 0 },
  },
  rows: [{ uuid: ownerReportUuid, reference: 'QA-OWN-APPLICATION', load_uuid: ownerReportUuid, load_reference: 'QA-OWN-LOAD',
    pickup_city: 'Delhi', drop_city: 'Jaipur', material: '<script>escaped material</script>', status: 'accepted',
    proposed_vehicle: 'PROPOSED123', booking_uuid: ownerReportUuid, created_at: '2026-10-30T18:30:00Z' }],
  generated_at: '2026-11-04T10:00:00Z', page: 1, lastPage: 1, matching: 1,
};
export const ownerBookingReportFixture: TruckOwnerReportPage = { ...ownerReportFixture, table: 'bookings', rows: [{
  uuid: ownerReportUuid, reference: 'QA-OWN-BOOKING', load_uuid: ownerReportUuid, load_reference: 'QA-OWN-LOAD', pickup_city: 'Delhi',
  drop_city: 'Jaipur', stage: 'delivered', vehicle: 'ACTUAL123', driver: 'Actual Driver', pod_status: 'approved',
  created_at: '2026-10-30T18:30:00Z', started_at: null, delivered_at: null,
}] };
