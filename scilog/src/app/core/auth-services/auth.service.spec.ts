import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { ServerSettingsService } from '../config/server-settings.service';

describe('AuthService', () => {
  let service: AuthService;
  let spyServerSettingsService = jasmine.createSpyObj({ getServerAddress: 'http://192.168.1.21:3000/' });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: ServerSettingsService, useValue: spyServerSettingsService }
      ]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be initialized', inject([AuthService], (authService: AuthService) => {
    expect(authService).toBeTruthy();
  }));

  it('should perform login correctly',
    fakeAsync(inject(
      [AuthService, HttpTestingController, ServerSettingsService],
      (authService: AuthService, backend: HttpTestingController) => {

        // Set up
        const responseObject = {
          success: true,
          message: 'login was successful'
        };
        const principal = 'test@example.com';
        const password = 'testPassword';
        let response = null;
        // End Setup

        authService.login(principal, password).subscribe(
          (receivedResponse: any) => {
            response = receivedResponse;
          },
          (error: any) => { }
        );


        const requestWrapper = backend.expectOne({ url: 'http://192.168.1.21:3000/users/login' });
        requestWrapper.flush(responseObject);

        tick();

        expect(requestWrapper.request.method).toEqual('POST');
        expect(response).toEqual(responseObject);
      }
    )))
});
