import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { ApiClientService } from './api-client.service';

export const ADMIN_REPORT_STATES = {
  loads: ['open', 'applications_received', 'booked', 'closed', 'cancelled', 'other'],
  applications: ['pending', 'negotiating', 'accepted', 'rejected', 'withdrawn', 'other'],
  bookings: ['awaiting_deposit', 'confirmed', 'vehicle_assigned', 'driver_assigned', 'loading_completed', 'in_transit', 'completed', 'settlement_pending', 'settled', 'cancelled', 'disputed', 'other'],
} as const;
export type AdminReportTable = keyof typeof ADMIN_REPORT_STATES;
export interface AdminReportFilter { table: AdminReportTable; from: string | null; to: string | null; status: string; }
export interface AdminReportRow { date: string | null; status: string; records: number; }
export interface AdminReport {
  table: AdminReportTable; filters: Omit<AdminReportFilter, 'table'> & { timezone: 'Asia/Kolkata'; basis: 'created_at' };
  summary: { total: number; statuses: Record<string, number> }; rows: AdminReportRow[]; generated_at: string;
}
export interface AdminReportPage extends AdminReport { page: number; lastPage: number; matching: number; }
const count = (n: unknown): n is number => Number.isSafeInteger(n) && (n as number) >= 0;

@Injectable({ providedIn: 'root' })
export class ApiAdminReportService {
  private readonly api = inject(ApiClientService);
  list(filters: AdminReportFilter, page: number) {
    return this.api.get<AdminReport>('admin/reports', { ...this.params(filters), page, per_page: 25 }).pipe(map((r): AdminReportPage => {
      const d = r.data; const states: readonly string[] = ADMIN_REPORT_STATES[filters.table];
      if (!r.success || !d || d.table !== filters.table || !d.filters || d.filters.from !== filters.from || d.filters.to !== filters.to
        || d.filters.status !== filters.status || d.filters.timezone !== 'Asia/Kolkata' || d.filters.basis !== 'created_at'
        || !d.summary || !count(d.summary.total) || !d.summary.statuses || Object.keys(d.summary.statuses).length !== states.length
        || !states.every(s => count(d.summary.statuses[s])) || states.reduce((n, s) => n+d.summary.statuses[s], 0) !== d.summary.total
        || !Array.isArray(d.rows) || d.rows.length > 25 || !d.rows.every(row => row && (row.date === null || /^\d{4}-\d{2}-\d{2}$/.test(row.date))
          && states.includes(row.status) && (filters.status === 'all' || row.status === filters.status) && count(row.records) && row.records > 0)
        || !count(r.meta?.current_page) || !r.meta!.current_page || !count(r.meta?.last_page) || !r.meta!.last_page || !count(r.meta?.total)
        || typeof d.generated_at !== 'string' || !Number.isFinite(Date.parse(d.generated_at))) throw new Error('Invalid admin operational report');
      return { ...d, page: r.meta.current_page, lastPage: r.meta.last_page, matching: r.meta.total };
    }));
  }
  export(filters: AdminReportFilter) { return this.api.getBlob('admin/reports/export?'+new URLSearchParams(this.params(filters)).toString()); }
  private params(filters: AdminReportFilter): Record<string, string> {
    return { table: filters.table, status: filters.status, ...(filters.from ? { from: filters.from } : {}), ...(filters.to ? { to: filters.to } : {}) };
  }
}
