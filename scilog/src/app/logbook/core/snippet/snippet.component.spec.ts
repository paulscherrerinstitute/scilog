import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef, MatDialogConfig } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { SnippetComponent } from './snippet.component';
import { Paragraphs, LinkType } from '@model/paragraphs';
import { LogbookItemDataService } from '@shared/remote-data.service';
import { of } from 'rxjs';
import { UserPreferencesService } from '@shared/user-preferences.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WidgetItemConfig } from '@model/config';


class UserPreferencesMock {
  userInfo = {
    roles: ["roles"]

  }
}

describe('SnippetComponent', () => {
  let component: SnippetComponent;
  let fixture: ComponentFixture<SnippetComponent>;
  let logbookItemDataServiceSpy: any;
  let userPreferencesServiceSpy: any;

  logbookItemDataServiceSpy = jasmine.createSpyObj("LogbookItemDataService", ["deleteLogbookItem", "getBasesnippet"]);
  logbookItemDataServiceSpy.deleteLogbookItem.and.returnValue(of({}));
  logbookItemDataServiceSpy.getBasesnippet.and.returnValue({ "parentId": "602d438ddaa91a637da2181a" });

  userPreferencesServiceSpy = jasmine.createSpyObj("UserPreferencesService", ["userInfo"]);
  userPreferencesServiceSpy.userInfo.and.returnValue({ "username": "test_username", "roles": ["roles"] });

  let snippetMock: Paragraphs = {
    "id": "6058c1dbd9574d6f51e4b650",
    "ownerGroup": "p17642",
    "accessGroups": [
      "slscsaxs"
    ],
    "snippetType": "paragraph",
    "isPrivate": false,
    "defaultOrder": 1616429531087000,
    "createdAt": "2021-03-22T16:12:11.087Z",
    "createdBy": "wakonig_k@psi.ch",
    "updatedAt": "2021-03-22T16:12:11.087Z",
    "updatedBy": "wakonig_k@psi.ch",
    "parentId": "602d438ddaa91a637da2181a",
    "tags": [],
    "versionable": true,
    "deleted": false,
    "textcontent": "<p>test</p>"

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
        { provide: LogbookItemDataService, useValue: logbookItemDataServiceSpy },
        { provide: UserPreferencesService, useValue: userPreferencesServiceSpy },
      ],
      declarations: [SnippetComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SnippetComponent);
    component = fixture.componentInstance;
    component["snippet"] = snippetMock;
    component["snippetContainerRef"] = {
      nativeElement: {
        parentElement: {
          parentElement: {
            parentElement: {
              parentElement: {
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

  it('should add citation from comment', waitForAsync(() => {
    fixture.detectChanges();
    let snippet_input = {
      "snippetType": "paragraph",
      "isPrivate": false,
      "expiresAt": "2023-02-11T18:22:07.609Z",
      "createACL": [
        "p20216"
      ],
      "readACL": [
        "p20216"
      ],
      "updateACL": [
        "p20216"
      ],
      "deleteACL": [
        "slspollux-nanoxas"
      ],
      "shareACL": [
        "slspollux-nanoxas",
        "p20216"
      ],
      "adminACL": [
        "slspollux-nanoxas"
      ],
      "tags": [],
      "versionable": true,
      "deleted": false,
      "linkType": "comment",
      "textcontent": "<p>test</p><p>&nbsp;</p>",
      "files": [],
      "ownerGroup": "p20216",
      "accessGroups": [
        "p20216"
      ],
      "parentId": "6058c1dbd9574d6f51e4b650",
      "id": "7058c1dbd9574d6f51e4b65c"

    };
    component["snippet"] = snippet_input;

    fixture.whenStable().then(async () => {
      spyOn(component, "openAddContentComponent");
      await component.addCitation()
      const dialogConfig = new MatDialogConfig()
      dialogConfig.autoFocus = true;
      let snippet: Paragraphs = {
        parentId: "602d438ddaa91a637da2181a",
        linkType: LinkType.QUOTE,
        subsnippets: [snippet_input],
      }
      let config: WidgetItemConfig = {
        general: {},
        filter: {},
        view: {}
      }
      dialogConfig.data = { "snippet": snippet, "defaultTags": snippet_input.tags, "config": config };

      expect(component.openAddContentComponent).toHaveBeenCalledOnceWith(dialogConfig)
    })

  }));

  it('should add citation from paragraph', waitForAsync(() => {
    fixture.detectChanges();
    let snippet_input = {
      "snippetType": "paragraph",
      "isPrivate": false,
      "expiresAt": "2023-02-11T18:22:07.609Z",
      "createACL": [
        "p20216"
      ],
      "readACL": [
        "p20216"
      ],
      "updateACL": [
        "p20216"
      ],
      "deleteACL": [
        "slspollux-nanoxas"
      ],
      "shareACL": [
        "slspollux-nanoxas",
        "p20216"
      ],
      "adminACL": [
        "slspollux-nanoxas"
      ],
      "tags": [],
      "versionable": true,
      "deleted": false,
      "linkType": "paragraph",
      "textcontent": "<p>test</p><p>&nbsp;</p>",
      "files": [],
      "ownerGroup": "p20216",
      "accessGroups": [
        "p20216"
      ],
      "parentId": "6058c1dbd9574d6f51e4b650",
      "id": "7058c1dbd9574d6f51e4b65c"

    };
    component["snippet"] = snippet_input;

    fixture.whenStable().then(async () => {
      spyOn(component, "openAddContentComponent");
      await component.addCitation()
      const dialogConfig = new MatDialogConfig()
      dialogConfig.autoFocus = true;
      let snippet: Paragraphs = {
        parentId: snippet_input.parentId,
        linkType: LinkType.QUOTE,
        subsnippets: [snippet_input],
      }
      let config: WidgetItemConfig = {
        general: {},
        filter: {},
        view: {}
      }
      dialogConfig.data = { "snippet": snippet, "defaultTags": snippet_input.tags, "config": config };

      expect(component.openAddContentComponent).toHaveBeenCalledOnceWith(dialogConfig)
    })

  }));

});
