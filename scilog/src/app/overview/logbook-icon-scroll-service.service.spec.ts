import { TestBed } from '@angular/core/testing';
import { LogbookDataService } from '@shared/remote-data.service';

import { LogbookIconScrollService } from './logbook-icon-scroll-service.service';

describe('LogbookIconScrollServiceService', () => {
  let service: LogbookIconScrollService;

  beforeEach(() => {
    const LogbookDataServiceSpy = jasmine.createSpyObj("LogbookDataService", ["getDataBuffer"]);
    TestBed.configureTestingModule({
      providers: [
        {provide: LogbookDataService, useValue: LogbookDataServiceSpy}
      ],
    });
    service = TestBed.inject(LogbookIconScrollService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
