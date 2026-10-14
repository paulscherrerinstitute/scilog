import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SnippetContentComponent } from './snippet-content.component';
import { AppConfigService } from 'src/app/app-config.service';

const getConfig = () => ({});

describe('SnippetContentComponent', () => {
  let component: SnippetContentComponent;
  let fixture: ComponentFixture<SnippetContentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SnippetContentComponent],
      providers: [{ provide: AppConfigService, useValue: { getConfig } }],
    }).compileComponents();
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
      id: '6061c0283587f37b851694c8',
      ownerGroup: 'p16298',
      accessGroups: ['slscsaxs'],
      snippetType: 'paragraph',
      isPrivate: false,
      defaultOrder: 1617018920128000,
      createdAt: '2021-03-29T11:55:20.128Z',
      createdBy: 'wakonig_k@psi.ch',
      updatedAt: '2021-03-29T12:43:20.630Z',
      updatedBy: 'wakonig_k@psi.ch',
      parentId: '602d4338daa91a637da213c4',
      tags: [],
      versionable: true,
      deleted: false,
      linkType: 'paragraph',
      textcontent:
        '<figure class="image image_resized"><img src="" title="60f9799b-e8bb-41c8-a1a7-5f88d35ea851"></figure>',
      files: [
        {
          style: {
            width: '87.74%',
            height: '',
          },
          fileExtension: 'image/png',
          fileHash: '60f9799b-e8bb-41c8-a1a7-5f88d35ea851',
          fileId: '6061c0283587f37b851694c7',
        },
      ],
      id_session: '438',
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
  });

  it('should load image with accessHash', () => {
    spyOn<any>(component, '_srcUrlFromImageId').and.callThrough();
    let snippetMock = {
      id: '6061c0283587f37b851694c8',
      ownerGroup: 'p16298',
      accessGroups: ['slscsaxs'],
      snippetType: 'paragraph',
      isPrivate: false,
      defaultOrder: 1617018920128000,
      createdAt: '2021-03-29T11:55:20.128Z',
      createdBy: 'wakonig_k@psi.ch',
      updatedAt: '2021-03-29T12:43:20.630Z',
      updatedBy: 'wakonig_k@psi.ch',
      parentId: '602d4338daa91a637da213c4',
      tags: [],
      versionable: true,
      deleted: false,
      linkType: 'paragraph',
      textcontent:
        '<figure class="image image_resized"><img src="" title="60f9799b-e8bb-41c8-a1a7-5f88d35ea851"></figure>',
      files: [
        {
          style: {
            width: '87.74%',
            height: '',
          },
          fileExtension: 'image/png',
          fileHash: '60f9799b-e8bb-41c8-a1a7-5f88d35ea851',
          fileId: '6061c0283587f37b851694c7',
          accessHash:
            '083f692e8a34f069ea50602167d75f1dd1a43e9f4bf7c03d9ba35cf1390bd22c80f6656eba46abbe5beb5832560050e2a996945e1a07934d0e90e98f6730e006',
        },
      ],
      id_session: '438',
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
  });

  const imageSnippet = (width: string) => ({
    textcontent:
      '<figure class="image"><img src="" title="60f9799b-e8bb-41c8-a1a7-5f88d35ea851"></figure>',
    files: [
      {
        style: { width, height: '' },
        fileExtension: 'image/png',
        fileHash: '60f9799b-e8bb-41c8-a1a7-5f88d35ea851',
        fileId: '6061c0283587f37b851694c7',
      },
    ],
  });

  it('should put the width of a resized image on its figure', () => {
    component.snippet = imageSnippet('87.74%');
    component.prepareContent();

    const figure = component.span.querySelector('figure.image');
    expect(figure.classList).toContain('image_resized');
    expect(figure.style.width).toEqual('87.74%');
    expect(figure.querySelector('img').hasAttribute('width')).toBeFalse();
  });

  it('should not set a width on an image that was not resized', () => {
    component.snippet = imageSnippet('');
    component.prepareContent();

    const figure = component.span.querySelector('figure.image');
    expect(figure.classList).not.toContain('image_resized');
    expect(figure.style.width).toEqual('');
  });

  it('should keep the width of a resized image when displayed', () => {
    component.snippet = imageSnippet('50%');
    component.prepareContent();
    fixture.detectChanges();

    const figure = component.contentRef.nativeElement.querySelector('figure.image');
    expect(figure.classList).toContain('image_resized');
    expect(figure.style.width).toEqual('50%');
  });

  it('should load file with accessHash', () => {
    let snippetMock = {
      id: '6061c0283587f37b851694c8',
      ownerGroup: 'p16298',
      accessGroups: ['slscsaxs'],
      snippetType: 'paragraph',
      isPrivate: false,
      defaultOrder: 1617018920128000,
      createdAt: '2021-03-29T11:55:20.128Z',
      createdBy: 'wakonig_k@psi.ch',
      updatedAt: '2021-03-29T12:43:20.630Z',
      updatedBy: 'wakonig_k@psi.ch',
      parentId: '602d4338daa91a637da213c4',
      tags: [],
      versionable: true,
      deleted: false,
      linkType: 'paragraph',
      textcontent:
        "<a class='fileLink' target='_blank' href='file:60f9799b-e8bb-41c8-a1a7-5f88d35ea851'>bec.png</a>",
      files: [
        {
          fileExtension: 'file/png',
          fileHash: '60f9799b-e8bb-41c8-a1a7-5f88d35ea851',
          fileId: '6061c0283587f37b851694c7',
          accessHash:
            '083f692e8a34f069ea50602167d75f1dd1a43e9f4bf7c03d9ba35cf1390bd22c80f6656eba46abbe5beb5832560050e2a996945e1a07934d0e90e98f6730e006',
        },
      ],
      id_session: '438',
    };
    component.snippet = snippetMock;
    component.prepareContent();

    expect(component.span.children.length).toBe(1);

    const link = component.span.firstChild;

    expect(link).toBeInstanceOf(HTMLAnchorElement);
    const base = link.baseURI;
    expect(link.href).toEqual(`${base}download/${snippetMock.files[0].fileId}`);
  });

  it('should show the content as it is', () => {
    spyOn(component.htmlContent, 'emit');
    component.content = '<p>some text</p>';
    expect(component.content).toEqual('<p>some text</p>');
    expect(component.htmlContent.emit).toHaveBeenCalledWith('<p>some text</p>');
  });
});
