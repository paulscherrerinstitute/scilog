import { TestBed } from '@angular/core/testing';

import { RemoteDataService } from '@shared/remote-data.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppConfigService } from '../app-config.service';

const getConfig = () => ({});

describe('RemoteDataService', () => {
  let service: RemoteDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: AppConfigService, useValue: { getConfig } }],
    });
    service = TestBed.inject(RemoteDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
