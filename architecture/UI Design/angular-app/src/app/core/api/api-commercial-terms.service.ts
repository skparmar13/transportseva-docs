import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { ApiClientService } from './api-client.service';

export interface CommercialTerms {
  advance_percent: number;
  advance_before_dispatch: boolean;
  balance_due_days: number;
  tolls: 'included' | 'separate_with_approval';
  loading: 'included' | 'shipper_arranged' | 'separate_with_approval';
  unloading: 'included' | 'shipper_arranged' | 'separate_with_approval';
  pickup_free_hours: number;
  delivery_free_hours: number;
  detention_rate_amount: number;
  detention_rate_unit: 'per_hour' | 'per_day';
  cancellation_policy: 'admin_review';
  cargo_insurance: 'not_included' | 'shipper_arranged' | 'provider_arranged';
}
export interface CommercialVersion {
  version: number;
  fingerprint: string;
  terms: CommercialTerms;
  financials: { currency: string; rate_basis: string; payment_model: string; gross_freight: number; owner_platform_fee: number; provider_platform_fee: number; token_each: number; advance_amount: number; balance_before_mid_trip: number; commission_policy_version: number; load_reference?: string; route?: string; goods?: string; owner_name?: string; provider_name?: string };
  owner_accepted_at: string | null;
  provider_accepted_at: string | null;
  agreed_at: string | null;
  created_at: string;
}
export interface CommercialAgreement {
  required: boolean;
  status: 'legacy_not_recorded' | 'awaiting_acceptance' | 'agreed';
  viewer_side: 'owner' | 'provider';
  booking_reference: string;
  booking_status: string;
  current: CommercialVersion | null;
  balance_due_at?: string | null;
  history: CommercialVersion[];
}

@Injectable({ providedIn: 'root' })
export class ApiCommercialTermsService {
  private readonly api = inject(ApiClientService);
  private path(id: string) { return `/marketplace-bookings/${encodeURIComponent(id)}/commercial-terms`; }
  get(id: string) { return this.api.get<CommercialAgreement>(this.path(id)).pipe(map(r => r.data)); }
  accept(id: string, version: CommercialVersion) {
    return this.api.post<CommercialAgreement>(`${this.path(id)}/accept`, { version: version.version, fingerprint: version.fingerprint, acknowledged: true }).pipe(map(r => r.data));
  }
  propose(id: string, version: CommercialVersion, terms: CommercialTerms) {
    return this.api.post<CommercialAgreement>(this.path(id), { version: version.version, fingerprint: version.fingerprint, terms, acknowledged: true }).pipe(map(r => r.data));
  }
  document(id: string) { return this.api.getBlob(`${this.path(id)}/document`); }
}
