import { HttpInterceptorFn } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_CONFIG } from './api-config';

export const authTokenInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(API_CONFIG.baseUrl)) return next(request);
  const router = inject(Router);
  const token = typeof localStorage === 'undefined' ? null : localStorage.getItem('transportseva.access_token');
  const outgoing = token ? request.clone({ setHeaders: { Authorization: 'Bearer ' + token } }) : request;
  return next(outgoing).pipe(catchError((error: unknown) => {
    if (error instanceof HttpErrorResponse && error.status === 401 && typeof localStorage !== 'undefined') {
      localStorage.removeItem('transportseva.access_token');
      localStorage.removeItem('transportseva.refresh_token');
      localStorage.removeItem('transportseva.api_user');
      if (!router.url.startsWith('/auth/')) void router.navigate(['/auth/login'], { queryParams: { reason: 'session-expired' } });
    }
    return throwError(() => error);
  }));
};
