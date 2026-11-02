import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { ApiClientService } from './api-client.service';

export const POD_DOCUMENT_STATUSES = ['pending_approval', 'approved', 'rejected', 'other'] as const;
export type PodDocumentStatus = typeof POD_DOCUMENT_STATUSES[number];
export interface ShipperPodDocument {
  booking_uuid: string; booking_reference: string; load_uuid: string | null; load_reference: string | null;
  pickup_city: string | null; drop_city: string | null; status: PodDocumentStatus; number: string | null;
  received_by: string | null; file_name: string | null; uploaded_at: string | null; reviewed_at: string | null;
  review_note: string | null; download_available: boolean;
}
export interface ShipperKycDocument {
  uuid: string; business_name: string; status: 'pending' | 'approved' | 'rejected' | 'other';
  file_name: string | null; submitted_at: string | null; reviewed_at: string | null;
  review_note: string | null; download_available: boolean;
}
export interface ShipperDocuments {
  pods: ShipperPodDocument[]; kyc: ShipperKycDocument | null;
  totals: Record<PodDocumentStatus | 'total', number>; generated_at: string;
}
@Injectable({ providedIn: 'root' })
export class ApiShipperDocumentService {
  private readonly api = inject(ApiClientService);
  list(page = 1, status: PodDocumentStatus | 'all' = 'all', q = '') {
    return this.api.get<ShipperDocuments>('account/documents', { page, per_page: 20, status, ...(q ? { q } : {}) }).pipe(map((r) => {
      const d = r.data;
      if (!r.success || !Array.isArray(d?.pods) || !d.totals || typeof d.generated_at !== 'string'
        || !d.pods.every((p) => this.uuid(p?.booking_uuid) && typeof p.booking_reference === 'string' && POD_DOCUMENT_STATUSES.includes(p.status) && typeof p.download_available === 'boolean')
        || !['total', ...POD_DOCUMENT_STATUSES].every((key) => Number.isInteger(d.totals[key as keyof ShipperDocuments['totals']]) && d.totals[key as keyof ShipperDocuments['totals']] >= 0)
        || !(d.kyc === null || (this.uuid(d.kyc?.uuid) && ['pending', 'approved', 'rejected', 'other'].includes(d.kyc.status) && typeof d.kyc.download_available === 'boolean'))
        || ![r.meta?.current_page, r.meta?.last_page, r.meta?.total].every((v) => Number.isInteger(v) && v! >= 0)
        || !r.meta?.current_page || !r.meta.last_page) throw new Error('Invalid private document response');
      return { ...d, page: r.meta.current_page, lastPage: r.meta.last_page, matching: r.meta.total! };
    }));
  }
  download(kind: 'pod' | 'kyc', uuid: string) {
    return this.api.getBlob('account/documents/' + (kind === 'pod' ? 'pods' : 'kyc') + '/' + encodeURIComponent(uuid) + '/download');
  }
  private uuid(value: unknown): boolean { return typeof value === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value); }
}
