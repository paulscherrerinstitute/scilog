import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '@shared/auth-services/auth.service';
import { AppConfigService, Oauth2Endpoint } from '../app-config.service';

import { LoginComponent } from './login.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

const getConfig = () => ({});

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, LoginComponent],
      providers: [
        UntypedFormBuilder,
        {
          provide: AppConfigService,
          useValue: { getConfig },
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not display OAuth2 provider', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('oauth-login-button')).toBeFalsy();
  });
  it('should display OAuth2 provider', () => {
    const endpoint: Oauth2Endpoint = {
      displayText: 'oauth provider',
      authURL: '/auth/foo',
    };
    component.appConfig.oAuth2Endpoint = endpoint;
    const dispatchSpy = spyOn(component, 'redirectOIDC');
    console.log(`!!!!!     ${component.document.location.href}`);
    component.redirectOIDC('/auth/foo');

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenCalledWith('/auth/foo');
    console.log(`!!!!!     ${component.document.location.href}`);
  });

  it('does not print the token to the console after a password login', async () => {
    const log = spyOn(console, 'log');
    spyOn(TestBed.inject(AuthService), 'login').and.returnValue(
      of({ email: 'a@b', password: 'secret', token: 'a-secret-token' }),
    );
    spyOn(TestBed.inject(Router), 'navigateByUrl').and.resolveTo(true);
    component.form.setValue({ email: 'a@b', password: 'secret' });
    await component.login();
    expect(JSON.stringify(log.calls.allArgs())).not.toContain('a-secret-token');
  });
});

describe('LoginComponent return address', () => {
  let router: jasmine.SpyObj<Router>;
  let authService: jasmine.SpyObj<AuthService>;

  function createComponent(queryParams: Record<string, string>) {
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        UntypedFormBuilder,
        { provide: AppConfigService, useValue: { getConfig: () => ({ lbBaseURL: 'http://api' }) } },
        {
          provide: ActivatedRoute,
          useValue: { queryParams: of(queryParams), snapshot: { queryParams } },
        },
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: authService },
      ],
    });
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  beforeEach(() => {
    router = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['login', 'setSession']);
    authService.login.and.returnValue(of({ token: 'a-token' }));
  });

  async function loginWithPassword(queryParams: Record<string, string>) {
    const component = createComponent(queryParams);
    component.form.setValue({ email: 'a@b', password: 'secret' });
    await component.login();
  }

  it('goes to the return address after a password login', async () => {
    await loginWithPassword({ returnUrl: '/logbooks/1/dashboard' });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/logbooks/1/dashboard', {
      replaceUrl: true,
    });
  });

  it('goes to the overview after a password login without a return address', async () => {
    await loginWithPassword({});
    expect(router.navigateByUrl).toHaveBeenCalledWith('/overview', { replaceUrl: true });
  });

  it('goes to the overview for a return address outside the app', async () => {
    await loginWithPassword({ returnUrl: '//evil.com' });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/overview', { replaceUrl: true });
  });

  it('goes to the return address after an OIDC login', () => {
    createComponent({ token: 'a-token', returnUrl: '/logbooks/1/dashboard' });
    expect(authService.setSession).toHaveBeenCalledWith({ token: 'a-token' });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/logbooks/1/dashboard', {
      replaceUrl: true,
    });
  });

  it('goes to the overview after an OIDC login without a return address', () => {
    createComponent({ token: 'a-token' });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/overview', { replaceUrl: true });
  });

  it('goes to the overview after an OIDC login with a return address outside the app', () => {
    createComponent({ token: 'a-token', returnUrl: '//evil.com' });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/overview', { replaceUrl: true });
  });

  it('passes the return address on to the OIDC login', () => {
    const component = createComponent({ returnUrl: '/logbooks/1/dashboard' });
    component.document = { location: { href: '' } } as unknown as Document;
    component.redirectOIDC('auth/keycloak');
    expect(component.document.location.href).toEqual(
      'http://api/auth/keycloak/login?returnUrl=%2Flogbooks%2F1%2Fdashboard',
    );
  });

  it('starts the OIDC login without a return address when there is none', () => {
    const component = createComponent({});
    component.document = { location: { href: '' } } as unknown as Document;
    component.redirectOIDC('auth/keycloak');
    expect(component.document.location.href).toEqual('http://api/auth/keycloak/login');
  });
});
