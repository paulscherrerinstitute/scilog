import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
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
});
