import { TestBed } from '@angular/core/testing';

import { DatasetService } from './dataset.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AppConfigService } from '../app-config.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('DatasetService', () => {
  let service: DatasetService;
  const getConfig = () => ({});

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [], providers: [DatasetService, { provide: AppConfigService, useValue: { getConfig } }, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()] });
    service = TestBed.inject(DatasetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
