import { BookingLifecycle } from '../../../core/models/booking-lifecycle.model';

export function lifecycleFixture(): BookingLifecycle {
  return { trip: { status: 'delivered', blocked_by_dispute: false, delivered_at: '2026-11-27T10:00:00Z' }, pod: { status: 'approved', reviewed_at: '2026-11-27T11:00:00Z' },
    freight: { status: 'fully_confirmed', allocation: 'gross', basis: 17000, confirmed: 17000, awaiting_confirmation: 0, disputed: 0, unpaid: 0, available_to_report: 0 },
    platform_fees: { owner: { amount: 1003, status: 'collection_not_recorded' }, provider: { amount: 1003, status: 'collection_not_recorded' }, admin_decision: null },
    tokens: { owner: { amount: 1000, status: 'paid', admin_decision: null }, provider: { amount: 1000, status: 'paid', admin_decision: null } }, legacy_settlement: null };
}
