import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { ApiClientService } from './api-client.service';

export const ADMIN_METRICS = {
  marketplace: ['loads_total', 'open_loads', 'pending_applications', 'bookings_total', 'bookings_in_transit', 'bookings_delivered'],
  disputes: ['open_disputes'], reviews: ['pending_reviews'], kyc: ['pending_kyc'],
  support: ['open_support_tickets'], contact: ['new_contact_inquiries'], newsletter: ['pending_newsletter'], audit: [],
} as const;
export type AdminSection = keyof typeof ADMIN_METRICS;
export type AdminMetric = typeof ADMIN_METRICS[AdminSection][number];
export interface AdminDashboardActivity { uuid: string; action: string; category: 'Info' | 'Review' | 'Security'; target_uuid: string | null; created_at: string; }
export interface AdminDashboard {
  dashboard_type: 'admin'; generated_at: string; sections: AdminSection[];
  totals: Partial<Record<AdminMetric, number>>; recent_activity: AdminDashboardActivity[];
}
const uuid = (v: unknown): v is string => typeof v === 'string' && /^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(v);
const timestamp = (v: unknown): v is string => typeof v === 'string' && v.length > 0 && Number.isFinite(Date.parse(v));

@Injectable({ providedIn: 'root' })
export class ApiAdminDashboardService {
  private readonly api = inject(ApiClientService);
  get() {
    return this.api.get<AdminDashboard>('admin/dashboard').pipe(map(r => {
      const d = r.data;
      if (!r.success || d?.dashboard_type !== 'admin' || !timestamp(d.generated_at) || !Array.isArray(d.sections)
        || !d.sections.every(s => Object.hasOwn(ADMIN_METRICS, s)) || new Set(d.sections).size !== d.sections.length
        || !d.totals || Array.isArray(d.totals) || !Array.isArray(d.recent_activity)) throw new Error('Invalid operational dashboard');
      const keys = d.sections.flatMap(s => [...ADMIN_METRICS[s]]);
      if (Object.keys(d.totals).length !== keys.length || !keys.every(k => Number.isSafeInteger(d.totals[k]) && d.totals[k]! >= 0)
        || (d.sections.includes('disputes') && !d.sections.includes('marketplace'))
        || (!d.sections.includes('audit') && d.recent_activity.length) || d.recent_activity.length > 10
        || !d.recent_activity.every(e => e && uuid(e.uuid) && typeof e.action === 'string' && e.action.length > 0 && e.action.length <= 160
          && ['Info', 'Review', 'Security'].includes(e.category) && (e.target_uuid === null || uuid(e.target_uuid)) && timestamp(e.created_at))) throw new Error('Invalid operational totals or activity');
      return d;
    }));
  }
}
