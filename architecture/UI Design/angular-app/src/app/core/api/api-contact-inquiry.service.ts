import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { ApiClientService } from './api-client.service';

export type InquirySubject = 'general' | 'booking' | 'partnership' | 'billing';
export type InquiryStatus = 'new' | 'in_progress' | 'resolved' | 'spam';
export interface ContactDraft { full_name: string; email: string; phone: string; subject: InquirySubject; message: string; website: string; }
export interface InquiryReceipt { reference: string; received_at: string; }
export interface InquiryRow { uuid: string; reference: string; full_name: string; subject: InquirySubject; status: InquiryStatus; version: number; created_at: string; updated_at: string; }
export interface InquiryDetail { inquiry: InquiryRow & { email: string; phone: string; message: string; resolved_at: string | null }; updates: { uuid: string; actor_name: string; from_status: InquiryStatus; status: InquiryStatus; note: string; version: number; created_at: string }[]; }
@Injectable({ providedIn: 'root' })
export class ApiContactInquiryService {
  private readonly api = inject(ApiClientService);
  submit(payload: ContactDraft & { submission_id: string }) { return this.api.post<InquiryReceipt>('public/contact-inquiries', payload).pipe(map((r) => { if (!r.success || !/^CI-\d{8}-[A-Z0-9]{12}$/.test(r.data?.reference ?? '') || !r.data?.received_at) throw new Error('Invalid enquiry receipt'); return r.data; })); }
  list(page: number, status: InquiryStatus | 'all' = 'all', reference = '') { return this.api.get<InquiryRow[]>('admin/contact-inquiries', { page, per_page: 25, ...(status === 'all' ? {} : { status }), ...(reference ? { reference } : {}) }).pipe(map((r) => { if (!r.success || !Array.isArray(r.data)) throw new Error('Invalid enquiry list'); return { rows: r.data, page: r.meta?.current_page ?? 1, lastPage: r.meta?.last_page ?? 1, total: r.meta?.total ?? 0 }; })); }
  get(uuid: string) { return this.api.get<InquiryDetail>('admin/contact-inquiries/' + uuid).pipe(map((r) => this.detail(r))); }
  update(uuid: string, version: number, status: InquiryStatus, note: string) { return this.api.patch<InquiryDetail>('admin/contact-inquiries/' + uuid, { version, status, note }).pipe(map((r) => this.detail(r))); }
  private detail(r: { success: boolean; data: InquiryDetail }) { if (!r.success || !r.data?.inquiry?.uuid || !Number.isInteger(r.data.inquiry.version) || !Array.isArray(r.data.updates)) throw new Error('Invalid enquiry details'); return r.data; }
}
