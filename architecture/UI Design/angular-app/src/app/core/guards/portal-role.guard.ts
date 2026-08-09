import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { PortalRole } from '../models/nav.model';
import { SessionService } from '../services/session.service';

/**
 * Route guard factory — activates the given portal role on the mock
 * session before a portal's routes load. This is how the ONE shared
 * `ShellComponent` knows which sidebar/topbar (and mock user) to show
 * for `/shipper/**`, `/transporter/**`, etc. Always returns `true`;
 * this is a prototype-only mechanism, not real authorization.
 */
export function setPortalRole(role: PortalRole): CanActivateFn {
  return () => {
    inject(SessionService).setRole(role);
    return true;
  };
}
