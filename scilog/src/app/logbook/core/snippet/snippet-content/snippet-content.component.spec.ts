import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SnippetContentComponent } from './snippet-content.component';
import { AppConfigService } from 'src/app/app-config.service';

const getConfig = () => ({});

describe('SnippetContentComponent', () => {
  let component: SnippetContentComponent;
  let fixture: ComponentFixture<SnippetContentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AppConfigService, useValue: { getConfig } }
      ],
      declarations: [SnippetContentComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SnippetContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load image with fileId', () => {
    spyOn<any>(component, '_srcUrlFromImageId').and.callThrough();
    let snippetMock = {
      "id": "6061c0283587f37b851694c8",
      "ownerGroup": "p16298",
      "accessGroups": [
        "slscsaxs"
      ],
      "snippetType": "paragraph",
      "isPrivate": false,
      "defaultOrder": 1617018920128000,
      "createdAt": "2021-03-29T11:55:20.128Z",
      "createdBy": "wakonig_k@psi.ch",
      "updatedAt": "2021-03-29T12:43:20.630Z",
      "updatedBy": "wakonig_k@psi.ch",
      "parentId": "602d4338daa91a637da213c4",
      "tags": [],
      "versionable": true,
      "deleted": false,
      "linkType": "paragraph",
      "textcontent": "<figure class=\"image image_resized\"><img src=\"\" title=\"60f9799b-e8bb-41c8-a1a7-5f88d35ea851\"></figure>",
      "files": [
        {
          "style": {
            "width": "87.74%",
            "height": ""
          },
          "fileExtension": "image/png",
          "fileHash": "60f9799b-e8bb-41c8-a1a7-5f88d35ea851",
          "fileId": "6061c0283587f37b851694c7"
        }
      ],
      "id_session": "438"
    };
    component.snippet = snippetMock;
    component.prepareContent();

    expect(component.span.children.length).toBe(1);

    const figure = component.span.firstChild;
    const link = figure.firstChild;
    const img = link.firstChild;

    expect(link).toBeInstanceOf(HTMLAnchorElement);
    expect(img).toBeInstanceOf(HTMLImageElement);

    expect(link.href).toEqual(`http://localhost:3000/images/${snippetMock.files[0].fileId}`);
    expect(img.src).toEqual(`http://localhost:3000/images/${snippetMock.files[0].fileId}`);
    expect(component['_srcUrlFromImageId']).toHaveBeenCalledWith(snippetMock.files[0].fileId);
    expect(component['_srcUrlFromImageId']).toHaveBeenCalledTimes(1);

  })

  it('should load image with accessHash', () => {
    spyOn<any>(component, '_srcUrlFromImageId').and.callThrough();
    let snippetMock = {
      "id": "6061c0283587f37b851694c8",
      "ownerGroup": "p16298",
      "accessGroups": [
        "slscsaxs"
      ],
      "snippetType": "paragraph",
      "isPrivate": false,
      "defaultOrder": 1617018920128000,
      "createdAt": "2021-03-29T11:55:20.128Z",
      "createdBy": "wakonig_k@psi.ch",
      "updatedAt": "2021-03-29T12:43:20.630Z",
      "updatedBy": "wakonig_k@psi.ch",
      "parentId": "602d4338daa91a637da213c4",
      "tags": [],
      "versionable": true,
      "deleted": false,
      "linkType": "paragraph",
      "textcontent": "<figure class=\"image image_resized\"><img src=\"\" title=\"60f9799b-e8bb-41c8-a1a7-5f88d35ea851\"></figure>",
      "files": [
        {
          "style": {
            "width": "87.74%",
            "height": ""
          },
          "fileExtension": "image/png",
          "fileHash": "60f9799b-e8bb-41c8-a1a7-5f88d35ea851",
          "fileId": "6061c0283587f37b851694c7",
          "accessHash": "083f692e8a34f069ea50602167d75f1dd1a43e9f4bf7c03d9ba35cf1390bd22c80f6656eba46abbe5beb5832560050e2a996945e1a07934d0e90e98f6730e006"
        }
      ],
      "id_session": "438"
    };
    component.snippet = snippetMock;
    component.prepareContent();

    expect(component.span.children.length).toBe(1);

    const figure = component.span.firstChild;
    const link = figure.firstChild;
    const img = link.firstChild;

    expect(link).toBeInstanceOf(HTMLAnchorElement);
    expect(img).toBeInstanceOf(HTMLImageElement);

    expect(link.href).toEqual(`http://localhost:3000/images/${snippetMock.files[0].accessHash}`);
    expect(img.src).toEqual(`http://localhost:3000/images/${snippetMock.files[0].accessHash}`);
    expect(component['_srcUrlFromImageId']).toHaveBeenCalledWith(snippetMock.files[0].accessHash);
    expect(component['_srcUrlFromImageId']).toHaveBeenCalledTimes(1);

  })

  it('should load file with accessHash', () => {
    let snippetMock = {
      "id": "6061c0283587f37b851694c8",
      "ownerGroup": "p16298",
      "accessGroups": [
        "slscsaxs"
      ],
      "snippetType": "paragraph",
      "isPrivate": false,
      "defaultOrder": 1617018920128000,
      "createdAt": "2021-03-29T11:55:20.128Z",
      "createdBy": "wakonig_k@psi.ch",
      "updatedAt": "2021-03-29T12:43:20.630Z",
      "updatedBy": "wakonig_k@psi.ch",
      "parentId": "602d4338daa91a637da213c4",
      "tags": [],
      "versionable": true,
      "deleted": false,
      "linkType": "paragraph",
      "textcontent": "<a class='fileLink' target='_blank' href='file:60f9799b-e8bb-41c8-a1a7-5f88d35ea851'>bec.png</a>",
      "files": [
        {
          "fileExtension": "file/png",
          "fileHash": "60f9799b-e8bb-41c8-a1a7-5f88d35ea851",
          "fileId": "6061c0283587f37b851694c7",
          "accessHash": "083f692e8a34f069ea50602167d75f1dd1a43e9f4bf7c03d9ba35cf1390bd22c80f6656eba46abbe5beb5832560050e2a996945e1a07934d0e90e98f6730e006"
        }
      ],
      "id_session": "438"
    };
    component.snippet = snippetMock;
    component.prepareContent();

    expect(component.span.children.length).toBe(1);

    const link = component.span.firstChild;

    expect(link).toBeInstanceOf(HTMLAnchorElement);
    const base = link.baseURI;
    expect(link.href).toEqual(`${base}download/${snippetMock.files[0].fileId}`);
  })

});
