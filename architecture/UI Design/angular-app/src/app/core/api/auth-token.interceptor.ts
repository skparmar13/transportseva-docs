import { HttpInterceptorFn } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiAuthService } from './api-auth.service';
import { Observable, catchError, finalize, shareReplay, switchMap, throwError } from 'rxjs';
import { API_CONFIG } from './api-config';

/**
 * Access tokens are intentionally short lived (15 minutes). Keep one shared
 * refresh request so a burst of API calls at expiry does not rotate the same
 * refresh token several times and log the user out spuriously.
 */
let refreshRequest$: Observable<unknown> | null = null;

export const authTokenInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(API_CONFIG.baseUrl)) return next(request);
  const router = inject(Router);
  const auth = inject(ApiAuthService);
  // Recovery is anonymous; rejected recovery proof must not refresh a session.
  if (request.url.includes('/auth/password/')) return next(request);
  const token = typeof localStorage === 'undefined' ? null : localStorage.getItem('transportseva.access_token');
  const outgoing = token ? request.clone({ setHeaders: { Authorization: 'Bearer ' + token } }) : request;
  return next(outgoing).pipe(catchError((error: unknown) => {
    if (!(error instanceof HttpErrorResponse) || error.status !== 401 || typeof localStorage === 'undefined') return throwError(() => error);

    const isRefreshRequest = request.url.endsWith('/auth/refresh');
    const isAuthLifecycleRequest = request.url.includes('/auth/login')
      || request.url.includes('/auth/logout')
      || request.url.includes('/auth/signup')
      || request.url.includes('/auth/mpin');
    if (isRefreshRequest || isAuthLifecycleRequest) {
      clearExpiredSession(router);
      return throwError(() => error);
    }

    const refreshToken = localStorage.getItem('transportseva.refresh_token');
    if (!refreshToken) {
      clearExpiredSession(router);
      return throwError(() => error);
    }

    if (!refreshRequest$) {
      refreshRequest$ = auth.refresh().pipe(
        finalize(() => { refreshRequest$ = null; }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }
    return refreshRequest$.pipe(
      catchError((refreshError: unknown) => {
        // A network/server failure does not prove that the refresh token expired.
        if (refreshError instanceof HttpErrorResponse && (refreshError.status === 401 || refreshError.status === 403)) {
          clearExpiredSession(router);
        }
        return throwError(() => refreshError);
      }),
      switchMap(() => {
        const newToken = localStorage.getItem('transportseva.access_token');
        if (!newToken) {
          clearExpiredSession(router);
          return throwError(() => error);
        }
        return next(request.clone({ setHeaders: { Authorization: 'Bearer ' + newToken } })).pipe(
          catchError((retryError: unknown) => {
            // A denied business action (403) is not a rejected session.
            if (retryError instanceof HttpErrorResponse && retryError.status === 401) clearExpiredSession(router);
            return throwError(() => retryError);
          }),
        );
      }),
    );
  }));
};

function clearExpiredSession(router: Router): void {
  localStorage.removeItem('transportseva.access_token');
  localStorage.removeItem('transportseva.refresh_token');
  localStorage.removeItem('transportseva.api_user');
  if (!router.url.startsWith('/auth/')) void router.navigate(['/auth/login'], { queryParams: { reason: 'session-expired' } });
}
