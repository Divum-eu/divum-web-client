import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { UserAuthService } from '../auth/user-auth.service';
import { BehaviorSubject, catchError, filter, finalize, from, switchMap, take, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

let isRefreshing = false;
const refreshSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next: HttpHandlerFn) => {
  const platformId = inject(PLATFORM_ID);
  const authService = inject(UserAuthService);

  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  if (!req.url.includes(environment.domain)) {
    return next(req);
  }

  const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/register');
  const isRefreshEndpoint = req.url.includes('/auth/refresh');

  const token = localStorage.getItem('accessToken');

  let authReq = req;
  if (token && !isRefreshEndpoint) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401 || isAuthEndpoint || isRefreshEndpoint) {
        return throwError(() => err);
      }

      if (isRefreshing) {
        return refreshSubject.pipe(
          filter((newToken) => newToken !== null),
          take(1),
          switchMap((newToken) => {
            const retriedReq = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` }
            });
            return next(retriedReq);
          }),
        );
      }

      isRefreshing = true;
      refreshSubject.next(null);

      return from(authService.refreshAccessToken()).pipe(
        switchMap((newToken) => {
          isRefreshing = false;
          refreshSubject.next(newToken);
          const retriedReq = req.clone({
            setHeaders: { Authorization: `Bearer ${newToken}` }
          });
          return next(retriedReq);
        }),
        catchError((refreshErr) => {
          isRefreshing = false;
          refreshSubject.next(null);
          authService.logout();
          return throwError(() => refreshErr);
        }),
      );
    })
  );
};
