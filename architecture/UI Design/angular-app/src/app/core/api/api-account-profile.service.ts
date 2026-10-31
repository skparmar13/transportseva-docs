import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { ApiClientService, ApiEnvelope } from './api-client.service';
import { BackendLoginUser } from './api-auth.service';

export interface PersonalProfile { designation: string | null; address: string | null; city: string | null; pincode: string | null; notify_email: boolean; notify_sms: boolean; version: number; }
export interface AccountProfileView { account: BackendLoginUser; profile: PersonalProfile; }
export interface ProfileDraft { first_name: string; last_name: string; email: string; designation: string; address: string; city: string; pincode: string; notify_email: boolean; notify_sms: boolean; }
export type SaveAccountProfile = ProfileDraft & { version: number; password?: string; password_confirmation?: string; current_password?: string };
export interface EmailChallenge { challenge_id: string; expires_in: number; resend_after: number; delivery_status: string; debug_otp?: string; }

@Injectable({ providedIn: 'root' })
export class ApiAccountProfileService {
  private readonly api = inject(ApiClientService);
  get() { return this.api.get<AccountProfileView>('account/profile').pipe(map(this.view)); }
  save(payload: SaveAccountProfile) { return this.api.put<AccountProfileView>('account/profile', payload).pipe(map(this.view)); }
  requestEmail() { return this.api.post<EmailChallenge>('account/email/request-otp', {}).pipe(map((r) => { if (!r.success || !r.data?.challenge_id) throw new Error('Invalid verification response'); return r.data; })); }
  verifyEmail(challenge_id: string, otp: string) { return this.api.post<Partial<BackendLoginUser>>('account/email/verify-otp', { challenge_id, otp }).pipe(map((r) => { if (!r.success || !r.data) throw new Error('Verification failed'); return r.data; })); }
  private view(r: ApiEnvelope<AccountProfileView>): AccountProfileView { if (!r.success || !r.data?.account?.uuid || !Number.isInteger(r.data.profile?.version)) throw new Error('Invalid profile response'); return r.data; }
}
