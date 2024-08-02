import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { AppConfigService } from 'src/app/app-config.service';

import { SearchWindowComponent } from './search-window.component';
import { WidgetItemConfig } from 'src/app/core/model/config';

const getConfig = () => ({});

describe('SearchWindowComponent', () => {
  let component: SearchWindowComponent;
  let fixture: ComponentFixture<SearchWindowComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AppConfigService, useValue: { getConfig } },
        { provide: MatDialog, useValue: {} },
        { provide: LogbookInfoService, useValue: { logbookInfo: {id: 'id'} } },
      ],
      imports: [HttpClientTestingModule],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should submitSearch logbook', () => {
    const resetSpy = spyOn(component['searchScrollService'], 'reset');
    const search = 'some';
    component.searchString = search;
    component.submitSearch();
    expect(resetSpy).toHaveBeenCalledOnceWith(search);
    expect(component.searched).toEqual(search);
  });

  it('should submitSearch overview', () => {
    component.logbookId = undefined;
    const search = 'some';
    component.searchString = search;
    const resetSpy = spyOn(component['logbookIconScrollService'], 'reset');
    const emitSpy = spyOn(component.overviewSearch, 'emit');
    const closeSearchSpy = spyOn(component, 'closeSearch');
    component.submitSearch();
    expect(resetSpy).toHaveBeenCalledOnceWith(search);
    expect(emitSpy).toHaveBeenCalledOnceWith(search);
    expect(closeSearchSpy).toHaveBeenCalled();
  });

  it('should defaultConfig', () => {
    expect(component.defaultConfig).toEqual({
      filter: {
        targetId: 'id',
      },
      general: {
        type: "logbook",
        readonly: true
      },
      view: {
        order: ["defaultOrder DESC"],
        hideMetadata: false,
        showSnippetHeader: false
      }
    });
  });

  it('should _extractConfig', () => {
    const firstConfig = {
      general: {
        type: 'logbook',
        title: 'some different',
      },
      filter: {
        targetId: 'id'
      }
    };
    const secondConfig = JSON.parse(JSON.stringify(firstConfig));
    secondConfig.general.title = 'Logbook view';
    const positions = { cols: 0, rows: 1, y: 2, x: 3 };
    component.configsArray = [
      { ...positions, config: firstConfig },
      { ...positions, config: secondConfig },
    ];
    expect(component["_extractConfig"]()).toEqual(secondConfig);
  });

  [
    undefined,
    {config: 
      {
        general: { type: 'logbook', title: 'Logbook view' },
        filter: { targetId: 'id' }
      } as WidgetItemConfig,
      searchStringFromConfig: '',
      configOut: 
      {
        general: { type: 'logbook', title: 'Logbook view' },
        filter: { targetId: 'id' }
      } as WidgetItemConfig,
    },
    {config: 
      {
        general: { type: 'logbook', title: 'Logbook view' },
        filter: { targetId: 'id', tags: ['a', 'b'], excludeTags: ['c', 'd'] }
      } as WidgetItemConfig,
      searchStringFromConfig: '-#c -#d #a #b',
      configOut: 
      {
        general: { type: 'logbook', title: 'Logbook view' },
        filter: { targetId: 'id' }
      } as WidgetItemConfig,
    }
  ].forEach((t, i) => {
    it(`should _prepareConfig ${i}`, () => {
      const defaultConfig = {
        filter: {
          targetId: "id",
        },
        general: {
          type: "logbook",
          readonly: true
        },
        view: {
          order: ["defaultOrder DESC"],
          hideMetadata: false,
          showSnippetHeader: false
        }
      };
      if (t)
        component.configsArray = [{ cols: 0, rows: 1, y: 2, x: 3, config: t.config }];
      expect(component["_prepareConfig"]()).toEqual(t? t.configOut: defaultConfig);
      if (t)
        expect(component.searchStringFromConfig).toEqual(t.searchStringFromConfig);
    });
  });

  [
    {filter: {tags: ['a', 'b'], excludeTags: ['c', 'd'] }, prefix: '#', key: 'tags', output: '#a #b'},
    {filter: {tags: ['a', 'b'], excludeTags: ['c', 'd'] }, prefix: '-#', key: 'excludeTags', output: '-#c -#d'},
  ].forEach((t, i) => {
    it(`should tagsToString ${i}`, () => {
      expect(component['tagsToString'](t.filter, t.key, t.prefix)).toEqual(t.output);
    });
  });

  it('should composeSearchString', () => {
    const tagFilter = {tags: ['a', 'b'], excludeTags: ['c', 'd'] };
    expect(component['composeSearchString'](tagFilter)).toEqual('-#c -#d #a #b');
  });

  [
    {searchString: '', searchStringFromConfig: '', output: ''},
    {searchString: ' ', searchStringFromConfig: ' ', output: ''},
    {searchString: ' ', searchStringFromConfig: 'def', output: 'def'},
    {searchString: 'abc', searchStringFromConfig: '', output: 'abc'},
    {searchString: 'abc', searchStringFromConfig: ' ', output: 'abc'},
    {searchString: 'abc', searchStringFromConfig: 'def', output: 'abc def'},
    {searchString: 'abc', searchStringFromConfig: 'def ', output: 'abc def'},
    {searchString: ' abc', searchStringFromConfig: 'def ', output: 'abc def'},
  ].forEach((t, i) => {
    it(`should concatSearchStrings ${i}`, () => {
      component.searchString = t.searchString;
      component.searchStringFromConfig = t.searchStringFromConfig;
      expect(component['concatSearchStrings']()).toEqual(t.output);
    });
  });

});
