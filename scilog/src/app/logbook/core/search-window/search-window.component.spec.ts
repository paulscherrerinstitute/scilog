import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { AppConfigService } from 'src/app/app-config.service';

import { SearchWindowComponent } from './search-window.component';

const getConfig = () => ({});

describe('SearchWindowComponent', () => {
  let component: SearchWindowComponent;
  let fixture: ComponentFixture<SearchWindowComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchWindowComponent ],
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

  it('should call _prepareConfig on searchString emission', fakeAsync(() => {
    const prepareConfigSpy = spyOn<any>(component, '_prepareConfig');
    component.searchString = '';
    component.searchString = 'someSearch';
    tick(501);
    expect(prepareConfigSpy).toHaveBeenCalledTimes(1);
  }));

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

});
