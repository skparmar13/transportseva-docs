import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { GeoLocation } from '../models/location.model';

interface PhotonFeature {
  geometry?: { coordinates?: [number, number] };
  properties?: {
    name?: string;
    street?: string;
    housenumber?: string;
    district?: string;
    suburb?: string;
    city?: string;
    locality?: string;
    state?: string;
    country?: string;
    countrycode?: string;
    postcode?: string;
    osm_id?: number;
  };
}

interface PhotonResponse { features?: PhotonFeature[]; }

@Injectable({ providedIn: 'root' })
export class LocationSearchService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = 'https://photon.komoot.io/api/';

  search(query: string): Observable<GeoLocation[]> {
    const params = new HttpParams()
      .set('q', query.trim())
      .set('countrycode', 'in')
      .set('limit', '6');

    return this.http.get<PhotonResponse>(this.endpoint, { params }).pipe(
      map((response) => (response.features ?? []).flatMap((feature) => {
        const properties = feature.properties;
        const coordinates = feature.geometry?.coordinates;
        if (!properties?.name || !properties.country || !coordinates || coordinates.length < 2) return [];

        const city = properties.city ?? properties.locality ?? properties.district ?? properties.suburb ?? properties.name;
        const street = [properties.housenumber, properties.street].filter(Boolean).join(' ');
        const label = [...new Set([
          properties.name,
          street,
          properties.district ?? properties.suburb,
          city,
          properties.state,
          properties.postcode,
          properties.country,
        ].filter((part): part is string => Boolean(part)))].join(', ');

        return [{
          label,
          city,
          state: properties.state,
          country: properties.country,
          postcode: properties.postcode,
          longitude: coordinates[0],
          latitude: coordinates[1],
          source: 'OpenStreetMap' as const,
          osmId: properties.osm_id ? String(properties.osm_id) : undefined,
        }];
      })),
    );
  }
}
