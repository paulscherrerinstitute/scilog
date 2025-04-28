import { inject, Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ServerSettingsService } from '@shared/config/server-settings.service';

function logout() {
  localStorage.removeItem('id_token');
  localStorage.removeItem('id_session');
  localStorage.removeItem('scicat_token');
  sessionStorage.removeItem('scilog-auto-selection-logbook');
  location.href = '/login';
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private serverSettingsService = inject(ServerSettingsService);

  private isRequestToSciCatBackend(req_url: string): boolean {
    try {
      const origin = new URL(req_url).origin;
      return (
        origin ===
        new URL(this.serverSettingsService.getSciCatServerAddress()).origin
      );
    } catch (err) {
      // new URL(...) fails for request to static assets (e.g. /assets/config.json)
      return false;
    }
  }

  private handle_request(handler: HttpHandler, req: HttpRequest<any>) {
    return handler.handle(req).pipe(
      tap({
        next: (event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            // console.log(cloned);
            // console.log("Service Response thr Interceptor");
          }
        },
        error: (err: any) => {
          if (err instanceof HttpErrorResponse) {
            console.log('err.status', err);
            if (err.status === 401) {
              if (!this.isRequestToSciCatBackend(err.url)) {
                logout();
              } else {
                const returnURL = window.location.pathname + window.location.search;
                window.location.href = this.serverSettingsService.getScicatLoginUrl(returnURL);
              }
            }
          }
        },
      })
    );
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let idToken = '';
    if (this.isRequestToSciCatBackend(req.url)) {
      idToken = localStorage.getItem('scicat_token');
    } else {
      idToken = localStorage.getItem('id_token');
    }
    if (idToken) {
      const cloned = req.clone({
        headers: req.headers.set('Authorization', 'Bearer ' + idToken),
      });
      return this.handle_request(next, cloned);
    } else {
      return this.handle_request(next, req);
    }
  }
}
