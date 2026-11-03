import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiClientService } from './api-client.service';

export interface ApiNotification {
  id: string;
  category?: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  action_url?: string | null;
  action_label?: string | null;
  read_at?: string | null;
  created_at?: string;
}
export interface NotificationPage { rows: ApiNotification[]; page: number; lastPage: number; total: number; unreadTotal: number; }

@Injectable({ providedIn: 'root' })
export class ApiNotificationsService {
  private readonly api = inject(ApiClientService);

  list(perPage = 50): Observable<ApiNotification[]> {
    return this.api.get<ApiNotification[] | { data?: ApiNotification[] }>('notifications', { per_page: perPage }).pipe(
      map(({ data }) => this.unwrap(data)),
    );
  }

  listUnread(perPage = 50): Observable<ApiNotification[]> {
    return this.api.get<ApiNotification[] | { data?: ApiNotification[] }>('notifications/unread', { per_page: perPage }).pipe(
      map(({ data }) => this.unwrap(data)),
    );
  }

  page(page = 1, unread = false, perPage = 20): Observable<NotificationPage> {
    return this.api.get<ApiNotification[]>('notifications' + (unread ? '/unread' : ''), { page, per_page: perPage }).pipe(map((r) => {
      const m = r.meta;
      if (!r.success || !Array.isArray(r.data) || !r.data.every((n) => typeof n.id === 'string' && typeof n.title === 'string' && typeof n.message === 'string')
        || !m?.current_page || !m.last_page || ![m.current_page,m.last_page,m.total,m['unread_total']].every((v) => Number.isInteger(v) && Number(v) >= 0)) throw new Error('Invalid notification page');
      return { rows: r.data, page: m.current_page, lastPage: m.last_page, total: m.total!, unreadTotal: m['unread_total'] as number };
    }));
  }
  markRead(id: string): Observable<unknown> {
    return this.api.patch<{id:string;read_at:string}>('notifications/' + encodeURIComponent(id) + '/read', {}).pipe(map((r) => {
      if (!r.success || r.data?.id !== id || typeof r.data.read_at !== 'string') throw new Error('Notification update was not confirmed');
      return r.data;
    }));
  }

  markAllRead(): Observable<unknown> {
    return this.api.patch<unknown>('notifications/read-all', {}).pipe(map((r) => { if (!r.success) throw new Error('Notification update was not confirmed'); return r.data; }));
  }

  private unwrap(data: ApiNotification[] | { data?: ApiNotification[] } | null | undefined): ApiNotification[] {

    return Array.isArray(data) ? data : (data?.data ?? []);
  }
}
