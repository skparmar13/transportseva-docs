import { HttpInterceptorFn } from '@angular/common/http';
import { API_CONFIG } from './api-config';

export const authTokenInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(API_CONFIG.baseUrl)) return next(request);
  const token = typeof localStorage === 'undefined' ? null : localStorage.getItem('transportseva.access_token');
  if (!token) return next(request);
  return next(request.clone({ setHeaders: { Authorization: 'Bearer ' + token } }));
};
