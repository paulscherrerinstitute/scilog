import { TestBed } from '@angular/core/testing';
import { LogbookDataService } from '@shared/remote-data.service';

import { LogbookIconScrollService } from './logbook-icon-scroll-service.service';
import { AdapterMethodResult, IDatasource } from 'ngx-ui-scroll/src/component/interfaces';

describe('LogbookIconScrollServiceService', () => {
  let service: LogbookIconScrollService;

  beforeEach(() => {
    const logbookDataServiceSpy = jasmine.createSpyObj("LogbookDataService", ["getDataBuffer"]);
    logbookDataServiceSpy.getDataBuffer.and.resolveTo([1, 2, 3, 4, 5, 6, 7]);

    TestBed.configureTestingModule({
      providers: [
        {provide: LogbookDataService, useValue: logbookDataServiceSpy}
      ],
    });
    service = TestBed.inject(LogbookIconScrollService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should test getData', async () => {
    service['datasource'] = {adapter: {relax: async () => ({} as AdapterMethodResult)}} as IDatasource;
    expect(await service.getData(0, 10, {})).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
  });

});
