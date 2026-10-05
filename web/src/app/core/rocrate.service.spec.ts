import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { RocrateService } from './rocrate.service';
import { ServerSettingsService } from './config/server-settings.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('RocrateService', () => {
  let service: RocrateService;
  let httpMock: HttpTestingController;
  const serverSettingsSpy = jasmine.createSpyObj('ServerSettingsService', [
    'getScicatRocrateBaseUrl',
  ]);
  serverSettingsSpy.getScicatRocrateBaseUrl.and.returnValue('https://scicat-rocrate.example');

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RocrateService,
        { provide: ServerSettingsService, useValue: serverSettingsSpy },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(RocrateService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.setItem('scicat_token', 'test_scicat_token');
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('posts the zip with api-key and ownerGroup headers and maps the data/ key to the PID', (done: DoneFn) => {
    const zip = new Blob(['zip-content'], { type: 'application/zip' });
    const pid = '20.500.11935/30ccdd5e-beae-4b93-9874-c879dcd37fb5';

    service.importRoCrate(zip, 'psi-demo').subscribe((result) => {
      expect(result).toBe(pid);
      done();
    });

    const req = httpMock.expectOne('https://scicat-rocrate.example/api/v1/ro-crate/import');
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('api-key')).toBe('test_scicat_token');
    expect(req.request.headers.get('ownerGroup')).toBe('psi-demo');
    expect(req.request.body).toBe(zip);
    req.flush({ 'data/': pid });
  });
});
