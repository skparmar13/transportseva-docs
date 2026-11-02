import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { ApiClientService, ApiEnvelope } from './api-client.service';

export type SupportStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type SupportCategory = 'account' | 'fleet' | 'marketplace' | 'payments' | 'tracking' | 'other';
export type SupportPriority = 'low' | 'medium' | 'high';
export interface SupportDraft { submission_id: string; subject: string; category: SupportCategory; priority: SupportPriority; message: string; }
export interface SupportRow { uuid: string; reference: string; subject: string; category: SupportCategory; priority: SupportPriority; status: SupportStatus; version: number; created_at: string; updated_at: string; }
export interface SupportEvent { uuid: string; version: number; actor_name: string; actor_role: string; type: 'created' | 'reply' | 'assigned' | 'status'; message: string; from_status: SupportStatus | null; status: SupportStatus; assigned_name: string | null; created_at: string; }
export interface SupportDetail {
  ticket: SupportRow & { owner_name: string; assigned_name: string | null; assigned_to_uuid: string | null; resolved_at: string | null };
  events: SupportEvent[]; history: { has_more: boolean; before: number | null };
  capabilities: { reply: boolean; manage: boolean; assign: boolean };
}
export interface SupportAction { operation_id: string; version: number; message: string; status?: SupportStatus; assigned_to_uuid?: string | null; }
export type SupportActionKind = 'replies' | 'assignment' | 'status';
@Injectable({ providedIn: 'root' })
export class ApiSupportTicketService {
  private readonly api = inject(ApiClientService);
  list(page = 1, status: SupportStatus | 'all' = 'all', reference = '') {
    return this.api.get<SupportRow[]>('support-tickets', { page, per_page: 25, ...(status === 'all' ? {} : { status }), ...(reference ? { reference } : {}) }).pipe(map((r) => {
      if (!r.success || !Array.isArray(r.data)) throw new Error('Invalid support ticket list');
      return { rows: r.data, page: r.meta?.current_page ?? 1, lastPage: r.meta?.last_page ?? 1, total: r.meta?.total ?? 0, scope: String(r.meta?.['scope'] ?? 'own') };
    }));
  }
  get(uuid: string, before?: number) { return this.api.get<SupportDetail>('support-tickets/' + uuid, before ? { before } : {}).pipe(map((r) => this.detail(r))); }
  create(draft: SupportDraft) { return this.api.post<SupportDetail>('support-tickets', draft).pipe(map((r) => this.detail(r))); }
  action(uuid: string, kind: SupportActionKind, payload: SupportAction) {
    const path = 'support-tickets/' + uuid + '/' + kind;
    return (kind === 'status' ? this.api.patch<SupportDetail>(path, payload) : this.api.post<SupportDetail>(path, payload)).pipe(map((r) => this.detail(r)));
  }
  assignees() { return this.api.get<{ uuid: string; name: string }[]>('support-tickets/assignees').pipe(map((r) => { if (!r.success || !Array.isArray(r.data)) throw new Error('Invalid Support Agent list'); return r.data; })); }
  private detail(r: ApiEnvelope<SupportDetail>): SupportDetail {
    if (!r.success || !r.data?.ticket?.uuid || !Number.isInteger(r.data.ticket.version) || !Array.isArray(r.data.events) || !r.data.capabilities || !r.data.history) throw new Error('Invalid support ticket details');
    return r.data;
  }
}
