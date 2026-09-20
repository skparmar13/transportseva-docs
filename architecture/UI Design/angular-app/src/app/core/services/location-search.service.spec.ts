import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { GeoLocation } from '../models/location.model';
import { LocationSearchService } from './location-search.service';

describe('LocationSearchService', () => {
  let service: LocationSearchService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(LocationSearchService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('searches India in Photon and maps selected places to address and coordinates', () => {
    let result: GeoLocation[] = [];
    service.search('Connaught Place').subscribe((places) => result = places);

    const request = http.expectOne((req) => req.url === 'https://photon.komoot.io/api/');
    expect(request.request.params.get('q')).toBe('Connaught Place');
    expect(request.request.params.get('countrycode')).toBe('in');
    expect(request.request.params.get('limit')).toBe('6');
    request.flush({
      features: [{
        geometry: { coordinates: [77.2195, 28.6315] },
        properties: { name: 'Connaught Place', city: 'New Delhi', state: 'Delhi', country: 'India', postcode: '110001', osm_id: 123 },
      }],
    });

    expect(result![0]).toEqual(jasmine.objectContaining({
      label: 'Connaught Place, New Delhi, Delhi, 110001, India',
      city: 'New Delhi',
      latitude: 28.6315,
      longitude: 77.2195,
      source: 'OpenStreetMap',
      osmId: '123',
    }));
  });
});
