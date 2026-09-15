import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Public marketing pages are prerendered at build time so they ship
 * with real HTML content for SEO and fast first paint. Authenticated
 * portals and auth flows rely on browser-only APIs (localStorage-backed
 * mock session state) and are rendered on the client instead.
 */
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'about', renderMode: RenderMode.Prerender },
  { path: 'pricing', renderMode: RenderMode.Prerender },
  { path: 'contact', renderMode: RenderMode.Prerender },
  { path: 'blog', renderMode: RenderMode.Prerender },
  { path: 'blog-post', renderMode: RenderMode.Prerender },
  { path: 'careers', renderMode: RenderMode.Prerender },
  { path: 'help-center', renderMode: RenderMode.Prerender },
  { path: 'privacy-policy', renderMode: RenderMode.Prerender },
  { path: 'terms-conditions', renderMode: RenderMode.Prerender },
  { path: 'refund-policy', renderMode: RenderMode.Prerender },

  { path: 'auth/**', renderMode: RenderMode.Client },
  { path: 'admin/**', renderMode: RenderMode.Client },
  { path: 'shipper/**', renderMode: RenderMode.Client },
  { path: 'transporter/**', renderMode: RenderMode.Client },
  { path: 'truck-owner/**', renderMode: RenderMode.Client },
  { path: 'driver/**', renderMode: RenderMode.Client },
  { path: 'company/**', renderMode: RenderMode.Client },

  { path: '**', renderMode: RenderMode.Client },
];
