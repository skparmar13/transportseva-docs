import { inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CanActivateFn, Router } from '@angular/router';
import { PortalRole } from '../models/nav.model';
import { SessionService } from '../services/session.service';
import { API_CONFIG } from '../api/api-config';
import { ApiAuthService } from '../api/api-auth.service';
import { catchError, map, of, timeout } from 'rxjs';
import { staffRouteAllowed } from '../models/staff-access.model';

/**
 * Route guard factory — activates the given portal role on the mock
 * session before a portal's routes load in prototype mode. Backend mode
 * verifies the identity with the API, never with editable local-storage roles.
 * Server endpoints must independently authorize every sensitive operation.
 */
export function setPortalRole(role: PortalRole): CanActivateFn {
  return (_route, state) => {
    const session = inject(SessionService);
    const router = inject(Router);
    if (!API_CONFIG.useBackend) { session.setRole(role); return true; }
    if (typeof localStorage === 'undefined' || !localStorage.getItem('transportseva.access_token')) {
      return router.createUrlTree(['/auth/login']);
    }
    return inject(ApiAuthService).me().pipe(
      timeout(15_000),
      map((user) => {
        if (user.profile_completion_required) return router.createUrlTree(['/auth/profile-setup']);
        const actual = user.role === 'customer' ? 'shipper' : user.role;
        if (!['admin', 'shipper', 'transporter', 'truck-owner', 'driver', 'company'].includes(actual ?? '')) {
          return router.createUrlTree(['/auth/login']);
        }
        session.setBackendUser(user);
        session.setRole(actual as PortalRole);
        if (actual === 'admin' && role === 'admin' && user.staff_access?.enforced) {
          const path = state.url.split(/[?#]/)[0].split('/').filter(Boolean)[1] ?? '';
          if (!staffRouteAllowed(user.staff_access, path)) return router.createUrlTree(['/admin/access']);
        }
        return actual === role ? true : router.createUrlTree([`/${actual}/dashboard`]);
      }),
      // Keep tokens on a transient failure; do not mislabel it as expiry or
      // sign the user out. Login offers an explicit session-check retry.
      catchError((error) => of(router.createUrlTree(['/auth/login'], { queryParams: error instanceof HttpErrorResponse && error.status === 401
        ? { reason: 'session-expired' }
        : { reason: 'access-check-failed', returnUrl: state.url } }))),
    );
  };
}
