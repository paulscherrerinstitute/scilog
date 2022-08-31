import { TestBed } from '@angular/core/testing';

import { LogbookIconScrollServiceService } from './logbook-icon-scroll-service.service';

describe('LogbookIconScrollServiceService', () => {
  let service: LogbookIconScrollServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LogbookIconScrollServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
