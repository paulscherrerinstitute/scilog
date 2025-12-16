import { TestBed } from '@angular/core/testing';

import { TagService } from './tag.service';
import { TagDataService } from '@shared/remote-data.service';
import { LogbookInfoService } from '@shared/logbook-info.service';

class LogbookInfoMock {
  logbookInfo = {
    id: '1234',
  };
}

describe('TagService', () => {
  let service: TagService;
  let dataserviceSpy: any;

  beforeEach(() => {
    dataserviceSpy = jasmine.createSpyObj('TagDataService', ['getTags', 'getLastEntry']);

    // dataserviceSpy._getAvailLogbooks.and.returnValue(logbookMock);
    TestBed.configureTestingModule({
      providers: [
        { provide: TagDataService, useValue: dataserviceSpy },
        { provide: LogbookInfoService, useClass: LogbookInfoMock },
      ],
    });
    service = TestBed.inject(TagService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
