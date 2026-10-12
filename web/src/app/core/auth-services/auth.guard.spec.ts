import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { routes } from '../../app-routing.module';
import { AuthService } from './auth.service';

describe('authGuard', () => {
  let router: Router;
  let token: string | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { getScilogToken: () => token } },
      ],
    });
    router = TestBed.inject(Router);
  });

  describe('without a session', () => {
    beforeEach(() => (token = null));

    [
      '/overview',
      '/logbooks/1/dashboard',
      '/download/1',
      '/overview(settings:viewSettings)',
      '/logbooks/1/dashboard(settings:viewSettings)',
      '/logbooks/1/dashboard(settings:profileSettings)',
    ].forEach((url) => {
      it(`sends ${url} to the login page with the return address`, async () => {
        await router.navigateByUrl(url);
        const redirect = router.parseUrl(router.url);
        expect(redirect.root.children.primary.toString()).toEqual('login');
        expect(redirect.queryParams).toEqual({ returnUrl: url });
      });
    });

    ['/login', '/auth-callback'].forEach((url) => {
      it(`opens ${url}`, async () => {
        await router.navigateByUrl(url);
        expect(router.url).toEqual(url);
      });
    });
  });

  describe('with a session', () => {
    beforeEach(() => (token = 'a-token'));

    [
      '/logbooks/1/dashboard',
      '/overview(settings:viewSettings)',
      '/logbooks/1/dashboard(settings:viewSettings)',
      '/logbooks/1/dashboard(settings:profileSettings)',
    ].forEach((url) => {
      it(`opens ${url}`, async () => {
        await router.navigateByUrl(url);
        expect(router.url).toEqual(url);
      });
    });
  });
});
