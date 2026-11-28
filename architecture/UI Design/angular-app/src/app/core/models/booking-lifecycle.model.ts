export interface BookingLifecycle {
  trip: { status: string; blocked_by_dispute: boolean; delivered_at: string | null };
  pod: { status: string; reviewed_at: string | null };
  freight: { status: string; allocation: string; basis: number; confirmed: number; awaiting_confirmation: number; disputed: number; unpaid: number; available_to_report: number };
  platform_fees: { owner: { amount: number | null; status: string }; provider: { amount: number | null; status: string }; admin_decision: string | null };
  tokens: { owner: LifecycleToken; provider: LifecycleToken };
  legacy_settlement: { status: string; recorded_at: string | null; is_receipt_evidence: false } | null;
}
export interface LifecycleToken { amount: number; status: string; admin_decision: string | null }
