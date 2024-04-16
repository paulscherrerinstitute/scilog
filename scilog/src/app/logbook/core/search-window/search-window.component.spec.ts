import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { AppConfigService } from 'src/app/app-config.service';

import { SearchWindowComponent } from './search-window.component';

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

  it('should _parseSearchString', () => {
    component.searchString = 'someSearch';
    expect(component['_parseSearchString']()).toEqual(
      {
        location: ['id'],
        tags: [],
        ownerGroup: "",
        createdBy: "",
        startDate: "",
        endDate: "",
      }
    );
    expect(component.searchString).toEqual('someSearch');
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

});
