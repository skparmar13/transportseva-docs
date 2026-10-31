import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, Subject, catchError, map, of, startWith, switchMap } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api-config';

type DashboardState<T> = { status: 'loading' | 'ready' | 'error'; data?: T };

/** Component-owned: no cross-account/global cache and no mock fallback. */
export function dashboardFeed<T>(request: () => Observable<T>) {
  const refresh = new Subject<void>();
  const state = toSignal(refresh.pipe(startWith(undefined), switchMap(() => API_CONFIG.useBackend
    ? request().pipe(
      map((data): DashboardState<T> => ({ status: 'ready', data })),
      startWith<DashboardState<T>>({ status: 'loading' }),
      catchError(() => of<DashboardState<T>>({ status: 'error' })),
    )
    : of<DashboardState<T>>({ status: 'error' }))), { initialValue: { status: 'loading' } as DashboardState<T> });
  return { state, reload: () => { if (state().status !== 'loading') refresh.next(); } };
}
