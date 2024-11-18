import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { LogbookWidgetComponent } from './logbook-cover.component';
import { LogbookItemDataService } from '@shared/remote-data.service';
import { UserPreferencesService } from '@shared/user-preferences.service';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { of } from 'rxjs';
import { Logbooks } from '@model/logbooks';

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

});
