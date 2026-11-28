import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { GeoLocation } from '../models/location.model';
import { LocationSearchService } from './location-search.service';

describe('LocationSearchService', () => {
  let service: LocationSearchService, http: HttpTestingController;
  beforeEach(() => { TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] }); service = TestBed.inject(LocationSearchService); http = TestBed.inject(HttpTestingController); });
  afterEach(() => http.verify());
  it('uses the server-selected geocoder and preserves coordinates and provider IDs', () => {
    let result: GeoLocation[] = [];
    service.search(' Connaught Place ').subscribe(places => result = places);
    const request = http.expectOne(r => r.url.endsWith('/public/maps/search'));
    expect(request.request.params.get('q')).toBe('Connaught Place');
    const place = { label: 'Connaught Place, New Delhi, Delhi, India', city: 'New Delhi', country: 'India', latitude: 28.6315, longitude: 77.2195, source: 'geocoder', placeId: 'google-qa-place' };
    request.flush({ success: true, data: [place] });
    expect(result[0]).toEqual(jasmine.objectContaining(place));
    http.expectNone(r => r.url.startsWith('https://photon.') || r.url.startsWith('https://maps.googleapis.com'));
  });
  it('propagates provider errors without making a fallback request to another provider', () => {
    let failed = false; service.search('Delhi').subscribe({ error: () => failed = true });
    http.expectOne(r => r.url.endsWith('/public/maps/search')).flush({}, { status: 503, statusText: 'Unavailable' }); expect(failed).toBeTrue();
  });
});
