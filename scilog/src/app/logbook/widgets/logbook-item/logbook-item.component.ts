import { ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { ChangeStreamService } from '@shared/change-stream.service';
import { ChangeStreamNotification } from '@shared/changestreamnotification.model'
import { HttpClient } from '@angular/common/http';
import { AddContentComponent } from '@shared/add-content/add-content.component';
import { AddContentService } from '@shared/add-content.service';
import { MatLegacyDialogConfig as MatDialogConfig, MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { v4 as uuid } from 'uuid';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';

import { Basesnippets, Filecontainer } from '@model/basesnippets';
import { SnippetComponent } from '@shared/snippet/snippet.component';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { Subject, Subscription, BehaviorSubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ViewsService } from '@shared/views.service';
import * as ClassicEditor from '@shared/ckeditor/ckeditor5/build/ckeditor';
import { CKEditorComponent } from '@shared/ckeditor/ckeditor5/build/ckeditor';
import { CK5ImageUploadAdapter } from '@shared/ckeditor/ck5-image-upload-adapter';
import { extractNotificationMessage } from '@shared/add-content/add-content.component';
import { UserPreferencesService } from '@shared/user-preferences.service';
import { debounceTime } from 'rxjs/operators';
import { TagEditorComponent } from '@shared/tag-editor/tag-editor.component';
import { LogbookItemDataService } from '@shared/remote-data.service';
import { Hotkeys } from '@shared/hotkeys.service';
import { WidgetItemConfig } from '@model/config';
import { TagService } from '@shared/tag.service';
import { CKeditorConfig } from '@shared/ckeditor/ckeditor-config';
import { LogbookScrollService } from '@shared/logbook-scroll.service';
import { ScrollToElementService } from '@shared/scroll-to-element.service';
import { LinkType } from 'src/app/core/model/paragraphs';


@Component({
  selector: 'logbook-item',
  templateUrl: './logbook-item.component.html',
  styleUrls: ['./logbook-item.component.scss'],
  providers: [ChangeStreamService, LogbookScrollService],
  animations: [
    trigger('rotatedState', [
      state('default', style({ transform: 'rotate(0)' })),
      state('rotated', style({ transform: 'rotate(225deg)' })),
      transition('rotated => default', animate('200ms ease-out')),
      transition('default => rotated', animate('200ms ease-in'))
    ]),
    trigger('buttonEdit', [
      state('start', style({ bottom: '-50px', right: '15px', opacity: '0', transform: 'translateY(-100%)' })),
      state('end', style({ bottom: '90px', right: '15px', opacity: '1' })),
      transition('start => end', animate('200ms ease-out')),
      transition('end => start', animate('200ms ease-in'))
    ]),
    trigger('buttonPhoto', [
      state('start', style({ bottom: '-50px', right: '15px', opacity: '0', transform: 'translateY(-100%)' })),
      state('end', style({ bottom: '170px', right: '15px', opacity: '1' })),
      transition('start => end', animate('200ms ease-out')),
      transition('end => start', animate('200ms ease-in'))
    ]),
    trigger('buttonTask', [
      state('start', style({ bottom: '-50px', right: '15px', opacity: '0', transform: 'translateY(-100%)' })),
      state('end', style({ bottom: '250px', right: '15px', opacity: '1' })),
      transition('start => end', animate('200ms ease-out')),
      transition('end => start', animate('200ms ease-in'))
    ]),
    trigger('buttonFile', [
      state('start', style({ bottom: '-50px', right: '15px', opacity: '0', transform: 'translateY(-100%)' })),
      state('end', style({ bottom: '330px', right: '15px', opacity: '1' })),
      transition('start => end', animate('200ms ease-out')),
      transition('end => start', animate('200ms ease-in'))
    ]),
    trigger('searchExpand', [
      state('start', style({ height: '10px' })),
      state('end', style({ height: '50vh' })),
      transition('start => end', animate('200ms ease-in')),
      transition('end => start', animate('200ms ease-in'))
    ]),
    trigger('scrollButton', [
      transition(':enter', [
        style({opacity: 0}), 
        animate('1ms 0.2s ease-out', style({opacity: 0.4}))
      ])
    ]),
  ]
})
export class LogbookItemComponent implements OnInit {

  @Input()
  config: WidgetItemConfig;

  @Input()
  configIndex: number;

  showLoadingCircle = true;
  viewOption = 'widgets';
  message: ChangeStreamNotification;
  notifications: ChangeStreamNotification[] = [];
  array: ChangeStreamNotification[];
  key = 'defaultOrder';
  isOpen = false;
  selectedFile: File;
  subscriptions: Subscription[] = [];


  private _searchString: string = '';
  searchStringSubject: Subject<void> = new Subject();
  searchSnippetIndex: string = '';

  dataService: Subscription = null;
  changeStreamSubscriptions: Subscription[] = [];
  postEntrySubscription: Subscription = null;
  currentViewSubscription: Subscription = null;
  logbookId: string;
  targetId: string;
  mobile: boolean = false;

  lastFunc: any;
  lastRan: any;
  dashboardView: boolean = true;

  modifiedMetadata = false;
  metadataPanelExpanded = false;
  tag: string[] = [];

  renderedHeights: number[] = [];
  editorClassRef: any = null;

  autoScrollFraction = 0.4; // fraction of viewport height (==clientHeight) in which auto scrolling is enabled
  messagesEnabled = false;
  searchObservable: BehaviorSubject<number> = null;
  isLightMode = false;
  isReadOnly = false;

  _snippetHeightRef = 0;
  _editorHeightRef = 0;
  showSearch = false
  showSearchExpanded = false;

  forceScrollToEnd = false;

  logbookCount = 0;
  isDescending: boolean;

  @ViewChildren(SnippetComponent) childSnippets: QueryList<SnippetComponent>;

  @ViewChild('snippetContainer') snippetContainerRef: ElementRef;
  @ViewChild('editor') editorRef: ElementRef;
  @ViewChild('contentEditor') editorContentRef: CKEditorComponent;
  @ViewChild('contentEditor') editorContentComponentRef: QueryList<CKEditorComponent>;
  @ViewChild('tagEditor') tagEditorRef: TagEditorComponent;
  @ViewChild('searchSnippets') searchSnippetsRef: ElementRef;



  public Editor = ClassicEditor;
  public editorConfig = CKeditorConfig;
  dataEditor: any;


  constructor(private data: AddContentService,
    private notificationService: ChangeStreamService,
    public dialog: MatDialog,
    private logbookInfo: LogbookInfoService,
    private route: ActivatedRoute,
    private views: ViewsService,
    private renderer: Renderer2,
    private httpClient: HttpClient,
    private userPreferences: UserPreferencesService,
    private logbookItemDataService: LogbookItemDataService,
    private hotkeys: Hotkeys,
    private tagService: TagService,
    public logbookScrollService: LogbookScrollService,
    private scrollToElementService: ScrollToElementService,
    private cdr: ChangeDetectorRef
  ) {

    this.subscriptions.push(this.hotkeys.addShortcut({ keys: 'control.shift.n', description: { label: 'Set focus to editor', group: "Logbook" } }).subscribe(() => {
      this.setFocusToEditor();
    }));
    this.subscriptions.push(this.hotkeys.addShortcut({ keys: 'control.enter', description: { label: 'Submit content', group: "Logbook" } }).subscribe(() => {
      this.addContent();
    }));
    this.subscriptions.push(this.hotkeys.addShortcut({ keys: 'shift.alt.enter', description: { label: 'Submit message', group: "Logbook" } }).subscribe(() => {
      this.addMessage();
    }));
    this.subscriptions.push(this.route.parent.url.subscribe((urlPath) => {
      if (typeof urlPath[1] != 'undefined') {
        this.logbookId = urlPath[1].path;
      }
    }));
    if (this.logbookInfo.logbookInfo == null) {
      console.log("retrieving logbook info");
      this.logbookInfo.getLogbookInfo(this.logbookId);
    }
  }

  ngOnInit(): void {

    this.isLightMode = (localStorage.getItem('light-mode') == "true");
    console.log(this.isLightMode);
    if (this.route.snapshot.queryParams.id) {
      this.dashboardView = false;
    }

    this.subscriptions.push(this.searchStringSubject.pipe(debounceTime(500)).subscribe(() => {
      console.log("reset")
      this.logbookScrollService.reset();
    }));

    this.updateViewSubscription();

    this.scrollToElement();
  }

  private scrollToElement() {
    this.subscriptions.push(this.scrollToElementService.$selectedItem.subscribe(async (event) => {
      if (this.config?.general?.title !== event?.config?.general?.title) return;
      const element = event.event;
      if (element != null) {
        if (typeof element.id == 'string') {
          let index = await this.logbookItemDataService.getIndex(element.id, this.config);
          console.log("snippet:", element);
          console.log("index: ", index);
          console.log(this.config);
          if (index >= 0) {
            this.goToSnippetIndex(index);
          }
        }
      }
    }));
  }

  updateViewSubscription() {
    // console.log("Config: ", this.config);
    if (this.currentViewSubscription != null) {
      this.currentViewSubscription.unsubscribe();
    }
    this.currentViewSubscription = this.views.currentWidgetConfigs.subscribe(async config => {
      // console.log(config[this.configIndex].config);
      if (config != null) {
        this.config = config[this.configIndex].config;
        this.isDescending = this.config?.view?.order[0]?.split(" ")?.[1] === 'DESC';
        this.targetId = this.config.filter.targetId;
        this.isReadOnly = this.config.general.readonly;
        await this.logbookScrollService.initialize(this.config);
        this.logbookCount = (await this.logbookItemDataService.getCount(this.config)).count;
        this.logbookScrollService.containerRef = this.snippetContainerRef;
        // console.log(res)
        this.startNotificationManager();
      }
    });
  }

  startNotificationManager() {
    if (typeof this.config != 'undefined') {
      if (this.changeStreamSubscriptions.length > 0) {
        this.changeStreamSubscriptions.forEach(sub => sub.unsubscribe());
      }
      let logbooks = [this.config.filter.targetId, ...this.config.filter?.additionalLogbooks];
      console.log("Subscribing to the following logbooks: ", logbooks);
      logbooks.forEach(log => {
        this.changeStreamSubscriptions.push(this.notificationService.getNotification(log, this.config).subscribe(notification => {
          console.log(notification);
          this.notifications.push(notification);
          this.parseNotification(notification);
        }));
      })


      if (this.dataService == null) {
        this.dataService = this.data.currentMessage.subscribe(message => {
          // console.log(message);
          this.message = message;
          if ((message != null) && (Object.keys(this.message).length != 0)) {
            // console.log(this.message);
            this.submitContent(message);
            this.message = null;
          }
        });
      }
    }
  }

  async parseNotification(notification: ChangeStreamNotification) {
    switch (notification.operationType) {
      case "update":
        console.log("notification: ", notification);
        if (notification.content) {
          let updatePos = this.findPos(notification)[0];
          let isSubsnippet = false;
          let subPos: number[];
          if (updatePos == this.childSnippets.toArray().length) {
            subPos = this.findPos(notification, "id", "id", true);
            isSubsnippet = true;
            console.log(subPos);
          }
          // deleting elements is communicated by special tags. If they are present, delete the element
          if (
            notification.content.deleted ||
            (this.config.filter?.tags?.length > 0 && 
            !this.config.filter.tags.some((tag: string) => notification.content.tags?.includes(tag))) ||
            this.config.filter.excludeTags?.some((tag: string) => notification.content.tags?.includes(tag))
          ) {
            if (isSubsnippet && subPos.length == 2) {
              // subsnippets don't have a viewport index so we can / have to update the childSnippet directly. 
              // However, afterwards we need to make sure that viewport's height is updated
              console.log("delete subsnippet:", subPos);
              this.childSnippets.toArray()[subPos[0]].snippet.subsnippets.splice(subPos[1], 1);
              this.logbookScrollService.updateViewportEstimate(); // update current viewport's buffer size estimate
            } else {
              // first-level snippets can be removed directly by using the datasource adapter
              console.log("deleting snippet:", updatePos);
              this.logbookScrollService.remove(notification.id);
              this.logbookCount -= 1;
            }
          } else if (notification.content.parentId) {
            // if the parentID changed, we have to get the snippet from the DB
            let snippetTmp = await this.logbookItemDataService.getBasesnippet(notification.id);
            console.log("restored snippet: ", snippetTmp);
            notification.operationType = 'insert';
            notification.content = snippetTmp;
            this.parseNotification(notification);
          } else {
            // true update
            // we only need to update already rendered elements. The data is anyway already up to date in the backend
            if (subPos?.length === 2) {
              const snippetPos = this.childSnippets.toArray()[subPos[0]].snippet;
              const subSnippet = snippetPos.subsnippets[subPos[1]];
              this.updateSnippetValues(notification.content, subSnippet);
              snippetPos.subsnippets = [subSnippet];
            }
            if (updatePos < this.childSnippets.toArray().length) {
              let updateEntry = this.childSnippets.toArray()[updatePos];
              console.log(updatePos);
              this.updateSnippetValues(notification.content, updateEntry.snippet);
              console.log("updated array at pos ", updatePos);
              console.log(updateEntry);
              updateEntry.updateContent();
            }
            this.logbookScrollService.updateViewportEstimate();
          }
        }

        break;
      case "insert":
        if (notification.content.snippetType === "edit") {
          return await this.fireEditCondition(notification)
        }
        if ((notification.content.snippetType == "paragraph") || (notification.content.snippetType == "image")) {
          // first check if the incoming message satisfies the current filters
          let snippetsFiltered = this.applyFilters([notification.content]);
          console.log("SnippetsFiltered:", snippetsFiltered);
          if (snippetsFiltered.length > 0) {
            if (this.childSnippets.toArray().length == 0) {
              await this.logbookScrollService.appendToEOF(notification.content);
            } else {
              let pos: number;
              switch (notification.content?.linkType) {
                case "quote":
                case "comment":
                  pos = this.findPos(notification.content, "id", "parentId")[0];
                  if (pos < this.childSnippets.toArray().length) {
                    if (this.childSnippets.toArray()[pos].snippet?.subsnippets) {
                      await this.logbookScrollService.relax();
                      this.childSnippets.toArray()[pos].snippet.subsnippets.push(notification.content);
                    } else {
                      this.childSnippets.toArray()[pos].snippet.subsnippets = [notification.content];
                    }
                  }
                  // this.datasource.adapter.check();
                  break;
                case "paragraph":
                  // pos = this.insertIntoSortedArray(notification.content);
                  // console.log(pos);
                  console.log(notification.content);
                  let _descending = this.isDescending;
                  let _bof = _descending ? (notification.content.defaultOrder > this.childSnippets.toArray()[0].snippet.defaultOrder) : (notification.content.defaultOrder < this.childSnippets.toArray()[0].snippet.defaultOrder)
                  let _eof = _descending ? (notification.content.defaultOrder < this.childSnippets.toArray()[this.childSnippets.toArray().length - 1].snippet.defaultOrder) : (notification.content.defaultOrder > this.childSnippets.toArray()[this.childSnippets.toArray().length - 1].snippet.defaultOrder);
                  if ((this.logbookScrollService.isBOF) && (_bof)) {
                    console.log("prepending to BOF")
                    await this.logbookScrollService.prependToBOF(notification.content);
                    // let autoScrollEnabled = ((this.snippetContainerRef.nativeElement.scrollHeight - this.snippetContainerRef.nativeElement.scrollTop - this.snippetContainerRef.nativeElement.clientHeight < this.autoScrollFraction*this.snippetContainerRef.nativeElement.clientHeight))? true: false;
                    if (true) {
                      setTimeout(() => {
                        this.snippetContainerRef.nativeElement.scrollTop = 0;
                      }, 50);
                    }
                  } else if ((this.logbookScrollService.isEOF) && (_eof)) {
                    console.log("appending to EOF")
                    console.log(notification.content);
                    await this.logbookScrollService.appendToEOF(notification.content);
                    let autoScrollEnabled = this.isAt('end', this.autoScrollFraction, 0);
                    console.log("autoscroll: ", autoScrollEnabled)
                    if (autoScrollEnabled || this.forceScrollToEnd) {
                      console.log("scheduling scrolling to EOF");
                      this.logbookScrollService.scrollToEnd = true;
                      // await this.logbookScrollService.isLoaded$;
                      setTimeout(() => {
                        console.log("scrolling to EOF");
                        this.scrollWindowTo('end');
                      }, 50);
                    }
                  } else {
                    if ((notification.content.defaultOrder > this.childSnippets.toArray()[0].snippet.defaultOrder) && (notification.content.defaultOrder < this.childSnippets.toArray()[this.childSnippets.toArray().length - 1].snippet.defaultOrder)) {
                      console.log("inserting between rendered items")

                    }
                    if (this.forceScrollToEnd) {
                      console.log("scrolling to new item")
                      await this.scrollTo('end');
                    } else {
                      console.log(this.childSnippets.toArray());
                      await this.logbookScrollService.appendToEOF(notification.content);
                    }
                  }
                  break;

                default:
                  break;
              }
            }
            // add tags
            if (notification.content?.tags) {
              this.tagService.addTags(notification.content.tags);
            }
          }

        }
        break;
      case "delete":
        console.log("delete");
        break;
      default:
        break;
    }
  }

  private async scrollTo(position: 'end' | 'start') {
    let positionIndex = 0;
    if (position === 'end') {
      this.forceScrollToEnd = false;
      positionIndex = (await this.logbookItemDataService.getCount(this.config)).count - 1;
    }
    await this.logbookScrollService.goToSnippetIndex(positionIndex, () => {
      this.logbookScrollService.datasource.adapter.relax(() => {
        setTimeout(() => {
          this.scrollWindowTo(position);
        }, 50);
      });
    });
  }

  private scrollWindowTo(position: 'end' | 'start') {
    this.snippetContainerRef.nativeElement.scrollTop = position === 'end'? this.snippetContainerRef.nativeElement.scrollHeight: 0;
  }

  private updateSnippetValues(content: Basesnippets, snippet: Basesnippets) {
    for (const key in content) {
      snippet[key] = content[key];
    }
  }

  // private updateSnippetValues(notification: ChangeStreamNotification, subSnippet: any) {
  //   for (const key in notification.content) {
  //     subSnippet[key] = notification.content[key];
  //   }
  // }

  submitContent(msg: ChangeStreamNotification) {
    // in the future, this should be extended to support inserting snippets below/above other snippets
    // for now, I just take the last array entry
    let referenceEntry: ChangeStreamNotification = {};
    // if (this.childSnippets.toArray().length == 0) {
    referenceEntry.ownerGroup = this.logbookInfo.logbookInfo.ownerGroup;
    referenceEntry.accessGroups = this.logbookInfo.logbookInfo.accessGroups;
    referenceEntry.isPrivate = this.logbookInfo.logbookInfo.isPrivate;
    // } else {
    //   referenceEntry = this.childSnippets.toArray()[this.childSnippets.toArray().length - 1].snippet;
    // }
    if (msg.snippetType === "edit") {
    // POST -- EDIT SNIPPET
      let payload: ChangeStreamNotification = this._prepareEditPostPayload(referenceEntry, msg);
      this.logbookItemDataService.uploadParagraph(payload);
    } else if ((typeof msg.id != "undefined") && (msg.id != '')) {
    // PATCH -- UPDATE SNIPPET
      let payload = this._preparePatchPayload(referenceEntry, msg);
      this.logbookItemDataService.uploadParagraph(payload, msg.id);
    } else {
      // POST -- NEW SNIPPET
      let payload = this._preparePostPayload(referenceEntry, msg);
      this.logbookItemDataService.uploadParagraph(payload);
    }

    this.modifiedMetadata = false;
  }

  _prepareEditPostPayload(referenceEntry: ChangeStreamNotification, msg: ChangeStreamNotification): ChangeStreamNotification {
    return {
      ownerGroup: referenceEntry.ownerGroup,
      accessGroups: referenceEntry.accessGroups,
      snippetType: msg.snippetType,
      parentId: msg.id,
      toDelete: msg.toDelete,
      linkType: msg.linkType,
    };
  }

  _preparePatchPayload(referenceEntry: ChangeStreamNotification, msg: ChangeStreamNotification): ChangeStreamNotification {
    // I guess it should only take these variables if they are not defined in the msg...
    console.log("referenceEntry: ", referenceEntry)
    let payload: ChangeStreamNotification = {
      ownerGroup: referenceEntry.ownerGroup,
      accessGroups: referenceEntry.accessGroups,
      isPrivate: referenceEntry.isPrivate,
      tags: msg.tags,
      snippetType: "paragraph",
      textcontent: msg.textcontent,
      id_session: localStorage.getItem('id_session'),
      files: msg.files,
    };
    if (msg.isMessage) {
      payload.isMessage = true;
      payload.ownerGroup = this.userPreferences.userInfo.email;
    }
    return payload;
  }

  _preparePostPayload(referenceEntry: ChangeStreamNotification, msg: ChangeStreamNotification): ChangeStreamNotification {
    // I guess it should only take these variables if they are not defined in the msg...
    let payload: ChangeStreamNotification = {
      ownerGroup: referenceEntry.ownerGroup,
      accessGroups: referenceEntry.accessGroups,
      isPrivate: referenceEntry.isPrivate,
      tags: msg.tags,
      snippetType: "paragraph",
      linkType: msg.linkType,
      textcontent: msg.textcontent,
      files: msg.files,
      subsnippets: msg.subsnippets,
    };
    if (msg.parentId) {
      payload.parentId = msg.parentId;
    }
    if (msg.isMessage) {
      payload.isMessage = true;
      payload.ownerGroup = this.userPreferences.userInfo.username;
    }
    console.log('posting data');
    console.log(payload);

    return payload;
  }

  async fireEditCondition(notification: ChangeStreamNotification) {
    const pos = this.findPos(notification.content, "id", "parentId", notification.content.linkType === LinkType.COMMENT);
    let posChild: (SnippetComponent | Basesnippets) = this.childSnippets.toArray()[pos[0]];
    if (pos.length === 2) {
      posChild = (posChild as SnippetComponent).snippet.subsnippets[pos[1]] as Basesnippets;
      posChild.snippetType = 'paragraph';
    }
    posChild.subsnippets = [...(posChild.subsnippets?? []).filter(s => s.snippetType !== 'edit') , notification.content];
  }

  applyFilters(snippets: Basesnippets[]) {
    return snippets.filter((snippet) => {
      let includeSnippet = true;
      if ((snippet.linkType) && ((snippet.linkType == "comment") || (snippet.linkType == "quote"))) {
        return includeSnippet;
      }
      if (this.config.filter.tags?.length > 0) {
        this.config.filter.tags.forEach((tag) => {
          if (!snippet.tags.includes(tag)) {
            includeSnippet = false;
          }
        })
      }
      if (!includeSnippet) {
        return includeSnippet;
      }
      if (this.config.filter.excludeTags?.length > 0) {
        this.config.filter.excludeTags.forEach((tag) => {
          if (snippet.tags.includes(tag)) {
            includeSnippet = false;
          }
        })
      }
      if (!includeSnippet) {
        return includeSnippet;
      }
      if (typeof this.config.filter.targetId != 'undefined') {
        let logbookIds = [this.config.filter.targetId, ...this.config.filter.additionalLogbooks];
        return logbookIds.includes(snippet.parentId);
      }
      return includeSnippet;
    });
  }


  findPos(newInput: ChangeStreamNotification, tagOld: string = 'id', tagNew: string = 'id', subsnippets: boolean = false) {
    // console.log(newInput);
    if (subsnippets) {
      for (let index = 0; index < this.childSnippets.toArray().length; index++) {
        if (this.childSnippets.toArray()[index].snippet.subsnippets) {
          for (let indexSub = 0; indexSub < this.childSnippets.toArray()[index].snippet.subsnippets.length; indexSub++) {
            if (this.childSnippets.toArray()[index].snippet.subsnippets[indexSub][tagOld] == newInput[tagNew]) {
              return [index, indexSub];
            }
          }
        }

      }
    } else {
      console.log("no subsnippets");
      for (let index = 0; index < this.childSnippets.toArray().length; index++) {

        if (this.childSnippets.toArray()[index].snippet[tagOld] == newInput[tagNew]) {
          // console.log("found index", index);
          return [index];
        }
      }
    }

    console.log("could not find entry");
    return [this.childSnippets.toArray().length];
  }

  changeView(viewType: string) {
    this.viewOption = viewType;
  }

  closeToolSelection() {
    this.isOpen = false;
  }
  toggle() {
    this.isOpen = !this.isOpen;
  }

  toggleSearch() {
    this.showSearchExpanded = !this.showSearchExpanded;
    if (!this.showSearchExpanded) {
      setTimeout(() => { this.showSearch = false; }, 200);
    } else {
      this.showSearch = true;
    }
  }


  openDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.disableClose = true;
    dialogConfig.data = { "defaultTags": this.childSnippets?.last?.snippet?.tags, "config": this.config }
    const dialogRef = this.dialog.open(AddContentComponent, dialogConfig);
  }

  addSnippet(event) {
    this.openDialog();

    this.isOpen = false;
  }

  onFileChanged($event) {
    console.log($event.target);
    console.log(this.selectedFile = $event.target.files[0]);
    let fileHash = uuid();
    let snippetFiles: Filecontainer[] = [];
    let file: Filecontainer = {
      style: {
        width: "",
        height: ""
      },
      fileExtension: "image/" + this.selectedFile.name.split(".")[1],
      file: this.selectedFile,
      fileHash: fileHash
    }
    snippetFiles.push(file);

    var notification: ChangeStreamNotification = {
      parentId: this.targetId,
      linkType: "paragraph",
      textcontent: "<figure class=\"image\"><img src=\"\" title=\"" + fileHash + "\"></figure>",
      files: snippetFiles
    }
    this.submitContent(notification);
  }

  isMobile() {
    this.mobile = window.innerWidth < 959;
  }

  @HostListener('window:resize')
  onResized() {
    const _heightRef = this.snippetContainerRef.nativeElement.parentElement.parentElement.parentElement.parentElement.offsetHeight;
    const _editorHeight = this.editorRef?.nativeElement?.offsetHeight;
    this.isMobile();
    if (this._snippetHeightRef != _heightRef || this._editorHeightRef != _editorHeight) {
      this._snippetHeightRef = _heightRef;
      this._editorHeightRef = _editorHeight;
      this.updateViewHeights();
    }
  }

  updateViewHeights() {
    if (this.editorRef) {
      let offset = this.mobile ? 210 - 28 : (this.dashboardView ? 130 - 28 : 195 - 25);
      let snippetHeight: number;
      if (this.mobile) {
        snippetHeight = this.snippetContainerRef.nativeElement.parentElement.parentElement.parentElement.parentElement.offsetHeight - offset;
      } else {
        snippetHeight = this.snippetContainerRef.nativeElement.parentElement.parentElement.parentElement.parentElement.offsetHeight - this.editorRef.nativeElement.offsetHeight - offset;
      }
      this.renderer.setStyle(this.snippetContainerRef.nativeElement, 'height', `${snippetHeight}px`);
    } else {
      let snippetHeight = this.snippetContainerRef.nativeElement.parentElement.parentElement.parentElement.parentElement.offsetHeight - 130;
      this.renderer.setStyle(this.snippetContainerRef.nativeElement, 'height', `${snippetHeight}px`);
    }
  }
  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    this.updateViewHeights();
    this.cdr.detectChanges();
  }


  onEditorReady($event: any) {
    console.log(Array.from($event.ui.componentFactory.names()));
    console.log($event.plugins);
    $event.ui.getEditableElement().parentElement.insertBefore(
      $event.ui.view.toolbar.element,
      $event.ui.getEditableElement()
    );
    $event.plugins.get('FileRepository').createUploadAdapter = (loader) => {
      return new CK5ImageUploadAdapter(loader, this.httpClient);
    };
    $event.editing.view.focus();
    this.editorClassRef = $event;
  };

  addMessage() {
    if (this.messagesEnabled) {
      this.addContent(true);
    } else {
      console.log("currently disabled")
    }
  }

  setFocusToEditor() {
    if (this.editorClassRef != null) {
      this.editorClassRef.editing.view.focus();
    }
  }

  setFocusToSearch() {
    this.searchSnippetsRef.nativeElement.focus();
  }

  async goToSnippetIndex(index: number) {
    this.logbookScrollService.goToSnippetIndex(index, (index: number) => {
      this.childSnippets.toArray().forEach(element => {
        if (element.index == index) {
          element.highlightSnippetBorder();
        }
      });
    })
  }

  isAt(position: 'end' | 'start', scrollPortion = 0, offset = 1) {
    const element = this.snippetContainerRef?.nativeElement;
    if (element)
      return position === 'end'? this.stillToScrollToEnd(element, scrollPortion, offset) <= 0: element.scrollTop <= offset;
  }

  private stillToScrollToEnd(element: Element, scrollPortion: number, offset: number) {
    return element.scrollHeight - element.clientHeight * (1 + scrollPortion) - element.scrollTop - offset;
  }

  scrollOnClickTo(position: 'end' | 'start') {
    const scrollServicePosition = position === 'end'? 'isEOF' : 'isBOF';
    if (this.logbookScrollService[scrollServicePosition])
      this.scrollWindowTo(position);
    else
      this.scrollTo(position);
  }

  addContent(isMessage = false) {
    this.forceScrollToEnd = true;
    console.log(this.editorContentRef.editorInstance.prel_filestorage);
    let notification: ChangeStreamNotification = extractNotificationMessage(this.editorContentRef.editorInstance.getData(), this.editorContentRef.editorInstance.prel_filestorage);

    if (notification != null) {
      notification.parentId = this.targetId;
      notification.isMessage = isMessage;
      // notification.files = this.editorContentRef.editorInstance.prel_filestorage;
      if ((!this.modifiedMetadata) && (this.childSnippets.last) && (this.childSnippets.last.snippet.tags)) {
        this.tag = this.childSnippets.last.snippet.tags;
      }
      notification.tags = this.tagEditorRef.tag.map(tag => tag.name);

      this.submitContent(notification);
      console.log(notification);
      this.editorContentRef.editorInstance.setData("");
    }

  };

  snippetIsLoading(status: boolean, id: string) {
    console.log(status, id);
    this.logbookScrollService.setItemStatus(id, status);
  }
  // updateTags(tags: string[]) {
  //   this.tag = tags;
  //   this.modifiedMetadata = true;
  // }

  // updateEditorTags() {
  //   console.log(this.childSnippets.last.snippet.tags)
  //   if (this.childSnippets.last.snippet.tags) {
  //     this.tag = this.childSnippets.last.snippet.tags;
  //     this.tagEditorRef.tagIn = this.tag;
  //     this.tagEditorRef.loadData();
  //   }
  // }


  public get searchString(): string {
    return this._searchString;
  }
  public set searchString(value: string) {
    this.logbookItemDataService.searchString = value;
    this._searchString = value;
    this.searchStringSubject.next();
  }

  private _indexOrder(i: number) {
    if (this.isDescending) {
      return this.logbookCount - i
    }
    return i + 1
  }

  ngOnDestroy() {
    if (this.currentViewSubscription != null) {
      this.currentViewSubscription.unsubscribe();
    }
    if (this.changeStreamSubscriptions.length > 0) {
      this.changeStreamSubscriptions.forEach(sub => sub.unsubscribe());
    }
    if (this.dataService != null) {
      this.dataService.unsubscribe();
    }

    console.log("unsubscribe: ", this.subscriptions.length);
    this.subscriptions.forEach(element => {
      element.unsubscribe();
    });
  }

}
