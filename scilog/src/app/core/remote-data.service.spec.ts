import { TestBed } from '@angular/core/testing';

import { RemoteDataService } from '@shared/remote-data.service';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';

describe('RemoteDataService', () => {
  let service: RemoteDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(RemoteDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
