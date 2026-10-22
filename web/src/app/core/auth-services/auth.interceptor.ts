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

  private isSameOrigin(url: string, base?: string): boolean {
    try {
      return !!base && new URL(url).origin === new URL(base).origin;
    } catch {
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
              if (this.isSameOrigin(err.url, this.serverSettingsService.getSciCatServerAddress())) {
                const returnUrl = this.location.pathname + this.location.search;
                this.location.href = this.serverSettingsService.getScicatLoginUrl(returnUrl);
              } else if (
                this.isSameOrigin(err.url, this.serverSettingsService.getServerAddress())
              ) {
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
    if (this.isSameOrigin(req.url, this.serverSettingsService.getSciCatServerAddress())) {
      idToken = localStorage.getItem('scicat_token');
    } else if (this.isSameOrigin(req.url, this.serverSettingsService.getServerAddress())) {
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
