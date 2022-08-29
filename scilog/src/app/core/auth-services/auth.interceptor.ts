import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

function logout() {
  localStorage.removeItem("id_token");
  localStorage.removeItem('id_session');
  sessionStorage.removeItem('scilog-auto-selection-logbook');
  location.href = '/login';
};

function handle_request(handler: HttpHandler, req: HttpRequest<any>) {
  return handler.handle(req).pipe(tap((event: HttpEvent<any>) => {
    if (event instanceof HttpResponse) {
      // console.log(cloned);
      // console.log("Service Response thr Interceptor");
    }
  }, (err: any) => {
    if (err instanceof HttpErrorResponse) {
      console.log("err.status", err);
      if (err.status === 401) {
        logout();
      }
    }
  }));
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>,
    next: HttpHandler): Observable<HttpEvent<any>> {

    const idToken = localStorage.getItem("id_token");

    if (idToken) {
      const cloned = req.clone({
        headers: req.headers.set("Authorization",
          "Bearer " + idToken)
      });

      return handle_request(next, cloned);

    }
    else {
      return handle_request(next, req);
    }
  }
}
