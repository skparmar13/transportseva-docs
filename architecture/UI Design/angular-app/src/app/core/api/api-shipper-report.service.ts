import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { ApiClientService } from './api-client.service';
import { SHIPPER_TRIP_STAGES, ShipperTripStage, TripPodStatus } from './api-shipper-trip.service';

export const REPORT_LOAD_STATUSES = ['open', 'applications_received', 'booked', 'closed', 'cancelled', 'other'] as const;
export type ReportLoadStatus = typeof REPORT_LOAD_STATUSES[number];
export type ReportTable = 'loads' | 'bookings';
export interface ReportRequest { table: ReportTable; from?: string | null; to?: string | null; q?: string; }
export interface ReportLoadRow {
  uuid: string; reference: string; pickup_city: string | null; drop_city: string | null; material: string | null;
  status: ReportLoadStatus; applications: number; pending_applications: number; bookings: number; created_at: string | null;
}
export interface ReportBookingRow {
  uuid: string; reference: string; load_uuid: string | null; load_reference: string | null;
  pickup_city: string | null; drop_city: string | null; stage: ShipperTripStage; vehicle: string | null; driver: string | null;
  pod_status: TripPodStatus; created_at: string | null; started_at: string | null; delivered_at: string | null;
}
export interface ShipperReport {
  table: ReportTable; filters: { from: string | null; to: string | null; q: string; timezone: 'Asia/Kolkata'; basis: 'created_at' };
  summary: {
    loads: { total: number; applications: number; pending_applications: number; with_booking: number; statuses: Record<ReportLoadStatus, number> };
    bookings: { total: number; stages: Record<ShipperTripStage, number>; approved_pods: number; delivered_without_approved_pod: number };
  };
  rows: (ReportLoadRow | ReportBookingRow)[]; generated_at: string;
}
export interface ShipperReportPage extends ShipperReport { page: number; lastPage: number; matching: number; }
@Injectable({ providedIn: 'root' })
export class ApiShipperReportService {
  private readonly api = inject(ApiClientService);
  list(filters: ReportRequest, page = 1) {
    return this.api.get<ShipperReport>('account/reports', { ...this.params(filters), page, per_page: 20 }).pipe(map((r): ShipperReportPage => {
      const d = r.data; const s = d?.summary;
      if (!r.success || !d || d.table !== filters.table || !Array.isArray(d.rows) || !s
        || d.filters?.timezone !== 'Asia/Kolkata' || d.filters.basis !== 'created_at' || d.filters.q !== (filters.q?.trim() || '')
        || d.filters.from !== (filters.from || null) || d.filters.to !== (filters.to || null)
        || ![s.loads?.total, s.loads?.applications, s.loads?.pending_applications, s.loads?.with_booking,
          s.bookings?.total, s.bookings?.approved_pods, s.bookings?.delivered_without_approved_pod].every(this.count)
        || !REPORT_LOAD_STATUSES.every((key) => this.count(s.loads?.statuses?.[key]))
        || !SHIPPER_TRIP_STAGES.every((key) => this.count(s.bookings?.stages?.[key]))
        || !d.rows.every((row) => this.row(row, d.table)) || typeof d.generated_at !== 'string'
        || ![r.meta?.current_page, r.meta?.last_page, r.meta?.total].every(this.count) || !r.meta?.current_page || !r.meta.last_page) throw new Error('Invalid shipper report response');
      return { ...d, page: r.meta.current_page, lastPage: r.meta.last_page, matching: r.meta.total! };
    }));
  }
  export(filters: ReportRequest) { return this.api.getBlob('account/reports/export?' + new URLSearchParams(this.params(filters)).toString()); }
  private params(filters: ReportRequest): Record<string, string> {
    return { table: filters.table, ...(filters.from ? { from: filters.from } : {}), ...(filters.to ? { to: filters.to } : {}), ...(filters.q ? { q: filters.q } : {}) };
  }
  private count(value: unknown): value is number { return typeof value === 'number' && Number.isInteger(value) && value >= 0; }
  private row(row: ReportLoadRow | ReportBookingRow, table: ReportTable): boolean {
    if (!row || typeof row.reference !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(row.uuid)) return false;
    if (table === 'loads') {
      const l = row as ReportLoadRow; return REPORT_LOAD_STATUSES.includes(l.status) && [l.applications, l.pending_applications, l.bookings].every(this.count);
    }
    const b = row as ReportBookingRow;
    return SHIPPER_TRIP_STAGES.includes(b.stage) && ['not_submitted', 'pending_approval', 'approved', 'rejected'].includes(b.pod_status);
  }
}
