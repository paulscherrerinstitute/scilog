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

describe('SnippetComponent', () => {
  let component: SnippetComponent;
  let fixture: ComponentFixture<SnippetComponent>;
  let logbookItemDataServiceSpy: any;
  let userPreferencesServiceSpy: any;

  logbookItemDataServiceSpy = jasmine.createSpyObj(
    "LogbookItemDataService", 
    ["deleteLogbookItem", "getBasesnippet", "deleteAllInProgressEditing"]
  );
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
        BrowserAnimationsModule,
        SnippetComponent
    ],
    providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
        { provide: LogbookItemDataService, useValue: logbookItemDataServiceSpy },
        { provide: UserPreferencesService, useValue: userPreferencesServiceSpy },
    ]
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

  it('should release the lock', async () => {
    component._enableEdit = {update: false, delete: false};
    component.snippetIsAccessedByAnotherUser = true;
    spyOn(component['isActionAllowed'], 'canUpdate').and.returnValue(true);
    spyOn(component['isActionAllowed'], 'canDelete').and.returnValue(true);
    spyOn(component['isActionAllowed'], 'isNotExpired').and.returnValue(true);
    await component.releaseLock();
    expect(component.enableEdit).toEqual({update: true, delete: true});
    expect(component.snippetIsAccessedByAnotherUser).toEqual(false);
    expect(component['logbookItemDataService'].deleteAllInProgressEditing)
      .toHaveBeenCalledOnceWith(snippetMock.id);
  });

  it('should add the lock', () => {
    spyOn(component, 'releaseLock');
    spyOn(window, 'clearTimeout');
    component.snippetIsAccessedByAnotherUser = false;
    component.timerId = 123;
    component._enableEdit = {update: true, delete: true};
    component.lockEdit();
    expect(component.enableEdit).toEqual({update: false, delete: false});
    expect(component.snippetIsAccessedByAnotherUser).toEqual(true);
    expect(window.clearTimeout).toHaveBeenCalledOnceWith(123);
  });

  it('should set the editing timeout', () => {
    spyOn(window, "setTimeout");
    component.timerId = null;
    component.setEditTimeout(123);
    expect(component.timerId).not.toEqual(null);
    expect(window.setTimeout).toHaveBeenCalledOnceWith(jasmine.any(Function), 123);
  });

  it('should lock the edit timeout and set by', () => {
    const avatarForUser = "aTestUserForlockEditUntilTimeout";
    spyOn(component, 'lockEdit');
    spyOn(component, 'setEditTimeout');
    component.lockEditUntilTimeout(avatarForUser);
    expect(component.avatarHash).toEqual(avatarForUser);
    expect(component.lockEdit).toHaveBeenCalledTimes(1);
    expect(component.setEditTimeout).toHaveBeenCalledTimes(1);
  });

  it('should set locked', () => {
    spyOn(component, "getLastEditedSnippet").and.returnValue({createdAt: "2023-01-01", updatedBy: "aUser"});
    spyOn(Date.prototype, "getTime").and.returnValue(1672531200001);
    spyOn(component, "lockEditUntilTimeout");
    component.setLocked();
    expect(component.lockEditUntilTimeout).toHaveBeenCalledOnceWith("aUser", component._timeoutMilliseconds - 1);
  });

  it('should release old lock', () => {
    spyOn(component, "getLastEditedSnippet").and.returnValue({createdAt: "2023-01-01", updatedBy: "aUser"});
    spyOn(Date.prototype, "getTime").and.returnValue(16725312000000);
    spyOn(component, "releaseLock");
    component.setLocked();
    expect(component.releaseLock).toHaveBeenCalledTimes(1);
  });

  it('should get undefined from last edited snippet', () => {
    const subs = [{snippetType: 'paragraph'}, {snippetType: 'paragraph'}];
    expect(component.getLastEditedSnippet(subs)).toEqual(undefined);
  });

  it('should get first toDelete from last edited snippet', () => {
    const subs = [
      { snippetType: "edit", toDelete: true, id: "1" }, 
      { snippetType: "edit", toDelete: true, id: "2" }
    ];
    expect(component.getLastEditedSnippet(subs)).toEqual(subs[0]);
  });

  it('should get last snippet from last edited snippet', () => {
    const subs = [
      {snippetType: "edit", createdAt: "2023-01-02"}, 
      {snippetType: "edit", createdAt: "2023-01-01"}, 
    ];
    expect(component.getLastEditedSnippet(subs)).toEqual(subs[0]);
  });

  it('should call setLocked after subsnippets change', () => {
    spyOn(component, "setLocked");
    component.subsnippets = [{parentId: "123"}];
    expect(component.setLocked).toHaveBeenCalledTimes(1);
  });

  [
    {input: {v: true, canUpdate: true}, output: true},
    {input: {v: true, canUpdate: false}, output: false},
    {input: {v: false, canUpdate: false}, output: false},
    {input: {v: false, canUpdate: true}, output: false},
  ].forEach((t, i) => {
    it(`should test enableEdit ${i}`, () => {
      spyOn(component['isActionAllowed'], "canUpdate").and.returnValue(t.input.canUpdate);
      spyOn(component['isActionAllowed'], "canDelete").and.returnValue(true);
      component.enableEdit = t.input.v;
      expect(component._enableEdit.update).toEqual(t.output);
    })
  })

});
