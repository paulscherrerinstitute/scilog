import { TestBed } from '@angular/core/testing';

import { AuthInterceptor } from './auth.interceptor';
import { ServerSettingsService } from '@shared/config/server-settings.service';
import { ScicatAuthService } from './scicat-auth.service';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { of, throwError } from 'rxjs';

describe('AuthInterceptor', () => {
  let serverSettingsService: jasmine.SpyObj<ServerSettingsService>;

  beforeEach(() => {
    serverSettingsService = jasmine.createSpyObj<ServerSettingsService>('ServerSettingsService', [
      'getServerAddress',
      'getSciCatServerAddress',
      'getScicatRocrateBaseUrl',
    ]);
    serverSettingsService.getServerAddress.and.returnValue('https://scilog-backend.psi.ch/api/v1/');
    serverSettingsService.getSciCatServerAddress.and.returnValue('https://scicat-backend.psi.ch');
    serverSettingsService.getScicatRocrateBaseUrl.and.returnValue('https://scicat-rocrate.psi.ch');

    TestBed.configureTestingModule({
      providers: [
        AuthInterceptor,
        { provide: ServerSettingsService, useValue: serverSettingsService },
      ],
    });
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should be created', () => {
    const interceptor: AuthInterceptor = TestBed.inject(AuthInterceptor);
    expect(interceptor).toBeTruthy();
  });

  it('should append scicat token if request to scicat backend', (done: DoneFn) => {
    localStorage.setItem('scicat_token', 'test_scicat_token');
    const interceptor: AuthInterceptor = TestBed.inject(AuthInterceptor);
    const req = new HttpRequest('GET', 'https://scicat-backend.psi.ch/api/v3/datasets');
    const next = jasmine.createSpyObj<HttpHandler>('HttpHandler', ['handle']);
    next.handle.and.returnValue(of({} as HttpEvent<any>));
    interceptor.intercept(req, next).subscribe({
      next: (_httpEvent: HttpEvent<any>) => {
        const reqArg = next.handle.calls.mostRecent().args[0];
        expect(reqArg.headers.get('Authorization')).toBe('Bearer test_scicat_token');
        done();
      },
      error: done.fail,
    });
  });

  it('should append scilog token if request is to scilog backend', (done: DoneFn) => {
    localStorage.setItem('id_token', 'test_scilog_token');
    const interceptor: AuthInterceptor = TestBed.inject(AuthInterceptor);
    const req = new HttpRequest('GET', 'https://scilog-backend.psi.ch/api/v1');
    const next = jasmine.createSpyObj<HttpHandler>('HttpHandler', ['handle']);
    next.handle.and.returnValue(of({} as HttpEvent<any>));
    interceptor.intercept(req, next).subscribe({
      next: (_httpEvent: HttpEvent<any>) => {
        const reqArg = next.handle.calls.mostRecent().args[0];
        expect(reqArg.headers.get('Authorization')).toBe('Bearer test_scilog_token');
        done();
      },
      error: done.fail,
    });
  });

  describe('on a 401 from the SciLog backend', () => {
    let location: Pick<Location, 'pathname' | 'search' | 'hash' | 'href'>;

    function failWith401() {
      TestBed.overrideProvider(DOCUMENT, { useValue: { location } });
      const interceptor = TestBed.inject(AuthInterceptor);
      const next = jasmine.createSpyObj<HttpHandler>('HttpHandler', ['handle']);
      next.handle.and.returnValue(
        throwError(
          () => new HttpErrorResponse({ status: 401, url: 'https://scilog-backend.psi.ch/api/v1' }),
        ),
      );
      interceptor
        .intercept(new HttpRequest('GET', 'https://scilog-backend.psi.ch/api/v1'), next)
        .subscribe({ error: () => undefined });
    }

    it('goes to the login page with the current page as return address', () => {
      location = { pathname: '/logbooks/1/dashboard', search: '?x=1', hash: '#y', href: '' };
      failWith401();
      expect(location.href).toEqual('/login?returnUrl=%2Flogbooks%2F1%2Fdashboard%3Fx%3D1%23y');
    });

    it('stays on the login page, keeping its return address', () => {
      const href = 'http://localhost/login?returnUrl=%2Flogbooks%2F1%2Fdashboard';
      location = {
        pathname: '/login',
        search: '?returnUrl=%2Flogbooks%2F1%2Fdashboard',
        hash: '',
        href,
      };
      failWith401();
      expect(location.href).toEqual(href);
    });

    it('stays on the SciCat callback, so its token is not put into a URL', () => {
      const href = 'http://localhost/auth-callback?access-token=x';
      location = { pathname: '/auth-callback', search: '?access-token=x', hash: '', href };
      failWith401();
      expect(location.href).toEqual(href);
    });
  });

  it('should append no token if request is to any other backend', (done: DoneFn) => {
    localStorage.setItem('id_token', 'test_scilog_token');
    localStorage.setItem('scicat_token', 'test_scicat_token');
    const interceptor: AuthInterceptor = TestBed.inject(AuthInterceptor);
    const req = new HttpRequest('GET', 'https://other-backend.psi.ch/api/v1');
    const next = jasmine.createSpyObj<HttpHandler>('HttpHandler', ['handle']);
    next.handle.and.returnValue(of({} as HttpEvent<any>));
    interceptor.intercept(req, next).subscribe({
      next: (_httpEvent: HttpEvent<any>) => {
        const reqArg = next.handle.calls.mostRecent().args[0];
        expect(reqArg.headers.get('Authorization')).toBeNull();
        done();
      },
      error: done.fail,
    });
  });

  function handlerReturning401(url: string): jasmine.SpyObj<HttpHandler> {
    const next = jasmine.createSpyObj<HttpHandler>('HttpHandler', ['handle']);
    next.handle.and.returnValue(throwError(() => new HttpErrorResponse({ status: 401, url })));
    return next;
  }

  it('clears the SciCat session and stays put on a 401 from the SciCat backend', () => {
    localStorage.setItem('scicat_token', 'test_scicat_token');
    const location = { pathname: '/logbooks/1/dashboard', search: '?x=1', hash: '', href: '' };
    TestBed.overrideProvider(DOCUMENT, { useValue: { location } });
    const scicatAuth = TestBed.inject(ScicatAuthService);
    const interceptor = TestBed.inject(AuthInterceptor);
    const url = 'https://scicat-backend.psi.ch/api/v3/datasets';
    interceptor
      .intercept(new HttpRequest('GET', url), handlerReturning401(url))
      .subscribe({ error: () => undefined });
    expect(scicatAuth.loggedIn()).toBeFalse();
    expect(localStorage.getItem('scicat_token')).toBeNull();
    // the user is not redirected; they reconnect to SciCat when they choose to
    expect(location.href).toEqual('');
  });

  it('clears the SciCat session on a 401 from the scicat-rocrate service', () => {
    localStorage.setItem('scicat_token', 'test_scicat_token');
    const location = { pathname: '/logbooks/1/dashboard', search: '', hash: '', href: '' };
    TestBed.overrideProvider(DOCUMENT, { useValue: { location } });
    const scicatAuth = TestBed.inject(ScicatAuthService);
    const interceptor = TestBed.inject(AuthInterceptor);
    const url = 'https://scicat-rocrate.psi.ch/api/v1/ro-crate/import';
    interceptor
      .intercept(new HttpRequest('POST', url, null), handlerReturning401(url))
      .subscribe({ error: () => undefined });
    expect(scicatAuth.loggedIn()).toBeFalse();
    expect(localStorage.getItem('scicat_token')).toBeNull();
    // the user is not redirected; they reconnect to SciCat when they choose to
    expect(location.href).toEqual('');
  });

  it('neither logs out nor redirects on a 401 from another origin', () => {
    localStorage.setItem('id_token', 'test_scilog_token');
    localStorage.setItem('scicat_token', 'test_scicat_token');
    const href = 'http://localhost/logbooks/1/dashboard';
    const location = { pathname: '/logbooks/1/dashboard', search: '', hash: '', href };
    TestBed.overrideProvider(DOCUMENT, { useValue: { location } });
    const interceptor = TestBed.inject(AuthInterceptor);
    const url = 'https://other-backend.psi.ch/api/v1';
    interceptor
      .intercept(new HttpRequest('GET', url), handlerReturning401(url))
      .subscribe({ error: () => undefined });
    expect(location.href).toEqual(href);
    expect(localStorage.getItem('id_token')).toBe('test_scilog_token');
    expect(localStorage.getItem('scicat_token')).toBe('test_scicat_token');
  });
});
