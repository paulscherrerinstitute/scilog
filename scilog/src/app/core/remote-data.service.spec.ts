import { TestBed } from '@angular/core/testing';

import { RemoteDataService } from '@shared/remote-data.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AppConfigService } from '../app-config.service';
import {
  LogbookDataService,
  LogbookItemDataService,
  SearchDataService,
} from './remote-data.service';
import { of } from 'rxjs';
import { WidgetItemConfig } from './model/config';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

const getConfig = () => ({});

describe('RemoteDataService', () => {
  let service: RemoteDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        { provide: AppConfigService, useValue: { getConfig } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(RemoteDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should test staticFilters', () => {
    expect(service['staticFilters']()).toEqual([
      { snippetType: { inq: ['paragraph', 'image'] } },
      { deleted: false },
    ]);
  });

  it('should test addIncludeScope', () => {
    expect(service['addIncludeScope']()).toEqual({
      scope: {
        include: [
          {
            relation: 'subsnippets',
            scope: {
              where: { snippetType: 'edit' },
            },
          },
        ],
      },
    });
  });

  it('should test tagsFilter', () => {
    expect(service['tagsFilter']({ tags: ['a', 'b'], excludeTags: ['c', 'd'] })).toEqual([
      { tags: { inq: ['a', 'b'] } },
      { tags: { nin: ['c', 'd'] } },
    ]);
  });

  it('should test parentFilter', () => {
    expect(
      service['parentFilter']({ targetId: 'target', additionalLogbooks: ['add1', 'add2'] }),
    ).toEqual([{ parentId: { inq: ['target', 'add1', 'add2'] } }]);
  });
});

describe('LogbookItemDataService', () => {
  let service: LogbookItemDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        { provide: AppConfigService, useValue: { getConfig } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
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
        targetId: 'target',
        additionalLogbooks: [],
        tags: [],
      },
      view: {
        order: ['defaultOrder ASC'],
        hideMetadata: false,
        showSnippetHeader: false,
      },
    };
    let filter = service['_prepareFilters'](config);
    expect(filter['where']).toEqual({
      and: [
        { snippetType: { inq: ['paragraph', 'image'] } },
        { deleted: false },
        { parentId: { inq: ['target'] } },
      ],
    });
  });

  it('should include paragraph targetIds and tags', () => {
    let config = {
      general: {
        type: 'logbook',
        title: 'Logbook view',
      },
      filter: {
        targetId: 'target',
        additionalLogbooks: ['target2'],
        tags: ['a', 'b'],
        excludeTags: ['c', 'd'],
      },
      view: {
        order: ['defaultOrder ASC'],
        hideMetadata: false,
        showSnippetHeader: false,
      },
    };
    let filter = service['_prepareFilters'](config);
    expect(filter['where']).toEqual({
      and: [
        { snippetType: { inq: ['paragraph', 'image'] } },
        { deleted: false },
        { tags: { inq: ['a', 'b'] } },
        { tags: { nin: ['c', 'd'] } },
        { parentId: { inq: ['target', 'target2'] } },
      ],
    });
    expect(filter['include']).toEqual([
      {
        relation: 'subsnippets',
        scope: {
          where: {
            or: [
              { snippetType: 'edit' },
              { and: [{ tags: { inq: ['a', 'b'] } }, { tags: { nin: ['c', 'd'] } }] },
            ],
          },
          include: [
            {
              relation: 'subsnippets',
              scope: {
                where: { snippetType: 'edit' },
              },
            },
          ],
        },
      },
    ]);
  });

  it('should include tag filter', () => {
    let config = {
      general: {
        type: 'logbook',
        title: 'Logbook view',
      },
      filter: {
        targetId: 'target',
        additionalLogbooks: [],
        tags: ['includeTag1'],
      },
      view: {
        order: ['defaultOrder ASC'],
        hideMetadata: false,
        showSnippetHeader: false,
      },
    };
    let filter = service['_prepareFilters'](config);
    expect(filter['where'].and[2]).toEqual({ tags: { inq: config.filter.tags } });
  });

  it('should include tag filter with multiple tags', () => {
    let config = {
      general: {
        type: 'logbook',
        title: 'Logbook view',
      },
      filter: {
        targetId: 'target',
        additionalLogbooks: [],
        tags: ['includeTag1', 'includeTag2'],
      },
      view: {
        order: ['defaultOrder ASC'],
        hideMetadata: false,
        showSnippetHeader: false,
      },
    };
    let filter = service['_prepareFilters'](config);
    expect(filter['where'].and[2]).toEqual({ tags: { inq: config.filter.tags } });
  });

  it('should include excludeTags filter', () => {
    let config = {
      general: {
        type: 'logbook',
        title: 'Logbook view',
      },
      filter: {
        targetId: 'target',
        additionalLogbooks: [],
        tags: ['includeTag1'],
        excludeTags: ['excludeTag1'],
      },
      view: {
        order: ['defaultOrder ASC'],
        hideMetadata: false,
        showSnippetHeader: false,
      },
    };
    let filter = service['_prepareFilters'](config);
    expect(filter['where'].and[3]).toEqual({ tags: { nin: config.filter.excludeTags } });
  });

  it('should include multiple excludeTags filter', () => {
    let config = {
      general: {
        type: 'logbook',
        title: 'Logbook view',
      },
      filter: {
        targetId: 'target',
        additionalLogbooks: [],
        tags: ['includeTag1'],
        excludeTags: ['excludeTag1', 'excludeTag2'],
      },
      view: {
        order: ['defaultOrder ASC'],
        hideMetadata: false,
        showSnippetHeader: false,
      },
    };
    let filter = service['_prepareFilters'](config);
    expect(filter['where'].and[2]).toEqual({ tags: { inq: config.filter.tags } });
    expect(filter['where'].and[3]).toEqual({ tags: { nin: config.filter.excludeTags } });
  });

  it('should delete all edit snippets', () => {
    const spyDeleteSnippet = spyOn<LogbookItemDataService, any>(
      service,
      'deleteSnippet',
    ).and.returnValue(of([]));
    service.deleteAllInProgressEditing('1');
    expect(spyDeleteSnippet.calls.mostRecent().args).toEqual(['edits/paragraphs-to-delete', '1']);
  });

  [
    {
      input: undefined,
      expected: {
        scope: {
          include: [{ relation: 'subsnippets', scope: { where: { snippetType: 'edit' } } }],
        },
      },
    },
    {
      input: { tags: ['a', 'b'], excludeTags: ['c', 'd'] },
      expected: {
        scope: {
          include: [{ relation: 'subsnippets', scope: { where: { snippetType: 'edit' } } }],
          where: {
            or: [
              { snippetType: 'edit' },
              { and: [{ tags: { inq: ['a', 'b'] } }, { tags: { nin: ['c', 'd'] } }] },
            ],
          },
        },
      },
    },
    {
      input: { tags: ['a', 'b'] },
      expected: {
        scope: {
          include: [{ relation: 'subsnippets', scope: { where: { snippetType: 'edit' } } }],
          where: { or: [{ snippetType: 'edit' }, { and: [{ tags: { inq: ['a', 'b'] } }] }] },
        },
      },
    },
    {
      input: { excludeTags: ['c', 'd'] },
      expected: {
        scope: {
          include: [{ relation: 'subsnippets', scope: { where: { snippetType: 'edit' } } }],
          where: { or: [{ snippetType: 'edit' }, { and: [{ tags: { nin: ['c', 'd'] } }] }] },
        },
      },
    },
  ].forEach((t, i) => {
    it(`should addIncludeScope ${i}`, () => {
      expect(service['addIncludeScope'](t.input)).toEqual(t.expected);
    });
  });
});

describe('LogbookDataService', () => {
  let service: LogbookDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        { provide: AppConfigService, useValue: { getConfig } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(LogbookDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call getSnippet with id', () => {
    const spyGetSnippets = spyOn<LogbookDataService, any>(service, 'getSnippets').and.returnValue(
      of([]),
    );
    service.getLogbookInfo('1');
    expect(spyGetSnippets.calls.mostRecent().args[0]).toEqual('logbooks/1');
  });

  it('should call getSnippets with list of ids', () => {
    const spyGetSnippets = spyOn<LogbookDataService, any>(service, 'getSnippets').and.returnValue(
      of([]),
    );
    service.getLogbooksInfo(['1', '2', '3']);
    expect(spyGetSnippets.calls.mostRecent().args[1]['params'].toString()).toEqual(
      'filter=%7B%22where%22:%7B%22id%22:%7B%22inq%22:%5B%221%22,%222%22,%223%22%5D%7D%7D%7D',
    );
  });

  it('should test _prepareFilters', () => {
    const filters = service['_prepareFilters']({ general: {}, filter: {}, view: {} }, 10, 20);
    expect(filters).toEqual({
      order: ['defaultOrder DESC'],
      where: { and: [{ snippetType: 'logbook', deleted: false }] },
      limit: 20,
      skip: 10,
    });
  });
});

describe('SearchDataService', () => {
  let service: SearchDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        { provide: AppConfigService, useValue: { getConfig } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(SearchDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be created', () => {
    const config = {
      general: {
        type: 'logbook',
        title: 'Logbook view',
      },
      filter: {
        targetId: 'target',
        additionalLogbooks: ['target2'],
        tags: ['a', 'b'],
        excludeTags: ['c', 'd'],
      },
      view: {
        order: ['defaultOrder ASC'],
        hideMetadata: false,
        showSnippetHeader: false,
      },
    };
    const filter = service['_prepareFilters'](config);
    expect(filter['where']).toEqual({
      and: [
        { snippetType: { inq: ['paragraph', 'image'] } },
        { deleted: false },
        { tags: { inq: ['a', 'b'] } },
        { tags: { nin: ['c', 'd'] } },
        { parentId: { inq: ['target', 'target2'] } },
      ],
    });

    expect(filter['include']).toEqual([
      {
        relation: 'subsnippets',
      },
    ]);
  });

  it('should test addIncludeScope', () => {
    expect(service['addIncludeScope']()).toEqual({});
  });

  [
    ['#search', '%23search'],
    ['@search', '%40search'],
    ['search', 'search'],
  ].forEach((t) => {
    it(`should test getDataBuffer ${t[0]}`, () => {
      service.searchString = t[0];
      const getSnippetSpy = spyOn<any>(service, 'getSnippets').and.returnValue({
        toPromise: () => {},
      });
      spyOn<any>(service, '_prepareParams');
      service.getDataBuffer(0, 0, {} as WidgetItemConfig);
      expect(getSnippetSpy.calls.mostRecent().args[0]).toEqual(`basesnippets/search=${t[1]}`);
    });
  });
});
