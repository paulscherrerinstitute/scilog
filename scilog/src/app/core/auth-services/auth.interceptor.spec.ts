import { TestBed } from '@angular/core/testing';

import { AuthInterceptor } from './auth.interceptor';
import { ServerSettingsService } from '@shared/config/server-settings.service';
import { HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { of } from 'rxjs';

describe('AuthInterceptor', () => {
  const serverSettingsService = jasmine.createSpyObj('ServerSettingsService', [
    'getSciCatServerAddress',
  ]);
  serverSettingsService.getSciCatServerAddress.and.returnValue(
    'https://scicat-backend.psi.ch'
  );
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        AuthInterceptor,
        { provide: ServerSettingsService, useValue: serverSettingsService },
      ],
    })
  );

  it('should be created', () => {
    const interceptor: AuthInterceptor = TestBed.inject(AuthInterceptor);
    expect(interceptor).toBeTruthy();
  });

  it('should append scicat token if request to scicat backend', (done: DoneFn) => {
    localStorage.setItem('scicat_token', 'test_scicat_token');
    const interceptor: AuthInterceptor = TestBed.inject(AuthInterceptor);
    const req = new HttpRequest("GET", 'https://scicat-backend.psi.ch/api/v3/datasets');
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

  it('should append scilog token if request is not to scicat backend', (done: DoneFn) => {
    localStorage.setItem('id_token', 'test_scilog_token');
    const interceptor: AuthInterceptor = TestBed.inject(AuthInterceptor);
    const req = new HttpRequest("GET", 'https://scilog-backend.psi.ch/api/v1');
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
});

