import { TestBed } from '@angular/core/testing';
import { SecurityContext } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { MapProviderService } from './map-provider.service';

describe('Server configured map provider', () => {
  let maps: MapProviderService, http: HttpTestingController;
  beforeEach(() => { TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] }); maps = TestBed.inject(MapProviderService); http = TestBed.inject(HttpTestingController); });
  afterEach(() => http.verify());
  const configuration = (provider = 'openstreetmap', key: string | null = null, available = true) => ({ success: true, data: { provider, google_embed_key: key, embed_available: available, search_available: true } });
  function respond(provider = 'openstreetmap', key: string | null = null, available = true) { http.expectOne(r => r.url.endsWith('/public/maps/config')).flush(configuration(provider, key, available)); }
  function url() { return TestBed.inject(DomSanitizer).sanitize(SecurityContext.RESOURCE_URL, maps.frameUrl(28.63, 77.223)); }
  it('does not flash an OpenStreetMap frame before the server configuration arrives', () => { expect(maps.frameUrl(28.63, 77.223)).toBeNull(); expect(maps.loading()).toBeTrue(); respond(); expect(url()).toContain('openstreetmap.org/export/embed.html'); });
  it('uses the configured Google provider and encoded browser key with the exact coordinates', () => {
    respond('google', 'browser+test/key'); const result = new URL(url()!);
    expect(result.origin).toBe('https://www.google.com'); expect(result.pathname).toBe('/maps/embed/v1/place'); expect(result.searchParams.get('q')).toBe('28.63,77.223'); expect(result.searchParams.get('key')).toBe('browser+test/key');
  });
  it('rejects malformed coordinates rather than trusting arbitrary iframe URLs', () => { respond(); for (const [lat, lon] of [[NaN, 77], [91, 77], [20, Infinity], [20, -181]]) expect(maps.frameUrl(lat, lon)).toBeNull(); expect(maps.frameUrl(0, 0)).not.toBeNull(); });
  it('reports missing Google credentials and does not fall back to OpenStreetMap', () => { respond('google', null, false); expect(url()).toBeNull(); expect(maps.error()).toContain('Google Maps is unavailable'); });
  it('retries a failed configuration request without silently choosing a provider', () => {
    http.expectOne(r => r.url.endsWith('/public/maps/config')).flush({}, { status: 503, statusText: 'Unavailable' }); expect(url()).toBeNull(); expect(maps.error()).toContain('temporarily unavailable');
    maps.load(); maps.load(); respond('google', 'browser-key'); expect(url()).toContain('www.google.com'); expect(maps.error()).toBe('');
  });
  it('rejects an unsupported provider even if the payload claims embedding is available', () => { respond('unsafe'); expect(maps.frameUrl(28.63,77.223)).toBeNull(); expect(maps.error()).toContain('not configured'); });
  it('changes all map URL consumers when the shared configuration is reloaded', () => { respond(); expect(url()).toContain('openstreetmap.org'); maps.load(); respond('google', 'browser-key'); expect(url()).toContain('www.google.com'); });
});
