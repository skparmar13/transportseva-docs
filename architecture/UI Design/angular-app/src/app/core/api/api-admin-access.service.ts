import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';

export type AuditCategory = 'Info' | 'Review' | 'Security';
export interface AdminActivityEvent {
  uuid: string; actor_uuid: string; actor_name: string; action: string; category: AuditCategory;
  target_type: string; target_uuid: string | null; target_label: string; created_at: string;
  before_state: Record<string, string | number | boolean | null>;
  after_state: Record<string, string | number | boolean | null>;
}
export interface StoredAdminRole {
  uuid: string; name: string; code: string; status: boolean;
  permissions: { uuid: string; name: string; slug: string; status: boolean }[];
}
export interface AdminPage<T> { data: T[]; meta: { current_page: number; last_page: number; total: number } }

@Injectable({ providedIn: 'root' })
export class ApiAdminAccessService {
  private readonly api = inject(ApiClientService);
  activity(page = 1, category?: AuditCategory, targetUuid?: string): Observable<AdminPage<AdminActivityEvent>> {
    return this.list<AdminActivityEvent>('admin/audit-events', { page, ...(category ? { category } : {}), ...(targetUuid ? { target_uuid: targetUuid } : {}) });
  }
  roles(page = 1): Observable<AdminPage<StoredAdminRole>> { return this.list<StoredAdminRole>('admin/access/roles', { page }); }
  private list<T>(path: string, filters: Record<string, string | number>): Observable<AdminPage<T>> {
    return this.api.get<T[]>(path, { per_page: 25, ...filters }).pipe(map((response) => ({
      data: response.data,
      meta: { current_page: response.meta?.current_page ?? 1, last_page: response.meta?.last_page ?? 1, total: response.meta?.total ?? response.data.length },
    })));
  }
}
