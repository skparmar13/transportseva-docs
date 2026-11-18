import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { ApiClientService } from './api-client.service';

export type ConsentStatus = 'pending' | 'subscribed' | 'unsubscribed';
export interface NewsletterSubscriberRow {
  uuid: string; email: string; status: ConsentStatus; consent_version: string | null;
  created_at: string; confirmed_at: string | null; unsubscribed_at: string | null;
}
export interface ConsentSummary { total: number; pending: number; subscribed: number; unsubscribed: number; }
export interface NewsletterHistoryRow {
  uuid: string; consent_version: string; delivery_status: 'requested' | 'sending' | 'sandbox' | 'sent' | 'unavailable';
  created_at: string; expires_at: string; confirmed_at: string | null;
}
export interface NewsletterDetail {
  subscriber: NewsletterSubscriberRow; requests: NewsletterHistoryRow[];
  history: { page: number; last_page: number; total: number };
}
const count = (n: unknown): n is number => Number.isSafeInteger(n) && (n as number) >= 0;
const row = (value: NewsletterSubscriberRow) => !!value && typeof value.uuid === 'string'
  && typeof value.email === 'string' && ['pending', 'subscribed', 'unsubscribed'].includes(value.status) && !!value.created_at;
const pagination = (page: unknown, last: unknown, total: unknown) => count(page) && page > 0 && count(last) && last > 0 && count(total);

@Injectable({ providedIn: 'root' })
export class ApiNewsletterAdminService {
  private readonly api = inject(ApiClientService);
  list(page: number, status: ConsentStatus | 'all', email: string) {
    return this.api.get<NewsletterSubscriberRow[]>('admin/newsletter/subscribers', { page, per_page: 25,
      ...(status === 'all' ? {} : { status }), ...(email ? { email } : {}) }).pipe(map(r => {
      const summary = r.meta?.['summary'] as ConsentSummary | undefined;
      if (!r.success || !Array.isArray(r.data) || !r.data.every(row)
        || !pagination(r.meta?.current_page, r.meta?.last_page, r.meta?.total)
        || !summary || ![summary.total, summary.pending, summary.subscribed, summary.unsubscribed].every(count)
        || summary.total !== summary.pending + summary.subscribed + summary.unsubscribed) throw new Error('Invalid newsletter list');
      return { rows: r.data, page: r.meta!.current_page!, lastPage: r.meta!.last_page!, total: r.meta!.total!, summary };
    }));
  }
  detail(uuid: string, page: number) {
    return this.api.get<NewsletterDetail>('admin/newsletter/subscribers/' + encodeURIComponent(uuid), { page }).pipe(map(r => {
      const d = r.data;
      if (!r.success || !d || !row(d.subscriber) || d.subscriber.uuid !== uuid || !Array.isArray(d.requests)
        || !d.requests.every(q => !!q && typeof q.uuid === 'string' && typeof q.consent_version === 'string'
          && ['requested', 'sending', 'sandbox', 'sent', 'unavailable'].includes(q.delivery_status) && !!q.created_at && !!q.expires_at)
        || !pagination(d.history?.page, d.history?.last_page, d.history?.total)) throw new Error('Invalid newsletter history');
      return d;
    }));
  }
}
