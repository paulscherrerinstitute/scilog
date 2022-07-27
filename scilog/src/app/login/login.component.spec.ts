import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { AppConfigService, Oauth2Endpoint } from '../app-config.service';

import { LoginComponent } from './login.component';

const getConfig = () => ({});

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginComponent ],
      providers: [FormBuilder, {
        provide: AppConfigService,
        useValue: { getConfig },
      },
],
      imports: [HttpClientTestingModule, RouterTestingModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("should not display OAuth2 provider", () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector("oauth-login-button")).toBeFalsy();
  });
  it("should display OAuth2 provider", () => {
    const endpoint: Oauth2Endpoint = {
      displayText: "oauth provider",
      authURL: "/auth/foo",
    };
    component.appConfig.oAuth2Endpoint = endpoint;
    const dispatchSpy = spyOn(component, "redirectOIDC");
    console.log(`!!!!!     ${component.document.location.href}`);
    component.redirectOIDC("/auth/foo");

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenCalledWith("/auth/foo");
    console.log(`!!!!!     ${component.document.location.href}`);
  });

});
