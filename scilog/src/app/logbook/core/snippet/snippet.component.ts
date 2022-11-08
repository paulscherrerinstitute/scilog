import { Component, OnInit, Input, SecurityContext, ElementRef, ViewChild, Output, EventEmitter} from '@angular/core';
import { ChangeStreamNotification } from '../changestreamnotification.model';
import { DomSanitizer} from '@angular/platform-browser';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { AddContentComponent } from '../add-content/add-content.component';
import { Paragraphs, LinkType } from '@model/paragraphs';
import { Subscription } from 'rxjs';
import { SnippetContentComponent } from './snippet-content/snippet-content.component';
import { UserPreferencesService } from '@shared/user-preferences.service';
import { SnippetDashboardNameComponent } from './snippet-dashboard-name/snippet-dashboard-name.component';
import { SnippetInfoComponent } from './snippet-info/snippet-info.component';
import { LogbookItemDataService } from '@shared/remote-data.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { WidgetItemConfig } from '@model/config';
 

@Component({
  selector: 'snippet',
  templateUrl: './snippet.component.html',
  styleUrls: ['./snippet.component.scss'],
  animations: [
    trigger('highlightSnippet', [
      state('default', style({ backgroundColor: 'var(--snippet-color)' })),
      state('highlight', style({ backgroundColor: '#efefef' })),
      transition('highlight => default', animate('2000ms ease-out')),
      transition('default => highlight', animate('200ms ease-in'))
    ])
  ]
})
export class SnippetComponent implements OnInit {

  @Input()
  snippet: ChangeStreamNotification;

  @Input()
  updatedAt: string;

  @Input()
  index: number;

  @Input()
  isLogbook: boolean = true;

  @Input()
  config: WidgetItemConfig = {
    general:{},
    filter: {},
    view: {}
  };

  @Input()
  showEditButtonsMenu: boolean = true;


  @Input()
  linkType: LinkType = LinkType.PARAGRAPH;

  @Output()
  selected = new EventEmitter<ChangeStreamNotification>();

  @Output()
  isLoading = new EventEmitter<boolean>();

  isSelected = false;
  highlightState = 'default';
  styleClass = 'snippet';
  isHighlighted = false;
  content: string;
  imageToShow: string | ArrayBuffer;
  showImage: boolean;

  timerId = null;
  _enableEdit: boolean;
  snippetIsAccessedByAnotherUser = false;
  avatarHash = "anotherUser";

  snippetContent: any;
  enableComments = true;
  showEditButtons = true;
  showInfoButton = true;
  renderedHeight: number = 0;
  _hideMetadata: boolean = false;

  figures: any;
  subscriptions: Subscription[] = [];

  @ViewChild('snippetContainer', { read: ElementRef }) snippetContainerRef: ElementRef;
  @ViewChild('snippetContent') snippetContentRef: SnippetContentComponent;

  constructor(
    private sanitizer: DomSanitizer,
    public dialog: MatDialog,
    private logbookItemDataService: LogbookItemDataService,
    private userPreferences: UserPreferencesService) { }

  ngOnInit(): void {
    if (this.snippet.isMessage) {
      this.enableComments = false;
      this.showEditButtons = false;
      console.log(this.snippet)
      console.log(this.userPreferences.userInfo.email)

      if (this.snippet.updatedBy != this.userPreferences.userInfo.email) {
        this.styleClass = 'messagesReply'; // just for testing
      } else {
        this.styleClass = 'messages';
      }
      this.avatarHash = this.snippet.updatedBy;

    }
    if (this.snippet.linkType == LinkType.COMMENT) { 
        this.styleClass = 'snippetComment';
        this.enableComments = false;
    } else if (this.snippet.linkType == LinkType.QUOTE) {
      this.styleClass = 'snippetQuote';
      this.showEditButtonsMenu = false;
    }
    // console.log(this.snippet);

    if (this.snippet.files && (this.snippet.files.length > 0)) {
      var span = document.createElement('figure');
      span.innerHTML = this.snippet?.textcontent;
      this.snippetContent = span;
    } else {
      this.content = this.snippet?.textcontent;
    }
    this.content = this.sanitizer.sanitize(SecurityContext.HTML, this.content);

    if (!this.config.view.hideMetadata){
      if ((typeof this.snippet?.tags == 'undefined') || (this.snippet.tags.length == 0)){
        this._hideMetadata = true;
      } else {
        this._hideMetadata = false;
      }
    } else {
      this._hideMetadata = true;
    }
    // enable edit for snippet
    this.enableEdit = true;
  }

  
  public get enableEdit() : boolean {
    return this._enableEdit;
  }
  
  
  public set enableEdit(v : boolean) {
    if (v){
      // check if user a member of the ownerGroup before enabling access
      if (this.allowEdit()) {
        this._enableEdit = v;
      }
    } else {
      this._enableEdit = v;
    }
    
  }
  
  allowEdit(){
    let _hasAccessPermission = false;
    if (typeof this.userPreferences.userInfo.roles != 'undefined'){
      _hasAccessPermission = this.userPreferences.userInfo.roles.some(entry => {
        return entry == this.snippet.ownerGroup
      });
    }

    let _isExpired = false;
    if (typeof this.snippet?.expiresAt == 'undefined'){
      _isExpired = true;
    } else {
      let _expirationTime = Date.parse(this.snippet.expiresAt);
      _isExpired = _expirationTime < Date.now()
    }

    return (_hasAccessPermission && !_isExpired)
  }

  ngAfterViewChecked(): void {
    //Called after every check of the component's view. Applies to components only.
    //Add 'implements AfterViewChecked' to the class.
    if (this.snippetContainerRef.nativeElement.offsetHeight != this.renderedHeight){
      this.renderedHeight = this.snippetContainerRef.nativeElement.offsetHeight;
    }
    
  }

  highlightSnippetBorder(): void {
    this.highlightState = 'highlight';
    setTimeout(()=>{this.highlightState='default'}, 1000)
  }

  updateContent(){
    this.snippetContentRef.prepareContent();
    if (!this.config.view.hideMetadata){
      if ((typeof this.snippet?.tags == 'undefined') || (this.snippet.tags.length == 0)){
        this._hideMetadata = true;
      } else {
        this._hideMetadata = false;
      }
    } else {
      this._hideMetadata = true;
    }
    // console.log(this.content)
  }
  
  updateHtmlContent(content: string) {
    this.content = content;
    // this.snippetContainerRef.nativeElement.
  }

  editSnippet() {
    console.log("edit snippet")
    console.log(this.snippet.id);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = { "snippet": this.snippet, "content": this.content, "defaultTags": this.snippet.tags, "config": this.config};
    const dialogRef = this.dialog.open(AddContentComponent, dialogConfig);
    this.subscriptions.push(dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    }));

  }

  selectSnippet($event) {
    // console.log($event);
    this.selected.emit(this.snippet);
    // this.isSelected = !this.isSelected;
  }

  deleteSnippet() {
    console.log("delete snippet")
    console.log(this.snippet.id);
    if (window.confirm('Are you sure you want to delete this item? This cannot be undone.')) {
      this.logbookItemDataService.deleteLogbookItem(this.snippet.id);
    }
  }

  startTimeout(updateBy: string) {
    this.avatarHash = updateBy;
    console.log(this.avatarHash)
    if (this.timerId != null) {
      clearTimeout(this.timerId);
    }
    this.lockEdit();
    var self = this;
    this.timerId = setTimeout(function () {
      console.log("unlocking");
      self.enableEdit = true;
      self.snippetIsAccessedByAnotherUser = false;
      self.timerId = null;
    }, 10000);
    console.log(typeof this.timerId);
  }

  lockEdit() {
    console.log("locking");
    this.snippetIsAccessedByAnotherUser = true;
    this.enableEdit = false;
  }

  addComment() {
    console.log("adding a comment")
    console.log(this.snippet.id);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    let snippet: Paragraphs = {
      parentId: this.snippet.id,
      linkType: LinkType.COMMENT
    }
    dialogConfig.data = { "snippet": snippet, "defaultTags": this.snippet.tags, "config": this.config};
    const dialogRef = this.dialog.open(AddContentComponent, dialogConfig);
    this.subscriptions.push(dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    }));
  }

  setDashboardName() {
    console.log(this.snippet.id);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;

    dialogConfig.data = this.snippet;
    const dialogRef = this.dialog.open(SnippetDashboardNameComponent, dialogConfig);
    // this.subscriptions.push(dialogRef.afterClosed().subscribe(result => {
    //   console.log(`Dialog result: ${result}`);
    // }));
  }

  addCitation() {
    console.log("adding a citation")
    console.log(this.snippet.id);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    let snippet: Paragraphs = {
      parentId: this.snippet.parentId,
      linkType: LinkType.QUOTE,
      subsnippets: [this.snippet],
    }
    dialogConfig.data = { "snippet": snippet, "defaultTags": this.snippet.tags, "config": this.config};
    const dialogRef = this.dialog.open(AddContentComponent, dialogConfig);
    this.subscriptions.push(dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    }));
  }

  setElementLoading($event){
    this.isLoading.emit($event);
  }

  showInfo(){
    console.log(this.snippet.id);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;

    dialogConfig.data = this.snippet;
    const dialogRef = this.dialog.open(SnippetInfoComponent, dialogConfig);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(
      (subscription) => subscription.unsubscribe());
  }
}
