import { Injectable, inject } from '@angular/core';
import { map, timeout } from 'rxjs';
import { ApiClientService } from './api-client.service';

export interface ConsignmentReference { uuid: string; consignment_uuid: string; version: number; number: string; document_type: 'LR' | 'GR'; fingerprint: string }
export interface ConsignmentVersion {
  uuid: string; consignment_uuid: string; booking_uuid: string; version: number; fingerprint: string;
  snapshot: { document_type: 'LR' | 'GR'; number: string; issue_date: string; financial_year: string; booking_reference: string; load_reference: string;
    issuer_name: string; issuer_address: string; issuer_gstin: string | null; consignor_name: string; consignor_address: string; consignor_gstin: string | null;
    consignee_name: string; consignee_address: string; consignee_gstin: string | null; origin: string; destination: string; goods: string;
    weight_tons: number; vehicle_registration: string; driver_name: string; package_count: number; package_unit: string;
    declared_goods_value: number | null; invoice_number: string | null; invoice_date: string | null; eway_bill_number: string | null;
    tax_liable_party: string; tax_liable_gstin: string | null; gross_freight: number; remarks: string | null; issued_after_departure: boolean };
  amendment_reason: string | null; scan_available: boolean; scan_name: string | null; recorded_at: string;
}
export interface ConsignmentView {
  current: ConsignmentVersion | null; history: ConsignmentVersion[]; can_issue: boolean; blocked_reason: string | null;
  context: { provider_name: string | null; origin: string | null; destination: string | null; goods: string | null; weight_tons: number | null; vehicle_registration: string | null; driver_name: string | null };
  pod_reference: ConsignmentReference | null; pod_recorded: boolean;
}
@Injectable({ providedIn: 'root' })
export class ApiConsignmentService {
  private readonly api = inject(ApiClientService);
  get(id: string) { return this.api.get<ConsignmentView>(`marketplace-bookings/${id}/consignment`).pipe(timeout(30000),map(r=>r.data)); }
  issue(id: string, body: FormData) { return this.api.post<ConsignmentVersion>(`marketplace-bookings/${id}/consignment`,body).pipe(timeout(60000),map(r=>r.data)); }
  list(page=1) { return this.api.get<{rows: ConsignmentVersion[];page:number;last_page:number;total:number}>('account/consignment-documents',{page}).pipe(timeout(30000),map(r=>r.data)); }
  download(booking: string, version: string, kind: 'document'|'scan') { return this.api.getBlob(`marketplace-bookings/${booking}/consignment/${version}/${kind}`).pipe(timeout(30000)); }
}
