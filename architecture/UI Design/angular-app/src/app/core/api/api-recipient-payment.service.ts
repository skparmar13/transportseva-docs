import { Injectable, inject } from '@angular/core';
import { map, timeout } from 'rxjs';
import { ApiClientService } from './api-client.service';

export interface RecipientBank {
  uuid: string; version: number; holder_name?: string; account_mask?: string; ifsc?: string;
  bank_name?: string; status: 'pending' | 'manually_reviewed' | 'rejected'; review_method: string | null;
  review_note?: string | null; reviewed_at: string | null; submitted_at: string;
}
export interface FullRecipientBank { uuid: string; version: number; holder_name: string; account_number: string; ifsc: string; bank_name: string; status: string }
export interface BankSubmission { version: number; holder_name: string; account_number: string; account_number_confirmation: string; ifsc: string; bank_name: string; sharing_consent: boolean; current_password: string }
export type ReceiptMilestone = 'loading_advance' | 'mid_trip' | 'final';
export interface DirectReceipt {
  uuid: string; milestone: ReceiptMilestone; milestone_uuid: string | null; amount: string;
  transfer_date: string; reference: string; status: 'reported_by_payer' | 'confirmed_received' | 'disputed';
  decision_note: string | null; decided_at: string | null; created_at: string; account_mask: string; bank_version: number;
}
export interface DirectPaymentView {
  lifecycle?: import('../models/booking-lifecycle.model').BookingLifecycle;
  booking_uuid: string; booking_reference: string; side: 'payer' | 'recipient'; eligible: boolean;
  allocation: 'gross' | 'net' | 'unconfigured'; bank: RecipientBank | null;
  instruction: { version: number; bank_uuid: string; bank_version: number; current: boolean; acknowledged_at: string } | null;
  amounts: { recipient_basis: number; confirmed_received: number; awaiting_or_disputed: number; confirmed_unpaid: number; available_to_report: number; owner_fee: number; provider_fee: number };
  milestones: { uuid: string; amount: number; trigger: string }[]; allowed_milestones: ReceiptMilestone[];
  receipts: DirectReceipt[]; receipt_page: { current_page: number; last_page: number; total: number };
}
export interface ReceiptReport { amount: string; transfer_date: string; reference: string; milestone: ReceiptMilestone; milestone_uuid?: string; instruction_version: number; request_uuid: string }
export interface BankReviewRow { account: RecipientBank & { evidence_reference?: string | null; reviewed_by_uuid?: string | null }; provider: { name: string; email: string } }
@Injectable({ providedIn: 'root' })
export class ApiRecipientPaymentService {
  private readonly api = inject(ApiClientService);
  bank() { return this.api.get<{ account: RecipientBank | null }>('/account/recipient-bank').pipe(timeout(30_000), map(r => r.data.account)); }
  saveBank(d: BankSubmission) { return this.api.put<{ account: RecipientBank }>('/account/recipient-bank', d).pipe(timeout(30_000), map(r => r.data.account)); }
  queue(status: string, page: number) { return this.api.get<BankReviewRow[]>('/admin/recipient-bank-accounts', { status, page }).pipe(timeout(30_000)); }
  reviewBank(uuid: string, d: { version: number; decision: string; method: string; evidence_reference: string; note: string; current_password: string }) { return this.api.post<{ account: RecipientBank }>(`/admin/recipient-bank-accounts/${uuid}/review`, d).pipe(timeout(30_000)); }
  revealReview(uuid: string, current_password: string, reason: string) { return this.api.post<FullRecipientBank>(`/admin/recipient-bank-accounts/${uuid}/reveal`, { current_password, reason }).pipe(timeout(30_000), map(r => r.data)); }
  view(uuid: string, page = 1) { return this.api.get<DirectPaymentView>(`/marketplace-bookings/${uuid}/direct-payments`, { page }).pipe(timeout(30_000), map(r => r.data)); }
  acknowledge(uuid: string, bank_uuid: string, instruction_version: number, current_password: string) { return this.api.post<DirectPaymentView>(`/marketplace-bookings/${uuid}/bank-instructions`, { bank_uuid, instruction_version, current_password }).pipe(timeout(30_000), map(r => r.data)); }
  reveal(uuid: string, bank_uuid: string, instruction_version: number, current_password: string) { return this.api.post<FullRecipientBank>(`/marketplace-bookings/${uuid}/bank-instructions/reveal`, { bank_uuid, instruction_version, current_password }).pipe(timeout(30_000), map(r => r.data)); }
  report(uuid: string, d: ReceiptReport) { return this.api.post<DirectPaymentView>(`/marketplace-bookings/${uuid}/direct-payments`, d).pipe(timeout(30_000), map(r => r.data)); }
  decide(uuid: string, receipt: string, decision: 'confirmed_received' | 'disputed', note: string) { return this.api.post<DirectPaymentView>(`/marketplace-bookings/${uuid}/direct-payments/${receipt}/decision`, { decision, ...(note ? { note } : {}) }).pipe(timeout(30_000), map(r => r.data)); }
}
