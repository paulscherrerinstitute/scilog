import { TestBed } from '@angular/core/testing';

import { LogbookScrollService } from './logbook-scroll.service';
import { LogbookItemDataService } from '@shared/remote-data.service';

describe('LogbookScrollService', () => {
  let service: LogbookScrollService;
  let logbookItemDataServiceSpy: any;

  logbookItemDataServiceSpy = jasmine.createSpyObj('LogbookItemDataService', [
    'getDataBuffer',
    'getCount',
  ]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LogbookScrollService,
        { provide: LogbookItemDataService, useValue: logbookItemDataServiceSpy },
      ],
    });
    service = TestBed.inject(LogbookScrollService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
