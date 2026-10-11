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

  markRead(id: string): Observable<unknown> {
    return this.api.patch<unknown>(`notifications/${encodeURIComponent(id)}/read`, {});
  }

  markAllRead(): Observable<unknown> {
    return this.api.patch<unknown>('notifications/read-all', {});
  }

  private unwrap(data: ApiNotification[] | { data?: ApiNotification[] } | null | undefined): ApiNotification[] {
    return Array.isArray(data) ? data : (data?.data ?? []);
  }
}
