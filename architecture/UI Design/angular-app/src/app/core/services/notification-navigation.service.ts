import { Injectable, inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { AppNotification } from '../models/communication.model';
import { SessionService } from './session.service';

/** Resolve only internal, role-appropriate destinations; notification data is untrusted. */
@Injectable({ providedIn: 'root' })
export class NotificationNavigationService {
  private readonly router = inject(Router);
  private readonly session = inject(SessionService);

  destination(notification: AppNotification): UrlTree | null {
    const role = this.session.role();
    const base = this.session.portal().basePath;
    const data = notification.data ?? {};
    if (role === 'admin' && data['staff_access_changed'] === true) return this.router.createUrlTree([base, 'access']);
    const uuid = (value: unknown): string | null =>
      typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value) ? value : null;
    const load = uuid(data['load_uuid']);
    const booking = uuid(data['booking_uuid']);
    const application = uuid(data['application_uuid']);
    const message = uuid(data['message_uuid']);
    const offer = uuid(data['offer_uuid']);
    const review = uuid(data['review_uuid']);
    const kyc = uuid(data['kyc_profile_uuid']);
    const marketplaceRole = role === 'shipper' || role === 'transporter' || role === 'truck-owner';
    if (load && marketplaceRole) return this.router.createUrlTree([base, 'load-board', load], {
      queryParams: message && application ? { chat: application } : offer && application ? { offers: application } : {},
    });
    if (booking && (marketplaceRole || role === 'admin')) {
      return this.router.createUrlTree([base, role === 'transporter' ? 'requests' : 'bookings'], { queryParams: { booking } });
    }
    if (review && (role === 'shipper' || role === 'truck-owner' || role === 'admin')) return this.router.createUrlTree([base, 'reviews']);
    if (kyc && (marketplaceRole || role === 'admin')) return this.router.createUrlTree([base, 'kyc']);
    // Action links are accepted only within the current portal, never as external redirects.
    const action = notification.actionUrl;
    if (action && action.startsWith(base + '/') && !action.includes('\\') && !action.startsWith('//')) {
      try { return this.router.parseUrl(action); } catch { return null; }
    }
    return null;
  }
}
