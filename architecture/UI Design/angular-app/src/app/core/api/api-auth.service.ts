import { Injectable, inject } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { ApiClientService } from './api-client.service';
import { StaffAccess } from '../models/staff-access.model';

export interface BackendLoginUser {
  uuid: string;
  email: string;
  full_name: string;
  phone?: string;
  role?: string;
  roles?: string[];
  profile_completion_required?: boolean;
  staff_access?: StaffAccess | null;
}

export interface BackendLoginData {
  user: BackendLoginUser;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface SignupOtpData { debug_otp?: string; }
export interface RecoveryChallenge { challenge_id: string; expires_in: number; resend_after: number; debug_otp?: string; }
export interface RecoveryProof { reset_token: string; expires_in: number; }

@Injectable({ providedIn: 'root' })
export class ApiAuthService {
  private readonly api = inject(ApiClientService);

  login(email: string, password: string): Observable<BackendLoginData> {
    return this.api.post<BackendLoginData>('auth/login', { email: email.trim(), password }).pipe(
      tap(({ data }) => {
        localStorage.setItem('transportseva.access_token', data.access_token);
        localStorage.setItem('transportseva.refresh_token', data.refresh_token);
        localStorage.setItem('transportseva.api_user', JSON.stringify(data.user));
      }),
      map((response) => response.data),
    );
  }

  me(): Observable<BackendLoginUser> {
    return this.api.get<BackendLoginUser>('auth/me').pipe(
      map((response) => response.data),
      tap((user) => localStorage.setItem('transportseva.api_user', JSON.stringify(user))),
    );
  }

  refresh(): Observable<BackendLoginData> {
    const refresh_token = localStorage.getItem('transportseva.refresh_token') ?? '';
    return this.api.post<Omit<BackendLoginData, 'user'>>('auth/refresh', { refresh_token }).pipe(
      map((response) => ({
        ...response.data,
        user: JSON.parse(localStorage.getItem('transportseva.api_user') ?? '{}') as BackendLoginUser,
      })),
      tap((data) => {
        localStorage.setItem('transportseva.access_token', data.access_token);
        localStorage.setItem('transportseva.refresh_token', data.refresh_token);
      }),
    );
  }

  logout(): Observable<unknown> {
    const refresh_token = localStorage.getItem('transportseva.refresh_token') ?? '';
    return this.api.post<unknown>('auth/logout', { refresh_token }).pipe(
      tap(() => this.clearTokens()),
    );
  }

  requestSignupOtp(phone: string): Observable<SignupOtpData | null> {
    return this.api.post<SignupOtpData | null>('auth/signup/request-otp', { phone }).pipe(map((response) => response.data));
  }

  verifySignupOtp(phone: string, otp: string, role?: string): Observable<BackendLoginData> {
    return this.api.post<BackendLoginData>('auth/signup/verify-otp', { phone, otp, role }).pipe(
      map((response) => response.data),
      tap((data) => {
        localStorage.setItem('transportseva.access_token', data.access_token);
        localStorage.setItem('transportseva.refresh_token', data.refresh_token);
        localStorage.setItem('transportseva.api_user', JSON.stringify(data.user));
      }),
    );
  }

  completeProfile(payload: { first_name: string; last_name: string; email: string; password: string; password_confirmation: string }): Observable<unknown> {
    return this.api.put<BackendLoginUser>('auth/profile/complete', payload).pipe(
      map((response) => response.data),
      tap((user) => localStorage.setItem('transportseva.api_user', JSON.stringify(user))),
    );
  }

  requestPasswordRecovery(identifier: string): Observable<RecoveryChallenge> {
    return this.api.post<RecoveryChallenge>('auth/password/request-otp', { identifier: identifier.trim() }).pipe(map((response) => response.data));
  }

  verifyPasswordRecovery(challenge_id: string, otp: string): Observable<RecoveryProof> {
    return this.api.post<RecoveryProof>('auth/password/verify-otp', { challenge_id, otp }).pipe(map((response) => response.data));
  }

  resetPassword(challenge_id: string, reset_token: string, password: string, password_confirmation: string): Observable<unknown> {
    return this.api.post<unknown>('auth/password/reset', { challenge_id, reset_token, password, password_confirmation });
  }

  clearTokens(): void {
    localStorage.removeItem('transportseva.access_token');
    localStorage.removeItem('transportseva.refresh_token');
    localStorage.removeItem('transportseva.api_user');
  }
}
