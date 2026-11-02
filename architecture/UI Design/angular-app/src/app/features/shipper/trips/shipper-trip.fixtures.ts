import { ShipperTripDetail, ShipperTripList } from '../../../core/api/api-shipper-trip.service';

const uuid = '12345678-1234-1234-1234-123456789012';
export const tripDetailFixture: ShipperTripDetail = {
  trip: { uuid, reference: 'TS-QA-REAL', load_uuid: uuid, load_reference: 'LD-QA-REAL', pickup_city: 'Delhi', drop_city: 'Jaipur', material: 'QA Goods', pickup_date: '2026-11-01', status: 'completed', stage: 'delivered', vehicle: 'QATRIP1234', driver: 'Stored QA Driver', started_at: '2026-10-30T10:00:00Z', delivered_at: '2026-10-31T10:00:00Z', pod_status: 'approved', created_at: '2026-10-29T10:00:00Z', updated_at: '2026-10-31T10:00:00Z', pickup_address: 'QA pickup address', drop_address: null, weight_tons: '16.00', vehicle_type_required: '32ft Trailer', agreed_freight: '17000.00', assignment_mode: 'Own Fleet', driver_phone: null, provider_name: 'QA Provider' },
  timeline: [{ stage: 'booking_created', occurred_at: '2026-10-29T10:00:00Z' }, { stage: 'trip_started', occurred_at: '2026-10-30T10:00:00Z' }, { stage: 'delivered', occurred_at: '2026-10-31T10:00:00Z' }],
  pod: { status: 'approved', number: 'POD-QA-REAL', received_by: 'QA Receiver', remarks: '<script>escaped only</script>', file_name: 'original.pdf', uploaded_at: '2026-10-31T10:30:00Z', reviewed_at: null, review_note: null, download_available: true },
  generated_at: '2026-11-01T10:00:00Z',
};
export const tripListFixture: ShipperTripList & { page: number; lastPage: number; matching: number } = {
  rows: [tripDetailFixture.trip], totals: { total: 9, awaiting: 1, planned: 3, active: 1, delivered: 2, paused: 1, cancelled: 1, other: 0, pod_outstanding: 1 }, generated_at: '2026-11-01T10:00:00Z', page: 1, lastPage: 1, matching: 1,
};
