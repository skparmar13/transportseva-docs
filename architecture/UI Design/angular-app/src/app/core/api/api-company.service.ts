import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiClientService } from './api-client.service';

export interface CreateCompanyPayload {
  registration_number: string;
  name: string;
  gst_number?: string;
  pan_number?: string;
  phone: string;
  email: string;
  contact_person_name?: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  status?: 'active' | 'inactive' | 'suspended';
}

@Injectable({ providedIn: 'root' })
export class ApiCompanyService {
  private readonly api = inject(ApiClientService);

  create(payload: CreateCompanyPayload): Observable<unknown> {
    return this.api.post<unknown>('companies', payload).pipe(map((response) => response.data));
  }
}
