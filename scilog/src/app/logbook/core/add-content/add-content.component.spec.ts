import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {HttpClientTestingModule} from '@angular/common/http/testing'
import { AddContentComponent, extractNotificationMessage } from './add-content.component';
import { AddContentService } from '@shared/add-content.service';
import { of } from 'rxjs';
import { ChangeStreamNotification } from '@shared/changestreamnotification.model';
import { LinkType } from '@model/paragraphs';
import { AppConfigService } from 'src/app/app-config.service';

class AddContentServiceMock {
  currentMessage = of({});
  changeMessage(notification: ChangeStreamNotification){}

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
      imports: [MatDialogModule,HttpClientTestingModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
        { provide: AddContentService, useClass: AddContentServiceMock},
        { provide: AppConfigService, useValue: { getConfig } }
      ],
      declarations: [ AddContentComponent ]
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

  it('should toggle metadata panel', ()=>{
    component.metadataPanelExpanded = true;
    component.toggleMetadataPanel();
    expect(component.metadataPanelExpanded).toBe(false);
    component.toggleMetadataPanel();
    expect(component.metadataPanelExpanded).toBe(true);
  })

  it('should update tags', ()=>{
    spyOn(component, 'changeChain')
    let defaultTags = ['tag1', 'tag2'];
    component.updateTags(defaultTags);
    expect(component.tag).toEqual(defaultTags);
    expect(component.changeChain).toHaveBeenCalledTimes(1);
  })

  it('should send message', ()=> {
    spyOn(component['dataService'], 'changeMessage');
    component.sendMessage();
    expect(component['dataService'].changeMessage).toHaveBeenCalledWith(component.notification);
  })

  it('should adjust figure HTML content for ckeditor', ()=>{
    let figureMockNoSize = '<figure class="image image_resized"><img src="source" title="d3cc95ad-45d5-48c4-ba0e-db6fcfd252ce"></figure>'

    component.data = figureMockNoSize;
    component.adjustContentForEditor();
    expect(component.data).toBe(figureMockNoSize);

    let figureMockSize = '<figure class="image image_resized" style="width:2971;"><img src="source" title="528b041f-e2d2-4164-8d37-6e0f814abecb" width="2971"></figure>"'
    component.data = figureMockSize;
    component.adjustContentForEditor();
    expect(component.data).toBe(figureMockSize);

  })

  // TODO: try to make work after angular upgrade
  // it('should detect new files', ()=>{
  //   let dataMock = '<figure class="image image_resized" style="width:79%;"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAEjgAAA2oCAIAAACtz6bAAAAACXBIWXMAAHsIAAB7CAF"></figure>"'
  //   component.data = dataMock;
  //   let dataMockMod = '<figure class="image image_resized" style="width:79%;"><img src="data:image/png;base64,iVBORw0KGgoAAAANSIhEUgAAEjgAAA2oCAIAAACtz6bAAAAACXBIWXMAAHsIAAB7CAF"></figure>"'
  //   expect(component.fileChanged(dataMockMod)).toBeTruthy();
  //   expect(component.fileChanged(dataMock)).toBeFalsy();
  // })

  // it('should extract notification with new files', ()=>{
  //   let figureMock = '<figure class="image image_resized" style="width:79%;"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAEjgAAA2oCAIAAACtz6bAAAAACXBIWXMAAHsIAAB7CAF"></figure>"'
  //   let figureMockNoSrc = ['<figure class="image image_resized"><img src=""', '></figure>"']

  //   let message = extractNotificationMessage(figureMock);
  //   expect(message.files[0].style).toEqual({"height": "", "width": "79%"});
  //   expect(message.files[0].style).toEqual({"height": "", "width": "79%"});
  //   expect(message.files[0].fileExtension).toEqual("image/png");
  //   expect(message.files[0].file).toBeTruthy();
  //   expect(message.files[0].fileHash).toBeTruthy();
  //   combineHtmlFigureHash(figureMockNoSrc, message.files[0].fileHash)
  //   expect(message.textcontent).toEqual(combineHtmlFigureHash(figureMockNoSrc, message.files[0].fileHash));

  // })

  // it('should extract notification without files', ()=>{
  //   let figureMock = '<figure class="image image_resized" style="width:79%;"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAEjgAAA2oCAIAAACtz6bAAAAACXBIWXMAAHsIAAB7CAF"></figure>"'
  //   let figureMockNoSrc = ['<figure class="image image_resized"><img src=""', '></figure>"']
  //   let fileStorageMock = [{fileHash: "myHash"}];

  //   let message = extractNotificationMessage(figureMock, false, fileStorageMock);
  //   expect(message.files[0].style).toEqual({"height": "", "width": "79%"});
  //   expect(message.files[0].style).toEqual({"height": "", "width": "79%"});
  //   expect(message.files[0].fileHash).toBeTruthy();
  //   combineHtmlFigureHash(figureMockNoSrc, message.files[0].fileHash)
  //   expect(message.textcontent).toEqual(combineHtmlFigureHash(figureMockNoSrc, message.files[0].fileHash));

  // })

  // it('should extract links', ()=>{
  //   let linkMock = '<p><a class="fileLink" href="file:myHash">myFile.pdf</a></p>'
  //   let linkStorageMock = [{fileHash: "myHash"}];
  //   let message = extractNotificationMessage(linkMock, false, linkStorageMock);
  //   expect(message.files[0].fileHash).toEqual("myHash")
  // })

  it('should prepare subsnippets container for quotes', ()=>{
    
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

  })

  it('should send a message during liveFeedback', ()=>{
    spyOn(component, 'sendMessage');
    component.liveFeedback = true;
    component.message = notificationMock;
    component.changeChain(notificationMock)
    expect(component.sendMessage).toHaveBeenCalledTimes(1);


  })

  it('should not send messages if liveFeedback is disabled', ()=>{
    spyOn(component, 'sendMessage');
    component.liveFeedback = false;
    component.changeChain(notificationMock)
    expect(component.sendMessage).toHaveBeenCalledTimes(0);
  })

  function combineHtmlFigureHash(figureMock:string[], hash:string){
    return (figureMock[0] + ' title="' + hash + '"' + figureMock[1]);
  }

});
