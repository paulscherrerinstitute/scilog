import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {MatMenuModule} from '@angular/material/menu';
import { SnippetComponent } from './snippet.component';
import { Basesnippets } from '@model/basesnippets';
import { Paragraphs } from '@model/paragraphs';
import { LogbookItemDataService } from '@shared/remote-data.service';
import { of } from 'rxjs';
import { UserPreferencesService } from '@shared/user-preferences.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


class UserPreferencesMock {
  userInfo = {
    roles: ["roles"]

  }
}


describe('SnippetComponent', () => {
  let component: SnippetComponent;
  let fixture: ComponentFixture<SnippetComponent>;
  let logbookItemDataServiceSpy:any;
  let userPreferencesServiceSpy:any;

  logbookItemDataServiceSpy = jasmine.createSpyObj("LogbookItemDataService", ["deleteLogbookItem"]);
  logbookItemDataServiceSpy.deleteLogbookItem.and.returnValue(of({}));

  userPreferencesServiceSpy = jasmine.createSpyObj("UserPreferencesService", ["userInfo"]);
  userPreferencesServiceSpy.userInfo.and.returnValue({"username": "test_username", "roles": ["roles"]});

  let snippetMock:Paragraphs = {
      "id" : "6058c1dbd9574d6f51e4b650",
      "ownerGroup" : "p17642",
      "accessGroups" : [
        "slscsaxs"
      ],
      "snippetType" : "paragraph",
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
      "textcontent" : "<p>test</p>"
    
  }
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,         
        MatMenuModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
        {provide: LogbookItemDataService, useValue: logbookItemDataServiceSpy},
        {provide: UserPreferencesService, useValue: userPreferencesServiceSpy},
      ],
      declarations: [ SnippetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SnippetComponent);
    component = fixture.componentInstance;
    component["snippet"] = snippetMock;
    component["snippetContainerRef"] = {
      nativeElement:{
        parentElement:{
          parentElement:{
            parentElement:{
              parentElement:{
                scrollHeight: 400
              }
            }
          }
        }
      }
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
