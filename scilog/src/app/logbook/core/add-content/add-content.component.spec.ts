import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatLegacyDialogModule as MatDialogModule, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { AddContentComponent, extractNotificationMessage } from './add-content.component';
import { AddContentService } from '@shared/add-content.service';
import { of } from 'rxjs';
import { ChangeStreamNotification } from '@shared/changestreamnotification.model';
import { LinkType, Paragraphs } from '@model/paragraphs';
import { AppConfigService } from 'src/app/app-config.service';

class AddContentServiceMock {
  currentMessage = of({});
  changeMessage(notification: ChangeStreamNotification) { }

}

const getConfig = () => ({});

describe('AddContentComponent', () => {
  let component: AddContentComponent;
  let fixture: ComponentFixture<AddContentComponent>;
  let notificationMock = {
    "ownerGroup": "p16298",
    "accessGroups": [
      "slscsaxs"
    ],
    "snippetType": "paragraph",
    "isPrivate": false,
    "defaultOrder": 1617025441290000,
    "createdAt": "2021-03-29T13:44:01.290Z",
    "createdBy": "wakonig_k@psi.ch",
    "updatedAt": "2021-03-29T13:44:01.290Z",
    "updatedBy": "wakonig_k@psi.ch",
    "parentId": "602d4338daa91a637da213c4",
    "tags": [],
    "versionable": true,
    "deleted": false,
    "linkType": "paragraph",
    "textcontent": "<p>reply 2</p>",
    "id": "6061d9a13587f37b851694d5",
    "subsnippets": [
      {
        "ownerGroup": "p16298",
        "accessGroups": [
          "slscsaxs"
        ],
        "snippetType": "paragraph",
        "isPrivate": false,
        "defaultOrder": 1617025441332000,
        "createdAt": "2021-03-29T13:44:01.332Z",
        "createdBy": "wakonig_k@psi.ch",
        "updatedAt": "2021-03-29T13:44:01.332Z",
        "updatedBy": "wakonig_k@psi.ch",
        "parentId": "6061d9a13587f37b851694d5",
        "tags": [],
        "versionable": true,
        "deleted": false,
        "linkType": "quote",
        "textcontent": "<p>msg 2</p>",
        "files": [],
        "id": "6061d9a13587f37b851694d6"
      }
    ]
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule, HttpClientTestingModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
        { provide: AddContentService, useClass: AddContentServiceMock },
        { provide: AppConfigService, useValue: { getConfig } },
      ],
      declarations: [AddContentComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should prepare subsnippet paragraph', () => {

    component.message = {
      "ownerGroup": "p16298",
      "accessGroups": [
        "slscsaxs"
      ],
      "snippetType": "paragraph",
      "isPrivate": false,
      "defaultOrder": 1617025441332000,
      "createdAt": "2021-03-29T13:44:01.332Z",
      "createdBy": "wakonig_k@psi.ch",
      "updatedAt": "2021-03-29T13:44:01.332Z",
      "updatedBy": "wakonig_k@psi.ch",
      "parentId": "6061d9a13587f37b851694d5",
      "tags": [],
      "versionable": true,
      "deleted": false,
      "linkType": "paragraph",
      "textcontent": "<p>msg 2</p>",
      "files": [],
      "id": "6061d9a13587f37b851694d6"
    };
    spyOn(component, 'sendMessage');
    const setFromLocalStorageSpy =  spyOn<any>(component, 'setFromLocalStorage');
    component.setupComponent();
    expect(component.notification.linkType).toEqual(LinkType.PARAGRAPH);
    expect(component.notification.snippetType).toEqual("edit");
    expect(component.notification.toDelete).toEqual(false);
    expect(component.liveFeedback).toBe(false);
    expect(component.addButtonLabel).toBe("Done");
    expect(component.sendMessage).toHaveBeenCalledTimes(1);
    expect(setFromLocalStorageSpy).toHaveBeenCalledTimes(1);
  });

  it('should get data from editor before sending', () => {
    component.setupComponent();
    component.editor = jasmine.createSpyObj("component.editor", ["getData"])
    const localStorageSpy = spyOn(localStorage, 'removeItem');
    component.addContent("");
    expect(component.editor.getData).toHaveBeenCalled();
    expect(localStorageSpy).toHaveBeenCalledTimes(2);
  });

  it('should get edit data from editor before sending', () => {
    component.setupComponent();
    component.editor = jasmine.createSpyObj("component.editor", ["getData"])
    component.notification.snippetType = 'edit';
    component.contentChanged = true;
    const setFromLocalStorageSpy = spyOn<any>(component, 'setFromLocalStorage');
    component.addContent("");
    expect(component.editor.getData).toHaveBeenCalled();
    expect(component.notification.snippetType).toEqual('paragraph');
    expect(setFromLocalStorageSpy).toHaveBeenCalledTimes(0);
  });

  it('should prepare quote', () => {
    let quoted_snippet = {
      "ownerGroup": "p16298",
      "accessGroups": [
        "slscsaxs"
      ],
      "snippetType": "paragraph",
      "isPrivate": false,
      "tags": [],
      "versionable": true,
      "deleted": false,
      "linkType": "quote",
      "textcontent": "<p>msg 2</p>",
      "files": [],
    };
    let snippet: Paragraphs = {
      parentId: "6061d9a13587f37b851694d5",
      linkType: LinkType.QUOTE,
      subsnippets: [quoted_snippet]
    };
    component.message = snippet
    component.setupComponent();
    expect(component.notification.linkType).toEqual(LinkType.QUOTE);
    expect(component.liveFeedback).toBe(false);
    expect(component.addButtonLabel).toBe("Add");
    expect(component.dialogTitle).toBe("Reply");
    expect(component.notification.subsnippets).not.toBe(snippet.subsnippets);
    expect(component.notification.subsnippets).toEqual(snippet.subsnippets);
  });

  it('should prepare comment', () => {
    let snippet: Paragraphs = {
      parentId: "6061d9a13587f37b851694d5",
      linkType: LinkType.COMMENT,
    };
    component.message = snippet
    component.setupComponent();
    expect(component.notification.linkType).toEqual(LinkType.COMMENT);
    expect(component.liveFeedback).toBe(false);
    expect(component.addButtonLabel).toBe("Add");
    expect(component.dialogTitle).toBe("Add comment");
  });

  it('should toggle metadata panel', () => {
    component.metadataPanelExpanded = true;
    component.toggleMetadataPanel();
    expect(component.metadataPanelExpanded).toBe(false);
    component.toggleMetadataPanel();
    expect(component.metadataPanelExpanded).toBe(true);
  });

  it('should update tags', () => {
    component.message = {id: 123};
    spyOn(component, 'changeChain')
    let defaultTags = ['tag1', 'tag2'];
    const setStorageSpy = spyOn(localStorage, 'setItem');
    component.updateTags(defaultTags);
    expect(component.contentChanged).toBe(true);
    expect(component.tag).toEqual(defaultTags);
    expect(component.changeChain).toHaveBeenCalledTimes(1);
    expect(setStorageSpy).toHaveBeenCalledOnceWith('123_tags', JSON.stringify(defaultTags));
  });

  it('should send message', () => {
    spyOn(component['dataService'], 'changeMessage');
    component.sendMessage();
    expect(component['dataService'].changeMessage).toHaveBeenCalledWith(component.notification);
  });

  it('should adjust figure HTML content for ckeditor', () => {
    let figureMockNoSize = '<figure class="image"><img src="source" title="d3cc95ad-45d5-48c4-ba0e-db6fcfd252ce"></figure>';

    component.data = figureMockNoSize;
    component.adjustContentForEditor();
    expect(component.data).toBe(figureMockNoSize);

    let figureMockNoSizeResized = '<figure class="image image_resized"><img src="source" title="d3cc95ad-45d5-48c4-ba0e-db6fcfd252ce"></figure>';

    component.data = figureMockNoSizeResized;
    component.adjustContentForEditor();
    expect(component.data).toBe(figureMockNoSizeResized);

    let figureMockSizeBefore = '<figure class="image image_resized"><img src="source" title="528b041f-e2d2-4164-8d37-6e0f814abecb" width="2971"></figure>"'
    let figureMockSizeAfter = '<figure class="image image_resized" style="width:2971;"><img src="source" title="528b041f-e2d2-4164-8d37-6e0f814abecb" width="2971"></figure>"'
    component.data = figureMockSizeBefore;
    component.adjustContentForEditor();
    expect(component.data).toBe(figureMockSizeAfter);
  });


  it('should adjust figure HTML content with links for ckeditor ', () => {
    let figureMockNoSize = '<figure class="image image_resized"><a target="_blank" rel="noopener noreferrer" href="source"><img src="source" title="efb7f211-ad6a-4fad-b91c-e33ebd8d410a"></a></figure>';

    component.data = figureMockNoSize;
    component.adjustContentForEditor();
    expect(component.data).toBe(figureMockNoSize);

    let figureMockSizeBefore = '<figure class="image image_resized" ><a target="_blank" rel="noopener noreferrer" href="source"><img src="source" title="efb7f211-ad6a-4fad-b91c-e33ebd8d410a" width="1234"></a></figure>';
    let figureMockSizeAfter = '<figure class="image image_resized" style="width:1234;"><a target="_blank" rel="noopener noreferrer" href="source"><img src="source" title="efb7f211-ad6a-4fad-b91c-e33ebd8d410a" width="1234"></a></figure>';
    component.data = figureMockSizeBefore;
    component.adjustContentForEditor();
    expect(component.data).toBe(figureMockSizeAfter);
    
  });

  it('should extract notification with new files', () => {
    let figureMock = '<figure class="image image_resized" style="width:79%;"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAEjgAAA2oCAIAAACtz6bAAAAACXBIWXMAAHsIAAB7CAF"></figure>"';
    let figureMockNoSrc = ['<figure class="image image_resized"><img src=""', '></figure>"']

    let message = extractNotificationMessage(figureMock);
    expect(message.files[0].style).toEqual({ "height": "", "width": "79%" });
    expect(message.files[0].style).toEqual({ "height": "", "width": "79%" });
    expect(message.files[0].fileExtension).toEqual("image/png");
    expect(message.files[0].file).toBeTruthy();
    expect(message.files[0].fileHash).toBeTruthy();
    combineHtmlFigureHash(figureMockNoSrc, message.files[0].fileHash)
    expect(message.textcontent).toEqual(combineHtmlFigureHash(figureMockNoSrc, message.files[0].fileHash));
  });

  it('should extract notification without files', () => {
    let figureMock = '<figure class="image image_resized" style="width:79%;"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAEjgAAA2oCAIAAACtz6bAAAAACXBIWXMAAHsIAAB7CAF"></figure>"'
    let figureMockNoSrc = ['<figure class="image image_resized"><img src=""', '></figure>"']
    let fileStorageMock = [{ fileHash: "myHash" }];

    let message = extractNotificationMessage(figureMock, fileStorageMock);
    expect(message.files[0].style).toEqual({ "height": "", "width": "79%" });
    expect(message.files[0].style).toEqual({ "height": "", "width": "79%" });
    expect(message.files[0].fileHash).toBeTruthy();
    combineHtmlFigureHash(figureMockNoSrc, message.files[0].fileHash)
    expect(message.textcontent).toEqual(combineHtmlFigureHash(figureMockNoSrc, message.files[0].fileHash));
  });

  it('should extract links', () => {
    let linkMock = '<p><a class="fileLink" href="file:myHash">myFile.pdf</a></p>'
    let linkStorageMock = [{ fileHash: "myHash" }];
    let message = extractNotificationMessage(linkMock, linkStorageMock);
    expect(message.files[0].fileHash).toEqual("myHash")
  });

  it('should prepare subsnippets container for quotes', () => {
    component.notification = notificationMock;
    component.prepareSubsnippetsQuoteContainer();
    expect(component.notification.subsnippets[0].id).toBeFalsy();
    expect(component.notification.subsnippets[0].parentId).toBeFalsy();
    expect(component.notification.subsnippets[0].updatedAt).toBeFalsy();
    expect(component.notification.subsnippets[0].updatedBy).toBeFalsy();
    expect(component.notification.subsnippets[0].createdAt).toBeFalsy();
    expect(component.notification.subsnippets[0].createdBy).toBeFalsy();
    expect(component.notification.subsnippets[0].defaultOrder).toBeFalsy();
    expect(component.notification.subsnippets[0].subsnippets).toBeFalsy();
    expect(component.notification.subsnippets[0].linkType).toBe(LinkType.QUOTE);
  });

  it('should send a message if notification is edit', () => {
    spyOn(component, 'sendMessage');
    component.notification.snippetType = 'edit';
    component.changeChain(notificationMock);
    expect(component.sendMessage).toHaveBeenCalledTimes(1);
  });

  it('should not send messages if notification is not edit', () => {
    spyOn(component, 'sendMessage');
    component.changeChain(notificationMock);
    expect(component.sendMessage).toHaveBeenCalledTimes(0);
  });

  it('should mark for deletion and send message', () => {
    spyOn(component, 'sendMessage');
    component.dialogTitle = 'Modify data snippet';
    component['sendEditDelitionMessage']();
    expect(component.sendMessage).toHaveBeenCalledTimes(1);
    expect(component.notification.toDelete).toEqual(true);
  });

  it('should not mark for deletion and send message', () => {
    spyOn(component, 'sendMessage');
    component.sendEditDelitionMessage();
    expect(component.sendMessage).toHaveBeenCalledTimes(0);
  });

  
  it('should unset the logbook on unload', () => {
    spyOn(component, 'sendEditDelitionMessage');
    const unloadEvent = new Event('unload');
    window.dispatchEvent(unloadEvent);
    expect(component.sendEditDelitionMessage).toHaveBeenCalledTimes(1);
  });

  it('should unset the logbook on destroy', () => {
    spyOn(component, 'sendEditDelitionMessage');
    component.ngOnDestroy();
    expect(component.sendEditDelitionMessage).toHaveBeenCalledTimes(1);
  });

  [
    {input: {message: 'sameData', tags: '["sameData"]'}, output: 'No unsaved edit in current session'},
    {input: {message: 'edit', tags: '["sameData"]'}, output: undefined},
    {input: {message: 'sameData', tags: '["edit"]'}, output: undefined},
  ].forEach((t, i) => {
    it(`should test noUnsavedEditTooltip ${i}`, () => {
      component.data = 'sameData';
      component.tag = ['sameData'];
      component.lastEdit = t.input;
      expect(component.noUnsavedEditTooltip()).toEqual(t.output);
    });
  });

  it('should test setFromLocalStorage', () => {
    component.message = {id: 123};
    const localStorageSpy = spyOn(localStorage, 'getItem');
    component['setFromLocalStorage']();
    expect(localStorageSpy).toHaveBeenCalledTimes(2);
  });

  [
    {input: {message: 'edit', tags: undefined}, output: {message: 'edit', tags: []}},
    {input: {message: undefined, tags: '["edit"]'}, output: {message: 'old', tags: ['edit']}},
    {input: {message: 'edit', tags: '["edit"]'}, output: {message: 'edit', tags: ['edit']}},
    {input: {message: undefined, tags: undefined}, output: {message: 'old', tags: []}},
  ].forEach((t, i) => {
    it(`should test loadLastUnsavedEdit ${i}`, () => {
      component.lastEdit = t.input;
      component.data = 'old';
      component.editor = jasmine.createSpyObj("component.editor", ["setData"]);
      component.loadLastUnsavedEdit();
      expect(component.data).toEqual(t.output.message);
      expect(component.tag).toEqual(t.output.tags);
    });
  });

  it('should test onChange', () => {
    component.message = {id: 123};
    const editor = {getData: () => 'edit'};
    const localStorageSpy = spyOn(localStorage, 'setItem');
    component.onChange({editor: editor});
    expect(localStorageSpy).toHaveBeenCalledOnceWith('123_message', 'edit');
  });

  function combineHtmlFigureHash(figureMock: string[], hash: string) {
    return (figureMock[0] + ' title="' + hash + '"' + figureMock[1]);
  }

});
