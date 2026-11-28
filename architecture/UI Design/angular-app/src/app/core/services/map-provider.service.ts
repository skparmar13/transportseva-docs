import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiClientService } from '../api/api-client.service';

export interface PublicMapConfiguration {
  provider: 'openstreetmap' | 'google'; google_embed_key: string | null;
  embed_available: boolean; search_available: boolean;
}

/** The backend .env is authoritative for every map, including prototype views. */
@Injectable({ providedIn: 'root' })
export class MapProviderService {
  private readonly api = inject(ApiClientService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly platform = inject(PLATFORM_ID);
  readonly configuration = signal<PublicMapConfiguration | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');

  constructor() { if (isPlatformBrowser(this.platform)) this.load(); }

  load(): void {
    if (this.loading()) return;
    this.loading.set(true); this.error.set(''); this.configuration.set(null);
    this.api.get<PublicMapConfiguration>('public/maps/config').subscribe({
      next: r => {
        if (!['openstreetmap', 'google'].includes(r.data?.provider)) this.error.set('Map display is not configured. Please contact support.');
        else { this.configuration.set(r.data); if (!r.data.embed_available || (r.data.provider === 'google' && !r.data.google_embed_key?.trim())) this.error.set('Google Maps is unavailable. Please contact support.'); }
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.error.set('Map display is temporarily unavailable. Please retry.'); },
    });
  }

  frameUrl(latitude: number, longitude: number): SafeResourceUrl | null {
    const c = this.configuration();
    if (!c || !c.embed_available || !Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
    if (c.provider === 'google') {
      if (!c.google_embed_key?.trim()) return null;
      const params = new URLSearchParams({ key: c.google_embed_key, q: `${latitude},${longitude}`, zoom: '15' });
      return this.sanitizer.bypassSecurityTrustResourceUrl('https://www.google.com/maps/embed/v1/place?' + params.toString());
    }
    if (c.provider !== 'openstreetmap') return null;
    const pad = .012;
    const bbox = [Math.max(-180, longitude - pad), Math.max(-90, latitude - pad), Math.min(180, longitude + pad), Math.min(90, latitude + pad)].join(',');
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`);
  }

}
