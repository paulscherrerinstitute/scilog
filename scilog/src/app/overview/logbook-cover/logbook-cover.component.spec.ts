import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { LogbookWidgetComponent } from './logbook-cover.component';
import { LogbookItemDataService } from '@shared/remote-data.service';
import { UserPreferencesService } from '@shared/user-preferences.service';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { of } from 'rxjs';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { Logbooks } from '@model/logbooks';
import { MatCardType } from '../overview.component';

class UserPreferencesMock {
  userInfo = {
    roles: ["roles"]

  }
}

describe('LogbookWidgetComponent', () => {
  let component: LogbookWidgetComponent;
  let fixture: ComponentFixture<LogbookWidgetComponent>;
  let logbookSpy:any;
  let logbookItemDataSpy:any;

  let logbookMock:Logbooks = {
    "id" : "6058c1dbd9574d6f51e4b650",
    "ownerGroup" : "p17642",
    "accessGroups" : [
      "slscsaxs"
    ],
    "snippetType" : "logbook",
    "isPrivate" : false,
    "defaultOrder" : 1616429531087000,
    "createdAt" : "2021-03-22T16:12:11.087Z",
    "createdBy" : "wakonig_k@psi.ch",
    "updatedAt" : "2021-03-22T16:12:11.087Z",
    "updatedBy" : "wakonig_k@psi.ch",
    "parentId" : "602d438ddaa91a637da2181a",
    "tags" : [ ],
    "versionable" : true,
    "deleted" : false,
    "updateACL": ["updateRole"],
    "deleteACL": ["deleteRole"],
}

  logbookSpy = jasmine.createSpyObj("LogbookInfoService", ["logbookInfo"]);
  logbookSpy.logbookInfo.and.returnValue([]);

  logbookItemDataSpy = jasmine.createSpyObj("LogbookItemDataService", ["getFile", "getImage"]);
  logbookItemDataSpy.getFile.and.returnValue(of({}));

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: LogbookInfoService, useValue: logbookSpy},
        {provide: UserPreferencesService, useClass: UserPreferencesMock},
        {provide: LogbookItemDataService, useValue: logbookItemDataSpy},
      ],
      imports: [MatMenuModule],
      declarations: [ LogbookWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogbookWidgetComponent);
    component = fixture.componentInstance;
    component["logbook"] = logbookMock;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should test enableActions', () => {
    const isAnyEditAllowedSpy = spyOn(component['isActionAllowed'], 'isAnyEditAllowed');
    component['enableActions']();
    expect(isAnyEditAllowedSpy).toHaveBeenCalledTimes(1);
  });

  ['logbook-module', 'logbook-headline'].forEach(t => {
    it(`should test ng-template: ${t}`, () => {
      component.matView = t as MatCardType;
      fixture.detectChanges();
      expect(fixture.debugElement.nativeElement.querySelector(`.${t}`)).toEqual(jasmine.anything());
    })
  })

  it('should test on doubleClick', () => {
    component.matView = 'logbook-headline';
    const selectOnDoubleClickSpy = spyOn(component, 'selectOnDoubleClick');
    fixture.detectChanges();
    const cardContainer = fixture.debugElement.nativeElement.querySelector('.card-container');
    cardContainer.dispatchEvent(new Event('click'));
    cardContainer.dispatchEvent(new Event('dblclick'));
    expect(selectOnDoubleClickSpy).toHaveBeenCalledTimes(1);
  });

});
