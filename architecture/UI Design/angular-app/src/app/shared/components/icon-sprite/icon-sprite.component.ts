import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Renders the shared SVG `<symbol>` sprite (ported verbatim from the
 * HTML prototype's inline sprite in admin/index.html etc.) once per
 * page so any `<app-icon name="i-grid">` can reference it via `<use>`.
 *
 * Place `<app-icon-sprite />` once near the root of the app (e.g. in
 * AppComponent's template).
 */
@Component({
  selector: 'app-icon-sprite',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg width="0" height="0" style="position:absolute" aria-hidden="true">
      <defs>
        <symbol id="i-api" viewBox="0 0 24 24"><rect x="3" y="9" width="6" height="6" rx="1"/><rect x="15" y="9" width="6" height="6" rx="1"/><path d="M9 12h6"/></symbol>
        <symbol id="i-arrow-left" viewBox="0 0 24 24"><path d="M19 12H5M11 18l-6-6 6-6"/></symbol>
        <symbol id="i-arrow-right" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></symbol>
        <symbol id="i-audit" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M11 8v3l2 2"/><path d="M21 21l-4-4"/></symbol>
        <symbol id="i-bell" viewBox="0 0 24 24"><path d="M6 10a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 20a2 2 0 004 0"/></symbol>
        <symbol id="i-box" viewBox="0 0 24 24"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v9l9 5 9-5V8"/><path d="M12 13v9"/></symbol>
        <symbol id="i-building" viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1"/></symbol>
        <symbol id="i-calendar" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></symbol>
        <symbol id="i-car" viewBox="0 0 24 24"><path d="M3 13l1.6-4.8A2 2 0 016.5 7h11a2 2 0 011.9 1.2L21 13"/><rect x="2" y="13" width="20" height="6" rx="2"/><circle cx="7" cy="19" r="1.6"/><circle cx="17" cy="19" r="1.6"/></symbol>
        <symbol id="i-chart" viewBox="0 0 24 24"><path d="M4 20V10M12 20V4M20 20v-7"/><path d="M2 20h20"/></symbol>
        <symbol id="i-check" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></symbol>
        <symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></symbol>
        <symbol id="i-credit-card" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></symbol>
        <symbol id="i-doc" viewBox="0 0 24 24"><path d="M6 2h9l5 5v13a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z"/><path d="M14 2v6h6"/></symbol>
        <symbol id="i-download" viewBox="0 0 24 24"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/></symbol>
        <symbol id="i-edit" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/></symbol>
        <symbol id="i-eye" viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></symbol>
        <symbol id="i-filter" viewBox="0 0 24 24"><path d="M4 4h16l-6 8v6l-4 2v-8z"/></symbol>
        <symbol id="i-flag" viewBox="0 0 24 24"><path d="M4 3v18"/><path d="M4 4h13l-2 4 2 4H4"/></symbol>
        <symbol id="i-globe" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 010 18a14 14 0 010-18z"/></symbol>
        <symbol id="i-grid" viewBox="0 0 24 24"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></symbol>
        <symbol id="i-headset" viewBox="0 0 24 24"><path d="M3 12a9 9 0 0118 0"/><path d="M21 12v5a2 2 0 01-2 2h-1"/><rect x="17" y="12" width="4" height="6" rx="1"/><rect x="3" y="12" width="4" height="6" rx="1"/></symbol>
        <symbol id="i-info" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-5M12 8h.01"/></symbol>
        <symbol id="i-invoice" viewBox="0 0 24 24"><path d="M6 2h9l5 5v13a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z"/><path d="M8 12h8M8 16h5"/></symbol>
        <symbol id="i-key" viewBox="0 0 24 24"><circle cx="8" cy="15" r="4"/><path d="M10.5 12.5L20 3M17 6l3 3M14 9l2 2"/></symbol>
        <symbol id="i-layers" viewBox="0 0 24 24"><path d="M12 2l9 5-9 5-9-5 9-5z"/><path d="M3 12l9 5 9-5"/><path d="M3 17l9 5 9-5"/></symbol>
        <symbol id="i-lock" viewBox="0 0 24 24"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></symbol>
        <symbol id="i-logout" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></symbol>
        <symbol id="i-mail" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 6l10 7 10-7"/></symbol>
        <symbol id="i-map" viewBox="0 0 24 24"><path d="M9 3L3 5v16l6-2 6 2 6-2V3l-6 2-6-2z"/><path d="M9 3v16M15 5v16"/></symbol>
        <symbol id="i-message" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></symbol>
        <symbol id="i-more" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></symbol>
        <symbol id="i-percent" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.5 9.5l5 5M9.7 9.5a.2.2 0 100 .4.2.2 0 000-.4zM14.3 14.1a.2.2 0 100 .4.2.2 0 000-.4z"/></symbol>
        <symbol id="i-phone" viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.7 19.7 0 01-8.6-3.1 19.4 19.4 0 01-6-6A19.7 19.7 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .3 2 .7 3a2 2 0 01-.4 2.1L8 10.3a16 16 0 006 6l1.5-1.4a2 2 0 012.1-.4c1 .4 2 .6 3 .7a2 2 0 011.7 2.1z"/></symbol>
        <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></symbol>
        <symbol id="i-route" viewBox="0 0 24 24"><circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M8.5 19H15a4 4 0 000-8H9a4 4 0 010-8h6.5"/></symbol>
        <symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></symbol>
        <symbol id="i-settings" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1-1.6 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.6 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.5 1h.1a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z"/></symbol>
        <symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"/><path d="M9 12l2 2 4-4"/></symbol>
        <symbol id="i-star" viewBox="0 0 24 24"><path d="M12 2l3.1 6.6 7.2.9-5.3 5 1.4 7.2L12 18.3 5.6 21.7 7 14.5l-5.3-5 7.2-.9L12 2z"/></symbol>
        <symbol id="i-tag" viewBox="0 0 24 24"><path d="M20.6 12.3L12.7 20.2a2 2 0 01-2.8 0L2.8 13.1a2 2 0 010-2.8L10.7 2.4H18a2.6 2.6 0 012.6 2.6v7.3z"/><circle cx="15.5" cy="7.5" r="1.5"/></symbol>
        <symbol id="i-ticket" viewBox="0 0 24 24"><path d="M3 8a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 000 4v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 000-4V8z"/><path d="M9 6v12" stroke-dasharray="2 3"/></symbol>
        <symbol id="i-trash" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></symbol>
        <symbol id="i-truck" viewBox="0 0 24 24"><path d="M1 3h13v13H1z"/><path d="M14 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2"/><circle cx="17.5" cy="18.5" r="2"/></symbol>
        <symbol id="i-upload" viewBox="0 0 24 24"><path d="M12 21V9"/><path d="M7 14l5-5 5 5"/><path d="M5 3h14"/></symbol>
        <symbol id="i-user" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></symbol>
        <symbol id="i-users" viewBox="0 0 24 24"><circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-7 7-7s7 3 7 7"/><circle cx="17" cy="9" r="3"/><path d="M21 21c0-3-1.8-5.5-4.5-6.5"/></symbol>
        <symbol id="i-wallet" viewBox="0 0 24 24"><path d="M3 7a2 2 0 012-2h13a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/><path d="M16 12h4v4h-4a2 2 0 010-4z"/></symbol>
        <symbol id="i-home" viewBox="0 0 24 24"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></symbol>
        <symbol id="i-pin" viewBox="0 0 24 24"><path d="M12 21s7-6.4 7-12a7 7 0 10-14 0c0 5.6 7 12 7 12z"/><circle cx="12" cy="9" r="2.4"/></symbol>
        <symbol id="i-chevron" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></symbol>
        <symbol id="i-menu" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></symbol>
        <symbol id="i-facebook" viewBox="0 0 24 24"><path d="M14 9V7a1 1 0 011-1h2V3h-3a4 4 0 00-4 4v2H8v3h2v9h3v-9h2.5L16 9h-2z"/></symbol>
        <symbol id="i-twitter" viewBox="0 0 24 24"><path d="M22 5.3c-.7.3-1.5.6-2.3.7.8-.5 1.4-1.3 1.7-2.3-.8.5-1.7.8-2.6 1a4 4 0 00-6.9 3.7A11.5 11.5 0 013.2 4.2a4 4 0 001.3 5.4c-.7 0-1.3-.2-1.8-.5v.1c0 2 1.4 3.6 3.2 4a4 4 0 01-1.8.1 4 4 0 003.7 2.8A8 8 0 012 17.5a11.3 11.3 0 006.3 1.9c7.5 0 11.6-6.2 11.6-11.6v-.5c.8-.6 1.5-1.3 2.1-2z"/></symbol>
        <symbol id="i-instagram" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></symbol>
        <symbol id="i-linkedin" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 10v7M7 7v.01M11 17v-4.5a2.5 2.5 0 015 0V17M11 10v7"/></symbol>
        <symbol id="i-youtube" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="4"/><path d="M10 9l6 3-6 3V9z"/></symbol>
        <symbol id="i-briefcase" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/><path d="M2 12h20"/></symbol>
        <symbol id="i-heart" viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 10-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z"/></symbol>
        <symbol id="i-award" viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M8.2 13.5L7 22l5-3 5 3-1.2-8.5"/></symbol>
        <symbol id="i-coffee" viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><path d="M6 1v3M10 1v3M14 1v3"/></symbol>
        <symbol id="i-target" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></symbol>
        <symbol id="i-trending-up" viewBox="0 0 24 24"><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></symbol>
        <symbol id="i-headphones" viewBox="0 0 24 24"><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/></symbol>
        <symbol id="i-send" viewBox="0 0 24 24"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></symbol>
        <symbol id="i-truck2" viewBox="0 0 24 24"><path d="M2 4h11v11H2z"/><path d="M13 8h4l3 3v4h-7V8z"/><circle cx="6" cy="19" r="1.8"/><circle cx="17.5" cy="19" r="1.8"/></symbol>
        <symbol id="i-play" viewBox="0 0 24 24"><path d="M3 3l18 9-18 9V3z"/></symbol>
        <symbol id="i-apple" viewBox="0 0 24 24"><path d="M16.5 2c.1 1.3-.4 2.5-1.1 3.4-.8.9-2 1.6-3.1 1.5-.2-1.2.4-2.5 1.1-3.3.8-.9 2.1-1.6 3.1-1.6zM20.6 17.4c-.4 1-.9 1.9-1.6 2.8-1 1.3-1.9 2.6-3.5 2.7-1.5.1-2-.9-3.7-.9-1.7 0-2.3.9-3.7.9-1.5.1-2.6-1.4-3.6-2.7-2-2.8-3.5-7.9-1.5-11.3 1-1.7 2.8-2.8 4.7-2.8 1.5 0 2.7.9 3.6.9.9 0 2.5-1.1 4.1-1 .7 0 2.6.3 3.9 2.1-3.4 2-2.8 6.7.3 8.3z"/></symbol>
        <symbol id="i-scan" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM19 14h2M14 19h2M19 19h2"/></symbol>
      </defs>
    </svg>
  `,
})
export class IconSpriteComponent {}

