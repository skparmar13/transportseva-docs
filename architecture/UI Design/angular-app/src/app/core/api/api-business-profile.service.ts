import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiClientService, ApiEnvelope } from './api-client.service';

export type BusinessType = 'sole_proprietor' | 'partnership' | 'pvt_ltd' | 'llp' | 'public_ltd' | 'other';
export interface BusinessProfileFields {
  business_name: string | null;
  business_type: BusinessType | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
}
export interface BusinessProfileView {
  account: { uuid: string; full_name: string; email: string; phone: string | null; role: 'shipper' | 'truck-owner' | 'transporter' };
  profile: BusinessProfileFields & { version: number; updated_at: string | null };
  persisted: boolean;
  changed: boolean;
  kyc: { status: 'pending' | 'approved' | 'rejected'; business_name: string; business_type: string; pan_last_four: string | null; gstin_last_four: string | null } | null;
}
export type SaveBusinessProfile = BusinessProfileFields & { version: number };

@Injectable({ providedIn: 'root' })
export class ApiBusinessProfileService {
  private readonly api = inject(ApiClientService);
  get(): Observable<BusinessProfileView> {
    return this.api.get<BusinessProfileView>('account/business-profile').pipe(map((response) => this.unwrap(response)));
  }
  save(payload: SaveBusinessProfile): Observable<BusinessProfileView> {
    return this.api.put<BusinessProfileView>('account/business-profile', payload).pipe(map((response) => this.unwrap(response)));
  }
  private unwrap(response: ApiEnvelope<BusinessProfileView>): BusinessProfileView {
    if (!response.success || !response.data?.account?.uuid || !Number.isInteger(response.data.profile?.version)) throw new Error('Invalid business profile response');
    return response.data;
  }
}
