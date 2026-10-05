import { inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
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
import { isAuthPage, loginUrl } from './return-url';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private serverSettingsService = inject(ServerSettingsService);
  private location = inject(DOCUMENT).location;

  private logout() {
    localStorage.removeItem('id_token');
    localStorage.removeItem('id_session');
    localStorage.removeItem('scicat_token');
    sessionStorage.removeItem('scilog-auto-selection-logbook');
    // a wrong password on the login page also answers 401; stay there so the
    // message and the return address are kept. Also stay on the SciCat
    // callback, so its access token is not copied into a return address.
    const { pathname, search, hash } = this.location;
    if (isAuthPage(pathname)) return;
    this.location.href = loginUrl(pathname + search + hash);
  }

  private isRequestToService(service: BackendService, req_url: string): boolean {
    try {
      const base = this.serviceBaseUrl(service);
      if (!base) return false;
      return new URL(req_url).origin === new URL(base).origin;
    } catch (err) {
      // new URL(...) fails for request to static assets (e.g. /assets/config.json)
      return false;
    }
  }

  private serviceBaseUrl(service: BackendService): string | undefined {
    switch (service) {
      case 'scilog':
        return this.serverSettingsService.getServerAddress();
      case 'scicat':
        return this.serverSettingsService.getSciCatServerAddress();
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
              if (this.isRequestToService('scicat', err.url)) {
                const returnUrl = window.location.pathname + window.location.search;
                window.location.href = this.serverSettingsService.getScicatLoginUrl(returnUrl);
              } else if (this.isRequestToService('scilog', err.url)) {
                this.logout();
              }
            }
          }
        },
      }),
    );
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let idToken = '';
    // Check if request is to scicat or scilog backend and include their respective tokens.
    // Requests to any other origin (e.g. scicat-rocrate service) should include neither token.
    if (this.isRequestToService('scicat', req.url)) {
      idToken = localStorage.getItem('scicat_token');
    } else if (this.isRequestToService('scilog', req.url)) {
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
