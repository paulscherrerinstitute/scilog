import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LogbookItemComponent } from './logbook-item.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChangeStreamService } from '@shared/change-stream.service';
import { AddContentService } from '@shared/add-content.service';
import { ViewsService } from '@shared/views.service';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SnackbarService } from '@shared/snackbar.service';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { of } from 'rxjs';
import { ParamMap } from '@angular/router';
import { WidgetConfig } from '@model/config';
import { Views } from '@model/views';
import { Logbooks } from '@model/logbooks';
import { Datasource, IDatasource } from 'ngx-ui-scroll';
import { ChangeStreamNotification } from '@shared/changestreamnotification.model';
import { QueryList } from '@angular/core';
import { SnippetComponent } from '@shared/snippet/snippet.component';
import { LogbookDataService } from '@shared/remote-data.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TagService } from '@shared/tag.service';
import { LogbookScrollService } from '@shared/logbook-scroll.service';

class ChangeStreamServiceMock {

}

class AddContentServiceMock {
  currentMessage = of({});

}

class LogbookInfoServiceMock {
  getLogbookInfo(id:string){
    return;
  }
  logbookInfo = {
    accessGroups: [],
    ownerGroup: 'p12345',
  }

}

export class ViewsServiceMock {
  widgetConfigs: WidgetConfig[] = [];
  private widgetConfigSource = new BehaviorSubject(this.widgetConfigs);
  public currentWidgetConfigs:Observable<WidgetConfig[]>;
  public views: Views[] = [];
  private _currentView: Views = null;
  personalViewIndex: number = null;
  private currentLogbook: Logbooks = null;

  defaultConfig: WidgetConfig[];
  constructor(){
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
  constructor(){
    this.adapter = new DatasourceAdapterMock();
  }
  

}

class DatasourceAdapterMock{
  bof:boolean;
  eof:boolean;
  constructor(){};
  check(){}
  append(){}
  
}

class ChildSnippetsMock {
  // constructor(){}
  toArray(){
    return [
      {snippet: {subsnippets: []}}
    ]
  }
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
  let viewsSpy:any;
  let logbookItemDataServiceSpy: any;
  let scrollServiceSpy:any;
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
     snapshot: { queryParams: {id: '1234'}}
  };
  beforeEach(async(() => {

    viewsSpy = jasmine.createSpyObj("ViewsService", ["getLogbookViews"]);

    logbookItemDataServiceSpy = jasmine.createSpyObj("LogbookItemDataService", ["getDataBuffer", "uploadParagraph"]);
    scrollServiceSpy = jasmine.createSpyObj("LogbookScrollService", ["initialize", "updateViewportEstimate", "remove", "appendToEOF", "relax", "isBOF", "isEOF", "prependToBOF"]);
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
        { provide: Datasource, useClass: DatasourceMock},
        { provide: LogbookDataService, useValue: logbookItemDataServiceSpy},
        { provide: LogbookScrollService, useValue: scrollServiceSpy}



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
  it('should parse new update notification', ()=>{
    spyOn(component["logbookScrollService"], "updateViewportEstimate");
    let notificationMock:ChangeStreamNotification[] = [
      {operationType: "update", content: {id: "123"}}
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
  it('should parse new paragraph insert notification', ()=>{
    spyOn(component["logbookScrollService"], "appendToEOF");
    let notificationMock:ChangeStreamNotification[] = [
      {operationType: "insert", content: {id: "123", parentId: "12345parentID", snippetType: "paragraph", textcontent:"dummy text", linkType:"paragraph"}}
    ];
    component.parseNotification(notificationMock[0]);
    expect(component["logbookScrollService"].appendToEOF).toHaveBeenCalledTimes(1);
  })

  it('should not append paragraph if parentID does not match', ()=>{
    spyOn(component["logbookScrollService"], "appendToEOF");
    let notificationMock:ChangeStreamNotification[] = [
      {operationType: "insert", content: {id: "123", parentId: "wrongparentID", snippetType: "paragraph", textcontent:"dummy text", linkType:"paragraph"}}
    ];
    component.parseNotification(notificationMock[0]);
    expect(component["logbookScrollService"].appendToEOF).toHaveBeenCalledTimes(0);
  })

  it('should append paragraph with tags', ()=>{
    spyOn(component["logbookScrollService"], "appendToEOF");
    spyOn(component["tagService"], "addTags");
    let notificationMock:ChangeStreamNotification[] = [
      {operationType: "insert", content: {id: "123", parentId: "12345parentID", snippetType: "paragraph", textcontent:"dummy text", tags:["alignment"], linkType:"paragraph"}}
    ];
    component.parseNotification(notificationMock[0]);
    // expect(component["tagService"].addTags).toHaveBeenCalledTimes(1);
    expect(component["logbookScrollService"].appendToEOF).toHaveBeenCalledTimes(1);
  })

  it('should not append paragraph without content', ()=>{
    spyOn(component["logbookScrollService"], "appendToEOF");
    spyOn(component["logbookScrollService"], "prependToBOF");
    let notificationMock:ChangeStreamNotification[] = [
      {operationType: "insert", content: {}}
    ];
    component.parseNotification(notificationMock[0]);
    expect(component["logbookScrollService"].appendToEOF).toHaveBeenCalledTimes(0);
    expect(component["logbookScrollService"].prependToBOF).toHaveBeenCalledTimes(0);
  })

  it('should parse new image insert notification', ()=>{
    spyOn(component["logbookScrollService"], "appendToEOF");

    let notificationMock:ChangeStreamNotification[] = [
      {operationType: "insert", content: {id: "123", snippetType: "image", tags:[], linkType:"paragraph"}}
    ];

    component.parseNotification(notificationMock[0]);
    expect(component["logbookScrollService"].appendToEOF).toHaveBeenCalledTimes(0);
  })

  // FILTER
  it('should not filter comments', ()=>{
    let notificationMock:ChangeStreamNotification[] = [
      {operationType: "insert", content: {id: "123", parentId:"wrongID", snippetType: "image", tags:[], linkType:"comment"}}
    ];
    expect(component.applyFilters([notificationMock[0].content]).length).toBe(1);
  })

  it('should not filter quotes', ()=>{
    let notificationMock:ChangeStreamNotification[] = [
      {operationType: "insert", content: {id: "123", parentId:"wrongID", snippetType: "image", tags:[], linkType:"quote"}}
    ];
    expect(component.applyFilters([notificationMock[0].content]).length).toBe(1);
  })

  it('should filter paragraphs', ()=>{
    let notificationMock:ChangeStreamNotification[] = [
      {operationType: "insert", content: {id: "123", parentId:"wrongID", snippetType: "image", tags:[], linkType:"paragraphs"}}
    ];
    expect(component.applyFilters([notificationMock[0].content]).length).toBe(0);
  })

  it('should submit PATCH message', ()=>{
    spyOn(component["logbookItemDataService"], "uploadParagraph");
    spyOn(component, "_preparePatchPayload").and.returnValue(jasmine.any(Object));

    let notificationMock:ChangeStreamNotification = {id: "123", parentId:"wrongID", snippetType: "image", tags:[], linkType:"paragraphs"};
    component["logbookInfo"].logbookInfo = {ownerGroup: "p17301", accessGroups: ["customer", "slscsaxs"], isPrivate: false, tags: []}
    component.submitContent(notificationMock);
    expect(component._preparePatchPayload).toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(Object));
    expect(component["logbookItemDataService"].uploadParagraph).toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(String));
  })

  it('should submit POST message', ()=>{
    spyOn(component["logbookItemDataService"], "uploadParagraph");
    spyOn(component, "_preparePostPayload").and.returnValue(jasmine.any(Object));

    let notificationMock:ChangeStreamNotification= {parentId:"123546", snippetType: "image", tags:[], linkType:"paragraphs"};
    component["logbookInfo"].logbookInfo = {ownerGroup: "p17301", accessGroups: ["customer", "slscsaxs"], isPrivate: false, tags: []}
    component.submitContent(notificationMock);

    expect(component._preparePostPayload).toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(Object));
    expect(component["logbookItemDataService"].uploadParagraph).toHaveBeenCalledWith(jasmine.any(Object));
  })

  it('should prepare payload with correct parameters', ()=>{
    let referenceEntry = {ownerGroup: "p17301", accessGroups: ["slscsaxs", "customer"], isPrivate: false, tags: ["alignment"]}
    let msg = {tags: ["alignment"], textcontent: "my new snippet text", files: [], isMessage: false, linkType: "paragraph"}

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

    let msgWithParentId = {tags: ["alignment"], textcontent: "my new snippet text", files: [], isMessage: false, linkType: "paragraph", parentId: "123ParentId"}
    res = component._preparePostPayload(referenceEntry, msgWithParentId);
    expect(res.textcontent).toEqual(msgWithParentId.textcontent);
    expect(res.parentId).toEqual(msgWithParentId.parentId);
  })


});
