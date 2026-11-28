import { Injectable, inject } from '@angular/core';
import { map, timeout } from 'rxjs';
import { ApiClientService } from './api-client.service';
export type FleetEvidenceKind = 'vehicle' | 'driver' | 'booking_vehicle';
export interface EvidenceFile { name: string | null; mime: string | null; size: number | null; declared_valid_until: string | null; exception_requested: boolean; reason: string | null; has_file: boolean }
export interface EvidenceVersion {
  uuid: string; asset_type: FleetEvidenceKind; asset_uuid: string; version: number; status: 'pending' | 'approved' | 'rejected' | 'revoked'; fingerprint: string;
  subject: Partial<Record<string, string | number>>; documents: Record<string, EvidenceFile>; submitted_at: string; reviewed_at: string | null; revoked_at: string | null; revocation_note: string | null;
  review: { method: string; note: string; evidence_reference: string; documents?: Record<string, { valid_until: string | null; exempt: boolean; reason: string | null }>; verified_payload_tons?: number; gvw_kg?: number; unladen_kg?: number; vehicle_type?: string; vehicle_types?: string[] } | null;
  owner_name?: string;
}
export interface AssetEvidence { current: EvidenceVersion | null; subject: Record<string, string | number>; keys: string[]; history: EvidenceVersion[] }
export interface DispatchChecks {
  transport_documents?:import('./api-transport-document.service').TransportDocumentReference[];
  pickup_weighbridge_kg?:number|null;
  booking_uuid: string; ready: boolean; evaluation_date: string; load_weight_kg: number | null; permitted_payload_kg: number | null; issues: string[];
  vehicle: { asset_type: FleetEvidenceKind; asset_uuid: string | null; ready: boolean; version: number | null; documents: Record<string, { valid_until: string | null; exempt: boolean }> };
  driver: { asset_type: FleetEvidenceKind; asset_uuid: string | null; ready: boolean; version: number | null; documents: Record<string, { valid_until: string | null; exempt: boolean }> };
  departure_record: { checked_at: string; vehicle_version: number; driver_version: number; permitted_payload_kg: number; load_weight_kg: number; operator_attested: boolean; transport_documents?:import('./api-transport-document.service').TransportDocumentReference[] } | null;
  trip_already_started: boolean;
  legacy_driver_link_required?: boolean; legacy_driver_name?: string;
}
@Injectable({ providedIn: 'root' })
export class ApiFleetComplianceService {
  private readonly api = inject(ApiClientService);
  get(kind: FleetEvidenceKind, id: string) { return this.api.get<AssetEvidence>(`fleet-compliance/${kind}/${id}`).pipe(timeout(30000), map(r => r.data)); }
  submit(kind: FleetEvidenceKind, id: string, body: FormData) { return this.api.post<EvidenceVersion>(`fleet-compliance/${kind}/${id}`, body).pipe(timeout(60000), map(r => r.data)); }
  queue(status: string, page = 1) { return this.api.get<{ rows: EvidenceVersion[]; page: number; last_page: number; total: number }>('admin/marketplace-kyc/assets', { status, page }).pipe(timeout(30000), map(r => r.data)); }
  item(id: string) { return this.api.get<EvidenceVersion>(`admin/marketplace-kyc/assets/${id}`).pipe(timeout(30000), map(r => r.data)); }
  review(id: string, body: unknown) { return this.api.post<EvidenceVersion>(`admin/marketplace-kyc/assets/${id}/review`, body).pipe(timeout(30000), map(r => r.data)); }
  revoke(id: string, body: unknown) { return this.api.post<EvidenceVersion>(`admin/marketplace-kyc/assets/${id}/revoke`, body).pipe(timeout(30000), map(r => r.data)); }
  download(id: string, key: string) { return this.api.getBlob(`fleet-compliance/${id}/document/${key}`).pipe(timeout(30000)); }
  checks(id: string) { return this.api.get<DispatchChecks>(`marketplace-bookings/${id}/dispatch-checks`).pipe(timeout(30000), map(r => r.data)); }
  linkDriver(id: string, driverUuid: string, note: string) { return this.api.post<import('./api-marketplace.service').ApiMarketplaceBooking>(`marketplace-bookings/${id}/dispatch-driver-link`,{ driver_uuid: driverUuid, note }).pipe(timeout(30000),map(r => r.data)); }
}
