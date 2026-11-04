import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { ApiClientService } from './api-client.service';

export const SHIPPER_TRIP_STAGES = ['awaiting', 'planned', 'active', 'delivered', 'paused', 'cancelled', 'other'] as const;
export type ShipperTripStage = typeof SHIPPER_TRIP_STAGES[number];
export type TripPodStatus = 'not_submitted' | 'pending_approval' | 'approved' | 'rejected';
export interface ShipperTripRow {
  uuid: string; reference: string; load_uuid: string | null; load_reference: string | null;
  pickup_city: string | null; drop_city: string | null; material: string | null; pickup_date: string | null;
  status: string; stage: ShipperTripStage; vehicle: string | null; driver: string | null;
  started_at: string | null; delivered_at: string | null; pod_status: TripPodStatus; created_at: string | null; updated_at: string | null;
}
export interface ShipperTripList {
  rows: ShipperTripRow[]; totals: Record<ShipperTripStage | 'total' | 'pod_outstanding', number>; generated_at: string;
}
export interface ShipperTripDetail {
  trip: ShipperTripRow & { pickup_address: string | null; drop_address: string | null; weight_tons: string | null; vehicle_type_required: string | null; agreed_freight: string | number | null; assignment_mode: string | null; driver_phone: string | null; provider_name: string | null; shipper_name?: string | null };
  timeline: { stage: 'booking_created' | 'vehicle_assigned' | 'driver_assigned' | 'loading_completed' | 'loading_confirmed' | 'trip_started' | 'delivered' | 'pod_uploaded' | 'pod_reviewed'; occurred_at: string | null }[];
  pod: { status: TripPodStatus; number: string | null; received_by: string | null; remarks: string | null; file_name: string | null; uploaded_at: string | null; reviewed_at: string | null; review_note: string | null; download_available: boolean };
  generated_at: string;
}
@Injectable({ providedIn: 'root' })
export class ApiShipperTripService {
  private readonly api = inject(ApiClientService);
  protected readonly resourcePath: string = 'account/trips';
  list(page = 1, stage: ShipperTripStage | 'all' = 'all', q = '') {
    return this.api.get<ShipperTripList>(this.resourcePath, { page, per_page: 20, stage, ...(q ? { q } : {}) }).pipe(map((r) => {
      if (!r.success || !Array.isArray(r.data?.rows) || !r.data?.totals || !r.data.generated_at
        || !r.data.rows.every((row) => this.row(row)) || !['total', 'pod_outstanding', ...SHIPPER_TRIP_STAGES].every((key) => Number.isInteger(r.data.totals[key as keyof ShipperTripList['totals']]) && r.data.totals[key as keyof ShipperTripList['totals']] >= 0)
        || !Number.isInteger(r.meta?.current_page) || !Number.isInteger(r.meta?.last_page) || !Number.isInteger(r.meta?.total)) throw new Error('Invalid trip history response');
      return { ...r.data, page: r.meta!.current_page!, lastPage: r.meta!.last_page!, matching: r.meta!.total! };
    }));
  }
  get(uuid: string) {
    return this.api.get<ShipperTripDetail>(this.resourcePath + '/' + encodeURIComponent(uuid)).pipe(map((r) => {
      if (!r.success || !this.row(r.data?.trip) || r.data.trip.uuid !== uuid || !Array.isArray(r.data.timeline) || !r.data.pod || typeof r.data.pod.download_available !== 'boolean' || !r.data.generated_at) throw new Error('Invalid trip detail response');
      return r.data;
    }));
  }
  downloadPod(uuid: string) { return this.api.getBlob('marketplace-bookings/' + encodeURIComponent(uuid) + '/pod/download'); }
  private row(row: ShipperTripRow | null | undefined): boolean { return !!row && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(row.uuid) && typeof row.reference === 'string' && SHIPPER_TRIP_STAGES.includes(row.stage); }
}
