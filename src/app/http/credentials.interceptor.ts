import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';

export const credentialsInterceptor: HttpInterceptorFn = (request: HttpRequest<any>, next: HttpHandlerFn) => {
  const clonedReq = request.clone({
    withCredentials: true
  });

  return next(clonedReq);
}
