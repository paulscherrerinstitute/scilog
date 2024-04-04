import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatLegacyDialogModule as MatDialogModule, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { LogbookItemComponent } from './logbook-item.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChangeStreamService } from '@shared/change-stream.service';
import { AddContentService } from '@shared/add-content.service';
import { ViewsService } from '@shared/views.service';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { SnackbarService } from '@shared/snackbar.service';
import { ActivatedRoute } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { of } from 'rxjs';
import { ParamMap } from '@angular/router';
import { WidgetConfig } from '@model/config';
import { Views } from '@model/views';
import { Logbooks } from '@model/logbooks';
import { Datasource } from 'ngx-ui-scroll';
import { ChangeStreamNotification } from '@shared/changestreamnotification.model';
import { LogbookDataService } from '@shared/remote-data.service';
import { LogbookScrollService } from '@shared/logbook-scroll.service';
import { AppConfigService } from 'src/app/app-config.service';
import { Renderer2 } from '@angular/core';

class ChangeStreamServiceMock {

}

class AddContentServiceMock {
  currentMessage = of({});

}

class LogbookInfoServiceMock {
  getLogbookInfo(id: string) {
    return;
  }
  logbookInfo = {
    accessGroups: [],
    ownerGroup: 'p12345',
  }

}

const getConfig = () => ({});

export class ViewsServiceMock {
  widgetConfigs: WidgetConfig[] = [];
  private widgetConfigSource = new BehaviorSubject(this.widgetConfigs);
  public currentWidgetConfigs: Observable<WidgetConfig[]>;
  public views: Views[] = [];
  private _currentView: Views = null;
  personalViewIndex: number = null;
  private currentLogbook: Logbooks = null;

  defaultConfig: WidgetConfig[];
  constructor() {
    console.log("using mocking class");

    this.defaultConfig = [{
      cols: 1,
      rows: 4,
      y: 0,
      x: 0,
      config: {
        general: {
          type: 'tasks',
          title: 'Tasks'
        },
        filter: {},
        view: {}
      }
    }, {
      cols: 2,
      rows: 4,
      y: 0,
      x: 1,
      config: {
        general: {
          type: 'logbook',
          title: 'Logbook view',
        },
        filter: {
          targetId: null,
          additionalLogbooks: [],
          tags: []
        },
        view: {
          order: ['defaultOrder ASC'],
          hideMetadata: false,
          showSnippetHeader: false
        }
      }
    }];
    this.currentWidgetConfigs = of(this.defaultConfig);
    this.widgetConfigSource.next(this.defaultConfig);


  }

}

class SnackbarServiceMock {

}

class DatasourceMock {
  adapter: any;
  get: any;
  settings: any;
  constructor() {
    this.adapter = new DatasourceAdapterMock();
  }


}

class DatasourceAdapterMock {
  bof: boolean;
  eof: boolean;
  constructor() { };
  check() { }
  append() { }

}

export class QueryParams implements ParamMap {

  readonly keys: string[] = [];
  private params = new Map();

  set(name: string, value: string) {
    this.keys.push(name);
    this.params.set(name, value);
  }

  get(name: string): string | null {
    return this.has(name) ? this.params.get(name) : null;
  }

  has(name: string): boolean {
    return this.params.has(name);
  }

  getAll(name: string): string[] {
    return this.params.has(name) ? [this.params.get(name)] : [];
  }
}

describe('LogbookItemComponent', () => {
  let views: ViewsServiceMock;
  let component: LogbookItemComponent;
  let fixture: ComponentFixture<LogbookItemComponent>;
  const queryParams = new QueryParams();
  queryParams.set('type', '?');
  let viewsSpy: any;
  let logbookItemDataServiceSpy: any;
  let scrollServiceSpy: any;
  let defaultConfig: WidgetConfig[] = [{
    cols: 1,
    rows: 4,
    y: 0,
    x: 0,
    config: {
      general: {
        type: 'tasks',
        title: 'Tasks'
      },
      filter: {},
      view: {}
    }
  }, {
    cols: 2,
    rows: 4,
    y: 0,
    x: 1,
    config: {
      general: {
        type: 'logbook',
        title: 'Logbook view',
      },
      filter: {
        targetId: "12345parentID",
        additionalLogbooks: [],
        tags: []
      },
      view: {
        order: ['defaultOrder ASC'],
        hideMetadata: false,
        showSnippetHeader: false
      }
    }
  }];

  const activatedRouteMock = {
    parent: { url: of(queryParams) },
    snapshot: { queryParams: { id: '1234' } }
  };
  beforeEach(waitForAsync(() => {

    viewsSpy = jasmine.createSpyObj("ViewsService", ["getLogbookViews"]);

    logbookItemDataServiceSpy = jasmine.createSpyObj("LogbookItemDataService", ["uploadParagraph", "getCount"]);
    scrollServiceSpy = jasmine.createSpyObj("LogbookScrollService", [
      "initialize", "updateViewportEstimate", "remove", 
      "appendToEOF", "relax", "prependToBOF", "goToSnippetIndex",
    ]);
    scrollServiceSpy.appendToEOF.and.returnValue(of({}));


    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MatDialogModule,
        BrowserAnimationsModule,
      ],
      providers: [MatSnackBarModule,
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
        { provide: ChangeStreamService, useClass: ChangeStreamServiceMock },
        { provide: AddContentService, useClass: AddContentServiceMock },
        { provide: LogbookInfoService, useClass: LogbookInfoServiceMock },
        { provide: ViewsService, useValue: viewsSpy },
        { provide: SnackbarService, useClass: SnackbarServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: Datasource, useClass: DatasourceMock },
        { provide: LogbookDataService, useValue: logbookItemDataServiceSpy },
        { provide: LogbookScrollService, useValue: scrollServiceSpy },
        { provide: AppConfigService, useValue: { getConfig } },
      ],
      declarations: [LogbookItemComponent]

    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogbookItemComponent);
    component = fixture.componentInstance;
    component['views'].currentWidgetConfigs = of(defaultConfig);
    component.config = defaultConfig[1].config;
    component.configIndex = 1;
    component.logbookCount = 10;
    component['renderer'] = {setStyle: () => true} as unknown as Renderer2;
    window.innerWidth = 2000;
    fixture.detectChanges();
    // views = TestBed.get(ViewsService);
  });

  it('should create', () => {
    // component['views'].currentView.subscribe((data)=>{
    //   console.log(data);
    // })
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // PARSENOTIFICATION
  it('should parse new update notification', () => {
    spyOn(component["logbookScrollService"], "updateViewportEstimate");
    let notificationMock: ChangeStreamNotification[] = [
      { operationType: "update", content: { id: "123" } }
    ];
    component.parseNotification(notificationMock[0]);
    expect(component["logbookScrollService"].updateViewportEstimate).toHaveBeenCalledTimes(1);
  })
  // it('should remove snippet if notification has _delete_ tag', ()=>{
  //   component.dash
  //   component.datasource = new DatasourceMock();
  //   spyOn(component.datasource.adapter, 'check');
  //   let notificationMock:ChangeStreamNotification[] = [
  //     {id: "123", operationType: "update", content: {id: "123", parentId:"wrongID", snippetType: "image", tags:["_delete_123"], linkType:"quote"}}
  //   ];
  //   component.parseNotification(notificationMock[0]);
  //   expect(component.datasource.adapter.check).toHaveBeenCalledTimes(1);

  // })
  it('should parse new paragraph insert notification', () => {
    spyOn(component["logbookScrollService"], "appendToEOF");
    let notificationMock: ChangeStreamNotification[] = [
      { operationType: "insert", content: { id: "123", parentId: "12345parentID", snippetType: "paragraph", textcontent: "dummy text", linkType: "paragraph" } }
    ];
    component.parseNotification(notificationMock[0]);
    expect(component["logbookScrollService"].appendToEOF).toHaveBeenCalledTimes(1);
  })

  it('should not append paragraph if parentID does not match', () => {
    spyOn(component["logbookScrollService"], "appendToEOF");
    let notificationMock: ChangeStreamNotification[] = [
      { operationType: "insert", content: { id: "123", parentId: "wrongparentID", snippetType: "paragraph", textcontent: "dummy text", linkType: "paragraph" } }
    ];
    component.parseNotification(notificationMock[0]);
    expect(component["logbookScrollService"].appendToEOF).toHaveBeenCalledTimes(0);
  })

  it('should append paragraph with tags', () => {
    spyOn(component["logbookScrollService"], "appendToEOF");
    spyOn(component["tagService"], "addTags");
    let notificationMock: ChangeStreamNotification[] = [
      { operationType: "insert", content: { id: "123", parentId: "12345parentID", snippetType: "paragraph", textcontent: "dummy text", tags: ["alignment"], linkType: "paragraph" } }
    ];
    component.parseNotification(notificationMock[0]);
    // expect(component["tagService"].addTags).toHaveBeenCalledTimes(1);
    expect(component["logbookScrollService"].appendToEOF).toHaveBeenCalledTimes(1);
  })

  it('should not append paragraph without content', () => {
    spyOn(component["logbookScrollService"], "appendToEOF");
    spyOn(component["logbookScrollService"], "prependToBOF");
    let notificationMock: ChangeStreamNotification[] = [
      { operationType: "insert", content: {} }
    ];
    component.parseNotification(notificationMock[0]);
    expect(component["logbookScrollService"].appendToEOF).toHaveBeenCalledTimes(0);
    expect(component["logbookScrollService"].prependToBOF).toHaveBeenCalledTimes(0);
  })

  it('should parse new image insert notification', () => {
    spyOn(component["logbookScrollService"], "appendToEOF");

    let notificationMock: ChangeStreamNotification[] = [
      { operationType: "insert", content: { id: "123", snippetType: "image", tags: [], linkType: "paragraph" } }
    ];

    component.parseNotification(notificationMock[0]);
    expect(component["logbookScrollService"].appendToEOF).toHaveBeenCalledTimes(0);
  })

  // FILTER
  it('should not filter comments', () => {
    let notificationMock: ChangeStreamNotification[] = [
      { operationType: "insert", content: { id: "123", parentId: "wrongID", snippetType: "image", tags: [], linkType: "comment" } }
    ];
    expect(component.applyFilters([notificationMock[0].content]).length).toBe(1);
  })

  it('should not filter quotes', () => {
    let notificationMock: ChangeStreamNotification[] = [
      { operationType: "insert", content: { id: "123", parentId: "wrongID", snippetType: "image", tags: [], linkType: "quote" } }
    ];
    expect(component.applyFilters([notificationMock[0].content]).length).toBe(1);
  })


  it('should not filter out snippets that have the required tag', () => {
    let configWithTags = {
      general: {
        type: 'logbook',
        title: 'Logbook view',
      },
      filter: {
        targetId: "12345parentID",
        additionalLogbooks: [],
        tags: ["includeTag"]
      },
      view: {
        order: ['defaultOrder ASC'],
        hideMetadata: false,
        showSnippetHeader: false
      }
    }
    component.config = configWithTags;

    let notificationMock: ChangeStreamNotification[] = [
      { operationType: "insert", content: { id: "123", parentId: "12345parentID", snippetType: "paragraph", tags: ["includeTag"], linkType: "paragraphs" } }
    ];
    expect(component.applyFilters([notificationMock[0].content]).length).toBe(1);
  })

  it('should filter out snippets that dont have the required tag', () => {
    let configWithTags = {
      general: {
        type: 'logbook',
        title: 'Logbook view',
      },
      filter: {
        targetId: "12345parentID",
        additionalLogbooks: [],
        tags: ["includeTag"]
      },
      view: {
        order: ['defaultOrder ASC'],
        hideMetadata: false,
        showSnippetHeader: false
      }
    }
    component.config = configWithTags;

    let notificationMock: ChangeStreamNotification[] = [
      { operationType: "insert", content: { id: "123", parentId: "12345parentID", snippetType: "paragraph", tags: [], linkType: "paragraphs" } }
    ];
    expect(component.applyFilters([notificationMock[0].content]).length).toBe(0);
  })

  it('should filter out snippets that have the excluded tag', () => {
    let configWithTags = {
      general: {
        type: 'logbook',
        title: 'Logbook view',
      },
      filter: {
        targetId: "12345parentID",
        additionalLogbooks: [],
        tags: ["includeTag"],
        excludeTags: ["notWanted"]
      },
      view: {
        order: ['defaultOrder ASC'],
        hideMetadata: false,
        showSnippetHeader: false
      }
    }
    component.config = configWithTags;

    let notificationMock: ChangeStreamNotification[] = [
      { operationType: "insert", content: { id: "123", parentId: "12345parentID", snippetType: "paragraph", tags: ["notWanted"], linkType: "paragraphs" } }
    ];
    expect(component.applyFilters([notificationMock[0].content]).length).toBe(0);
  })

  it('should not filter out snippets that dont have the excluded tag', () => {
    let configWithTags = {
      general: {
        type: 'logbook',
        title: 'Logbook view',
      },
      filter: {
        targetId: "12345parentID",
        additionalLogbooks: [],
        tags: ["includeTag"],
        excludeTags: ["notWanted"]
      },
      view: {
        order: ['defaultOrder ASC'],
        hideMetadata: false,
        showSnippetHeader: false
      }
    }
    component.config = configWithTags;

    let notificationMock: ChangeStreamNotification[] = [
      { operationType: "insert", content: { id: "123", parentId: "12345parentID", snippetType: "paragraph", tags: ["includeTag"], linkType: "paragraphs" } }
    ];
    expect(component.applyFilters([notificationMock[0].content]).length).toBe(1);
  })

  it('should filter paragraphs', () => {
    let notificationMock: ChangeStreamNotification[] = [
      { operationType: "insert", content: { id: "123", parentId: "wrongID", snippetType: "image", tags: [], linkType: "paragraphs" } }
    ];
    expect(component.applyFilters([notificationMock[0].content]).length).toBe(0);
  })

  it('should submit PATCH message', () => {
    spyOn(component["logbookItemDataService"], "uploadParagraph");
    spyOn(component, "_preparePatchPayload").and.returnValue(jasmine.any(Object));

    let notificationMock: ChangeStreamNotification = { id: "123", parentId: "wrongID", snippetType: "image", tags: [], linkType: "paragraphs" };
    component["logbookInfo"].logbookInfo = { ownerGroup: "p17301", accessGroups: ["any-authenticated-user", "slscsaxs"], isPrivate: false, tags: [] }
    component.submitContent(notificationMock);
    expect(component._preparePatchPayload).toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(Object));
    expect(component["logbookItemDataService"].uploadParagraph).toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(String));
  })

  it('should submit POST message', () => {
    spyOn(component["logbookItemDataService"], "uploadParagraph");
    spyOn(component, "_preparePostPayload").and.returnValue(jasmine.any(Object));

    let notificationMock: ChangeStreamNotification = { parentId: "123546", snippetType: "image", tags: [], linkType: "paragraphs" };
    component["logbookInfo"].logbookInfo = { ownerGroup: "p17301", accessGroups: ["any-authenticated-user", "slscsaxs"], isPrivate: false, tags: [] }
    component.submitContent(notificationMock);

    expect(component._preparePostPayload).toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(Object));
    expect(component["logbookItemDataService"].uploadParagraph).toHaveBeenCalledWith(jasmine.any(Object));
  })

  it('should prepare payload with correct parameters', () => {
    let referenceEntry = { ownerGroup: "p17301", accessGroups: ["slscsaxs", "any-authenticated-user"], isPrivate: false, tags: ["alignment"] }
    let msg = { tags: ["alignment"], textcontent: "my new snippet text", files: [], isMessage: false, linkType: "paragraph" }

    let res = component._preparePatchPayload(referenceEntry, msg);
    // I guess it should only take these variables if they are not defined in the msg...
    expect(res.accessGroups).toEqual(referenceEntry.accessGroups);
    expect(res.ownerGroup).toEqual(referenceEntry.ownerGroup);
    expect(res.isPrivate).toEqual(referenceEntry.isPrivate);
    expect(res.tags).toEqual(msg.tags);
    expect(res.files).toEqual([]);
    expect(res.snippetType).toEqual("paragraph");
    expect(res.textcontent).toEqual(msg.textcontent);

    res = component._preparePostPayload(referenceEntry, msg);
    // I guess it should only take these variables if they are not defined in the msg...
    expect(res.accessGroups).toEqual(referenceEntry.accessGroups);
    expect(res.ownerGroup).toEqual(referenceEntry.ownerGroup);
    expect(res.isPrivate).toEqual(referenceEntry.isPrivate);
    expect(res.tags).toEqual(msg.tags);
    expect(res.files).toEqual([]);
    expect(res.snippetType).toEqual("paragraph");
    expect(res.linkType).toEqual(msg.linkType);
    expect(res.textcontent).toEqual(msg.textcontent);
    expect(res.parentId).not.toBeDefined();

    let msgWithParentId = { tags: ["alignment"], textcontent: "my new snippet text", files: [], isMessage: false, linkType: "paragraph", parentId: "123ParentId" }
    res = component._preparePostPayload(referenceEntry, msgWithParentId);
    expect(res.textcontent).toEqual(msgWithParentId.textcontent);
    expect(res.parentId).toEqual(msgWithParentId.parentId);
  })

  it('Should add to index', () => {
    expect(component["_indexOrder"](2)).toEqual(3);
  })

  it('Should remove from index', () => {
    component.isDescending = true;
    expect(component["_indexOrder"](2)).toEqual(8);
  })

  it('should delete logbook and update logbook count', () => {
    spyOn(component["logbookScrollService"], "remove");
    let notificationMock: ChangeStreamNotification = { operationType: "update", content: { deleted: true } };
    component.parseNotification(notificationMock);
    expect(component.logbookCount).toEqual(9);
    expect(component["logbookScrollService"].remove).toHaveBeenCalled();
  })

  it('should prepare POST edit message', () => {
    const referenceEntry = { ownerGroup: "p17301", accessGroups: ["slscsaxs", "any-authenticated-user"] };
    const msg = { id: "123", parentId: "456", snippetType: "edit", toDelete: false };
    const res = component._prepareEditPostPayload(referenceEntry, msg);
    expect(res.accessGroups).toEqual(referenceEntry.accessGroups);
    expect(res.ownerGroup).toEqual(referenceEntry.ownerGroup);
    expect(res.snippetType).toEqual(msg.snippetType);
    expect(res.parentId).toEqual(msg.id);
    expect(res.toDelete).toEqual(msg.toDelete);
  })

  it('should submit POST edit message', () => {
    spyOn(component["logbookItemDataService"], "uploadParagraph");
    const notificationMock: ChangeStreamNotification = { id: "123", parentId: "456", snippetType: "edit" };
    const referenceEntry = { ownerGroup: "p17301", accessGroups: ["any-authenticated-user", "slscsaxs"] };
    component["logbookInfo"].logbookInfo = referenceEntry;
    component.submitContent(notificationMock);
    expect(component["logbookItemDataService"].uploadParagraph).toHaveBeenCalledWith({
      ownerGroup: referenceEntry.ownerGroup,
      accessGroups: referenceEntry.accessGroups,
      snippetType: notificationMock.snippetType,
      parentId: notificationMock.id,
      toDelete: notificationMock.toDelete,
      linkType: notificationMock.linkType,
    });
  })

  it('should find the postion', async () => {
    const snippetMock = jasmine.createSpyObj("SnippetComponent", {}, {snippet: {id: "123"}});
    spyOn(component["childSnippets"], "toArray").and.returnValue([snippetMock]);
    const notificationMock: ChangeStreamNotification = { parentId: "123" };
    expect(component.findPos(notificationMock, "id", "parentId")[0]).toEqual(0);
  })

  it('should append subsnippets', async () => {
    const snippetMock = jasmine.createSpyObj(
      "SnippetComponent", 
      {}, 
      {snippet: {id: "123", updatedBy: "aFiringUser"}}
    );
    spyOn(component["childSnippets"], "toArray").and.returnValue([snippetMock]);
    const notificationMock: ChangeStreamNotification = {content: { parentId: "123", snippetType: "edit" }};
    await component.fireEditCondition(notificationMock);
    expect(snippetMock.subsnippets).toEqual([notificationMock.content]);
  })

  it('should append grand subsnippets', async () => {
    const snippetMock = jasmine.createSpyObj(
      "SnippetComponent", 
      {}, 
      {snippet: {subsnippets: [{}]}}
    );
    spyOn(component, "findPos").and.returnValue([0, 0]);
    spyOn(component["childSnippets"], "toArray").and.returnValue([snippetMock]);
    const notificationMock: ChangeStreamNotification = {content: { parentId: "123", snippetType: "edit" }};
    await component.fireEditCondition(notificationMock);
    expect(snippetMock.snippet.subsnippets[0].subsnippets).toEqual([notificationMock.content]);
  })

  it('should parse new edit notification', () => {
    spyOn(component, "fireEditCondition");
    const notificationMock: ChangeStreamNotification = {
      operationType: "insert", 
      content: { snippetType: "edit" } 
    };
    component.parseNotification(notificationMock);
    expect(component.fireEditCondition).toHaveBeenCalledTimes(1);
  })

  it('should update snippet values', () => {
    const content = { dashboardName: "new" };
    const snippet = { dashboardName: "old", parentId: "123" };
    component["updateSnippetValues"](content, snippet);
    expect(snippet.dashboardName).toEqual(content.dashboardName);
    expect(snippet.parentId).toEqual(snippet.parentId);
  });

  [
    {input: [0, 0], output: 0},
    {input: [1, 0], output: 1},
    {input: [0, 1], output: 1},
    {input: [1, 1], output: 1},
  ].forEach((t, i) => {
    it(`should test onResized ${i}`, () => {
      component._editorHeightRef = 0;
      component._snippetHeightRef = 0;
      component.snippetContainerRef = {nativeElement: {
        parentElement: {parentElement: {parentElement: {parentElement: {offsetHeight: t.input[0]}}}}
      }};
      component.editorRef = {nativeElement: {offsetHeight: t.input[1]}};
      const updateViewHeightsSpy = spyOn(component, 'updateViewHeights').and.callFake(() => true);
      const isMobileSpy = spyOn(component, 'isMobile').and.callThrough();
      if (i === 3) window.innerWidth = 10;
      component.onResized();
      expect(updateViewHeightsSpy).toHaveBeenCalledTimes(t.output);
      expect(isMobileSpy).toHaveBeenCalledTimes(1);
      expect(component.mobile).toEqual(i === 3);
    })
  })

  it('should test stillToScrollToEnd equals old formula', () => {
    const autoScrollFraction = 0.4;
    const element = {scrollHeight: 10, clientHeight: 5, scrollTop: 4} as Element;
    const oldFormula = element.scrollHeight - element.scrollTop - element.clientHeight - autoScrollFraction * element.clientHeight;
    expect(component['stillToScrollToEnd'](element, autoScrollFraction, 0)).toEqual(oldFormula);
  });

  it('should test stillToScrollToEnd >0', () => {
    const element = {scrollHeight: 10, clientHeight: 3, scrollTop: 6} as Element;
    expect(component['stillToScrollToEnd'](element, 0, 0)).toEqual(1);
  });

  it('should test stillToScrollToEnd <0', () => {
    const element = {scrollHeight: 10, clientHeight: 10, scrollTop: 4} as Element;
    expect(component['stillToScrollToEnd'](element, 0.1, 1)).toEqual(-6);
  });

  ['start', 'end'].forEach(t => {
      it(`should test scrollTo ${t}`, async () => {
      spyOn(component["logbookItemDataService"], "getCount").and.resolveTo({count: 10});
      const goToSnippetIndexSpy = spyOn(component["logbookScrollService"], "goToSnippetIndex");
      await component['scrollTo'](t as 'start' | 'end');
      expect(goToSnippetIndexSpy).toHaveBeenCalled();
      expect(goToSnippetIndexSpy.calls.mostRecent().args[0]).toEqual(t === 'end'? 9: 0);
    });
  });

  ['start', 'end'].forEach(t => {
    it(`should test isAt ${t}`, () => {
      const stillToScrollToEndSpy = spyOn<any>(component, "stillToScrollToEnd");
      component.isAt(t as 'start' | 'end');
      expect(stillToScrollToEndSpy).toHaveBeenCalledTimes(t === 'end'? 1: 0);
    });
  });

  [
    {position: 'end', scrollPosition: 'notEmpty'},
    {position: 'end', scrollPosition: undefined},
    {position: 'start', scrollPosition: 'notEmpty'},
    {position: 'start', scrollPosition: undefined},
  ].forEach((t, i) => {
    it(`should test scrollOnClickTo ${t.position}:${i}`, () => {
      spyOnProperty(component["logbookScrollService"], 'isEOF', 'get').and.returnValue(t.scrollPosition);
      spyOnProperty(component["logbookScrollService"], 'isBOF', 'get').and.returnValue(t.scrollPosition);
      const scrollWindowToSpy = spyOn<any>(component, "scrollWindowTo").and.callFake(() => true);
      const scrollToSpy = spyOn<any>(component, "scrollTo").and.callFake(() => true);
      component.scrollOnClickTo(t.position as 'end' | 'start');
      if (t.scrollPosition)
        expect(scrollWindowToSpy).toHaveBeenCalledOnceWith(t.position);
      else 
        expect(scrollToSpy).toHaveBeenCalledOnceWith(t.position);
    });
  });

  it('should set mobile', () => {
    window.innerWidth = 10;
    component.isMobile();
    expect(component.mobile).toEqual(true);
  });

  it('should open dialog with or without last', () => {
    const dialogOpenMock = spyOn(component.dialog, 'open');
    component.openDialog();
    expect(dialogOpenMock.calls.mostRecent().args[1].data['defaultTags']).toEqual(undefined);
  });

});
