import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from './api-config';

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: Record<string, string[]>;
}

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_CONFIG.baseUrl;

  get<T>(path: string, params?: Record<string, string | number | boolean>): Observable<ApiEnvelope<T>> {
    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params ?? {})) httpParams = httpParams.set(key, String(value));
    return this.http.get<ApiEnvelope<T>>(this.url(path), { params: httpParams });
  }

  post<T>(path: string, body: unknown): Observable<ApiEnvelope<T>> {
    return this.http.post<ApiEnvelope<T>>(this.url(path), body);
  }

  put<T>(path: string, body: unknown): Observable<ApiEnvelope<T>> {
    return this.http.put<ApiEnvelope<T>>(this.url(path), body);
  }

  delete<T>(path: string): Observable<ApiEnvelope<T>> {
    return this.http.delete<ApiEnvelope<T>>(this.url(path));
  }

  private url(path: string): string {
    return this.baseUrl + (path.startsWith('/') ? path : '/' + path);
  }
}
