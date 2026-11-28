import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { GeoLocation } from '../models/location.model';
import { ApiClientService } from '../api/api-client.service';

@Injectable({ providedIn: 'root' })
export class LocationSearchService {
  private readonly api = inject(ApiClientService);
  /** Provider and private Google credentials are resolved on the server. */
  search(query: string): Observable<GeoLocation[]> {
    return this.api.get<GeoLocation[]>('public/maps/search', { q: query.trim() }).pipe(map(r => r.data));
  }
}
