import { TestBed } from '@angular/core/testing';

import { DatasetService } from './dataset.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppConfigService } from '../app-config.service';

describe('DatasetService', () => {
  let service: DatasetService;
  const getConfig = () => ({});

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [HttpClientTestingModule], providers: [DatasetService, { provide: AppConfigService, useValue: { getConfig } }]});
    service = TestBed.inject(DatasetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
