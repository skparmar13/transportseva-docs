import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { ApiClientService } from './api-client.service';
import { SHIPPER_TRIP_STAGES } from './api-shipper-trip.service';
import { ReportBookingRow } from './api-shipper-report.service';
export type { ReportBookingRow } from './api-shipper-report.service';
export const APPLICATION_STATUSES = ['pending', 'negotiating', 'accepted', 'rejected', 'withdrawn', 'other'] as const;
export type ApplicationStatus = typeof APPLICATION_STATUSES[number];
export type ReportTable = 'applications' | 'bookings';
export interface ReportRequest { table: ReportTable; from?: string | null; to?: string | null; q?: string; }
export interface ReportApplicationRow {
  uuid: string; reference: string; load_uuid: string | null; load_reference: string | null;
  pickup_city: string | null; drop_city: string | null; material: string | null; status: ApplicationStatus;
  proposed_vehicle: string | null; booking_uuid: string | null; created_at: string | null;
}
export interface TruckOwnerReportPage {
  table: ReportTable; filters: { from: string | null; to: string | null; q: string; timezone: 'Asia/Kolkata'; basis: 'created_at' };
  summary: {
    applications: { total: number; with_booking: number; statuses: Record<ApplicationStatus, number> };
    bookings: { total: number; stages: Record<typeof SHIPPER_TRIP_STAGES[number], number>; approved_pods: number; delivered_without_approved_pod: number };
  };
  rows: (ReportApplicationRow | ReportBookingRow)[]; generated_at: string; page: number; lastPage: number; matching: number;
}
@Injectable({ providedIn: 'root' })
export class ApiTruckOwnerReportService {
  private readonly api = inject(ApiClientService);
  list(filters: ReportRequest, page = 1) {
    return this.api.get<Omit<TruckOwnerReportPage, 'page' | 'lastPage' | 'matching'>>('account/truck-owner/reports', { ...this.params(filters), page, per_page: 20 }).pipe(map((r): TruckOwnerReportPage => {
      const d = r.data; const s = d?.summary;
      if (!r.success || !d || d.table !== filters.table || !Array.isArray(d.rows) || !s
        || d.filters?.timezone !== 'Asia/Kolkata' || d.filters.basis !== 'created_at' || d.filters.q !== (filters.q?.trim() || '')
        || d.filters.from !== (filters.from || null) || d.filters.to !== (filters.to || null)
        || ![s.applications?.total, s.applications?.with_booking, s.bookings?.total, s.bookings?.approved_pods, s.bookings?.delivered_without_approved_pod].every(this.count)
        || !APPLICATION_STATUSES.every((key) => this.count(s.applications?.statuses?.[key]))
        || !SHIPPER_TRIP_STAGES.every((key) => this.count(s.bookings?.stages?.[key]))
        || !d.rows.every((row) => this.row(row, d.table)) || typeof d.generated_at !== 'string'
        || ![r.meta?.current_page, r.meta?.last_page, r.meta?.total].every(this.count) || !r.meta?.current_page || !r.meta.last_page) throw new Error('Invalid truck owner report response');
      return { ...d, page: r.meta.current_page, lastPage: r.meta.last_page, matching: r.meta.total! };
    }));
  }
  export(filters: ReportRequest) { return this.api.getBlob('account/truck-owner/reports/export?' + new URLSearchParams(this.params(filters)).toString()); }
  private params(filters: ReportRequest): Record<string, string> {
    return { table: filters.table, ...(filters.from ? { from: filters.from } : {}), ...(filters.to ? { to: filters.to } : {}), ...(filters.q ? { q: filters.q.trim() } : {}) };
  }
  private count(value: unknown): value is number { return typeof value === 'number' && Number.isInteger(value) && value >= 0; }
  private uuid(value: unknown): boolean { return typeof value === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value); }
  private row(row: ReportApplicationRow | ReportBookingRow, table: ReportTable): boolean {
    if (!row || typeof row.reference !== 'string' || !this.uuid(row.uuid)) return false;
    if (table === 'applications') {
      const a = row as ReportApplicationRow;
      return APPLICATION_STATUSES.includes(a.status) && (a.load_uuid === null || this.uuid(a.load_uuid)) && (a.booking_uuid === null || this.uuid(a.booking_uuid));
    }
    const b = row as ReportBookingRow;
    return SHIPPER_TRIP_STAGES.includes(b.stage) && ['not_submitted', 'pending_approval', 'approved', 'rejected'].includes(b.pod_status);
  }
}
