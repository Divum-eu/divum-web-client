import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { UserAuthService } from '../auth/user-auth.service';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next: HttpHandlerFn) => {
  const platformId = inject(PLATFORM_ID)

  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  if (!req.url.includes(environment.domain)) {
    return next(req);
  }

  const authService = inject(UserAuthService);
  const token = localStorage.getItem('accessToken');

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}`}
    });
  }

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !req.url.includes('/auth/login') && !req.url.includes('/auth/refresh')) {
        return from(authService.refreshAccessToken()).pipe(
          switchMap((newAccessToken: string) => {
            const retriedReq = req.clone({
              setHeaders: { Authorization: `Bearer ${newAccessToken}`}
            });
            return next(retriedReq);
        }),
          catchError((refreshErr) => {
            authService.logout();
            return throwError(() => refreshErr);
          })
        );
      }
      return throwError(() => err);
    })
  );
}
