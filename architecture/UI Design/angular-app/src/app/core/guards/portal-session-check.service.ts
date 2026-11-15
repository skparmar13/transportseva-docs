import { DestroyRef, Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NavigationCancel, NavigationEnd, NavigationError, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, retry, shareReplay, throwError, timeout, timer } from 'rxjs';
import { ApiAuthService, BackendLoginUser } from '../api/api-auth.service';

/** Share only within a single navigation, never reuse authorization on later routes. */
@Injectable({ providedIn: 'root' })
export class PortalSessionCheckService {
  private readonly api = inject(ApiAuthService);
  private readonly router = inject(Router);
  private pending?: { navigation: number; token: string; request: Observable<BackendLoginUser> };

  constructor() {
    this.router.events.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe(event => {
      if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        if (this.pending?.navigation === event.id) this.pending = undefined;
      }
    });
  }

  verify(): Observable<BackendLoginUser> {
    const navigation = this.router.getCurrentNavigation()?.id;
    const token = typeof localStorage === 'undefined' ? '' : localStorage.getItem('transportseva.access_token') ?? '';
    if (navigation !== undefined && this.pending?.navigation === navigation && this.pending.token === token) return this.pending.request;
    const request = this.api.me().pipe(
      retry({ count: 1, delay: error => error instanceof HttpErrorResponse && [0, 502, 503, 504].includes(error.status)
        ? timer(250) : throwError(() => error) }),
      // One total deadline includes the optional transient-error retry.
      timeout(30_000),
      // Router guards unsubscribe after their first value. Keep the bounded
      // read through completion so the child guard doesn't resubscribe to HTTP.
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    if (navigation !== undefined) this.pending = { navigation, token, request };
    return request;
  }
}
