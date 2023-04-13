import { TestBed } from '@angular/core/testing';

import { RemoteDataService } from '@shared/remote-data.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppConfigService } from '../app-config.service';
import { LogbookItemDataService } from './remote-data.service';

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