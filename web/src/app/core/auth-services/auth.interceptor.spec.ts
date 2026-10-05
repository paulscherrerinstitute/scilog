import { TestBed } from '@angular/core/testing';

import { AuthInterceptor } from './auth.interceptor';
import { ServerSettingsService } from '@shared/config/server-settings.service';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { of, throwError } from 'rxjs';

describe('AuthInterceptor', () => {
  const serverSettingsService = jasmine.createSpyObj('ServerSettingsService', [
    'getServerAddress',
    'getSciCatServerAddress',
  ]);
  serverSettingsService.getServerAddress.and.returnValue('https://scilog-backend.psi.ch/api/v1/');
  serverSettingsService.getSciCatServerAddress.and.returnValue('https://scicat-backend.psi.ch');
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        AuthInterceptor,
        { provide: ServerSettingsService, useValue: serverSettingsService },
      ],
    }),
  );

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
        localStorage.clear();
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
        localStorage.clear();
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
        localStorage.clear();
        done();
      },
      error: done.fail,
    });
  });
});
