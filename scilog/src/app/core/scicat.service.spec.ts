import { TestBed } from '@angular/core/testing';

import { ScicatService } from './scicat.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AppConfigService } from '../app-config.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ScicatService', () => {
  let service: ScicatService;
  const getConfig = () => ({});
  const getScicatSettings = () => undefined;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        ScicatService,
        { provide: AppConfigService, useValue: { getConfig, getScicatSettings } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ScicatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
