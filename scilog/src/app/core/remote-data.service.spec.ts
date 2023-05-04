import { TestBed } from '@angular/core/testing';

import { RemoteDataService } from '@shared/remote-data.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppConfigService } from '../app-config.service';
import { LogbookDataService, LogbookItemDataService } from './remote-data.service';
import { of } from 'rxjs';

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


describe('LogbookItemDataService', () => {
  let service: LogbookItemDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: AppConfigService, useValue: { getConfig } }],
    });
    service = TestBed.inject(LogbookItemDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should include paragraph filter', () => {
    let config = {
      general: {
        type: 'logbook',
        title: 'Logbook view',
      },
      filter: {
        targetId: "target",
        additionalLogbooks: [],
        tags: []
      },
      view: {
        order: ['defaultOrder ASC'],
        hideMetadata: false,
        showSnippetHeader: false
      }
    };
    let filter = LogbookItemDataService._prepareFilters(config);
    expect(filter["where"].and[0]).toEqual({ "and": [{ "or": [{ "snippetType": "paragraph" }, { "snippetType": "image" }] }, { "deleted": false }] });
  });

  it('should include paragraph targetId filter', () => {
    let config = {
      general: {
        type: 'logbook',
        title: 'Logbook view',
      },
      filter: {
        targetId: "target",
        additionalLogbooks: [],
        tags: []
      },
      view: {
        order: ['defaultOrder ASC'],
        hideMetadata: false,
        showSnippetHeader: false
      }
    };
    let filter = LogbookItemDataService._prepareFilters(config);
    expect(filter["where"].and[1]).toEqual({ "or": [{ "parentId": { "eq": config.filter.targetId } }] });
  });

  it('should include tag filter', () => {
    let config = {
      general: {
        type: 'logbook',
        title: 'Logbook view',
      },
      filter: {
        targetId: "target",
        additionalLogbooks: [],
        tags: ["includeTag1"]
      },
      view: {
        order: ['defaultOrder ASC'],
        hideMetadata: false,
        showSnippetHeader: false
      }
    };
    let filter = LogbookItemDataService._prepareFilters(config);
    expect(filter["where"].and[2]).toEqual({ "tags": { "inq": config.filter.tags } });
  });

  it('should include tag filter with multiple tags', () => {
    let config = {
      general: {
        type: 'logbook',
        title: 'Logbook view',
      },
      filter: {
        targetId: "target",
        additionalLogbooks: [],
        tags: ["includeTag1", "includeTag2"]
      },
      view: {
        order: ['defaultOrder ASC'],
        hideMetadata: false,
        showSnippetHeader: false
      }
    };
    let filter = LogbookItemDataService._prepareFilters(config);
    expect(filter["where"].and[2]).toEqual({ "tags": { "inq": config.filter.tags } });
  });

  it('should include excludeTags filter', () => {
    let config = {
      general: {
        type: 'logbook',
        title: 'Logbook view',
      },
      filter: {
        targetId: "target",
        additionalLogbooks: [],
        tags: ["includeTag1"],
        excludeTags: ["excludeTag1"]
      },
      view: {
        order: ['defaultOrder ASC'],
        hideMetadata: false,
        showSnippetHeader: false
      }
    };
    let filter = LogbookItemDataService._prepareFilters(config);
    expect(filter["where"].and[3]).toEqual({ "tags": { "nin": config.filter.excludeTags } });
  });

  it('should include multiple excludeTags filter', () => {
    let config = {
      general: {
        type: 'logbook',
        title: 'Logbook view',
      },
      filter: {
        targetId: "target",
        additionalLogbooks: [],
        tags: ["includeTag1"],
        excludeTags: ["excludeTag1", "excludeTag2"]
      },
      view: {
        order: ['defaultOrder ASC'],
        hideMetadata: false,
        showSnippetHeader: false
      }
    };
    let filter = LogbookItemDataService._prepareFilters(config);
    expect(filter["where"].and[2]).toEqual({ "tags": { "inq": config.filter.tags } });
    expect(filter["where"].and[3]).toEqual({ "tags": { "nin": config.filter.excludeTags } });
  });

});

describe('LogbookDataService', () => {
  let service: LogbookDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: AppConfigService, useValue: { getConfig } }],
    });
    service = TestBed.inject(LogbookDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call getSnippet with id', () => {
    const spyGetSnippets = spyOn<LogbookDataService, any>(service, "getSnippets").and.returnValue(of([]));
    service.getLogbookInfo("1");
    expect(spyGetSnippets.calls.mostRecent().args[0]).toEqual("logbooks/1");
  });


  it('should call getSnippets with list of ids', () => {
    const spyGetSnippets = spyOn<LogbookDataService, any>(service, "getSnippets").and.returnValue(of([]));
    service.getLogbooksInfo(["1", "2", "3"]);
    expect(spyGetSnippets.calls.mostRecent().args[1]["params"].toString()).
    toEqual("filter=%7B%22where%22:%7B%22id%22:%7B%22inq%22:%5B%221%22,%222%22,%223%22%5D%7D%7D%7D");
  });

});
