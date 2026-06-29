import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const credentialsInterceptor: HttpInterceptorFn = (request: HttpRequest<any>, next: HttpHandlerFn) => {

  if (!request.url.includes(environment.domain)) {
    return next(request);
  }

  const clonedReq = request.clone({
    withCredentials: true
  });

  return next(clonedReq);
}
