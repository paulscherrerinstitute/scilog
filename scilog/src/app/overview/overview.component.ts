import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Logbooks } from '@model/logbooks';
import { Subject, Subscription } from 'rxjs';
import { UserPreferencesService } from '@shared/user-preferences.service';
import { CollectionConfig, WidgetItemConfig } from '@model/config';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AddCollectionComponent } from './add-collection/add-collection.component';
import { AddLogbookComponent } from './add-logbook/add-logbook.component';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { CookiesService } from '@shared/cookies.service';
import { LogbookDataService } from '@shared/remote-data.service';
import { LogbookIconScrollService } from './logbook-icon-scroll-service.service';
import { debounceTime } from 'rxjs/operators';
import { ResizedEvent } from 'angular-resize-event';

enum ContentType {
  COLLECTION = 'collection',
  LOGBOOK = 'logbook',
}

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css'],
  providers: [LogbookIconScrollService]

})
export class OverviewComponent implements OnInit {

  config: WidgetItemConfig;

  showViewSelection = false;
  collections: CollectionConfig[];
  viewMode: string;

  fileToUpload: File = null;

  logbookSubscription: Subscription = null;
  subscriptions: Subscription[] = [];
  private _searchString: string = '';
  searchStringSubject: Subject<void> = new Subject();
  _matCardWidth = 300;
  @ViewChild('logbookContainer', {static: true}) logbookContainer: ElementRef<HTMLElement>;


  constructor(
    public logbookIconScrollService: LogbookIconScrollService,
    private userPreferences: UserPreferencesService,
    public dialog: MatDialog,
    private logbookInfo: LogbookInfoService,
    private cookie: CookiesService,
    private dataService: LogbookDataService) {

  }

  ngOnInit(): void {
    this.logbookInfo.logbookInfo = null;
    console.log(this.logbookInfo.logbookInfo);
    this.subscriptions.push(this.userPreferences.currentCollectionsConfig.subscribe(data => {
      console.log("collections:", data);
      this.collections = data;

      // if there is only one collection, select it! -- TODO: save last collection in userPreferences
      if (this.collections.length == 1) {
        this.collectionSelected(this.collections[0]);
      }
      if (this.logbookSubscription != null) {
        this.logbookSubscription.unsubscribe();
      }
      this.config = this._prepareConfig();
      this.logbookIconScrollService.groupSize = this.groupSize(this.logbookContainer.nativeElement.clientWidth);
      this.logbookIconScrollService.initialize(this.config);
    }));
    this.subscriptions.push(this.searchStringSubject.pipe(debounceTime(500)).subscribe(() => {
      this.logbookIconScrollService.config = this._prepareConfig();
      this.logbookIconScrollService.reset();

    }));
  }

  onResized(event: ResizedEvent){
    const newSize = this.groupSize(event.newRect.width);
    if (newSize === this.logbookIconScrollService.groupSize) return
    this.logbookIconScrollService.groupSize = newSize;
    if (event.newRect.width > 2 * event.oldRect.width || event.oldRect.width > 2 * event.newRect.width) {
      this.logbookIconScrollService.initialize(this.config);
    }
    else
      this.logbookIconScrollService.reload();
  }

  get matCardWith () {
    const matCardWidth = this.logbookIconScrollService?.datasource?.adapter?.firstVisible?.element?.querySelector?.('.logbook-card')?.clientWidth;
    if (!matCardWidth) 
      return this._matCardWidth;
    this._matCardWidth = matCardWidth
    return matCardWidth
  }

  groupSize (viewPortWidth: number) {
    return Math.floor(viewPortWidth / this.matCardWith) || 1;
  }

  collectionSelected(collection: CollectionConfig) {
    this.showViewSelection = true;
    // this.views = [];
    console.log("selected collection: ", collection)

  }

  public get searchString(): string {
    return this._searchString;
  }
  public set searchString(value: string) {
    this._searchString = value;
    this.searchStringSubject.next();
    this.dataService.searchString = this._searchString;
  }

  logbookSelected(logbookID: string) {
    this.cookie.lastLogbook = logbookID;
    console.log("selected logbook: ", logbookID);
    console.log("opening logbook...");
  }

  setView(view: string) {
    this.viewMode = view;
  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
  }

  editLogbook(logbook: Logbooks) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = logbook;
    let dialogRef: any;
    dialogRef = this.dialog.open(AddLogbookComponent, dialogConfig);

    this.subscriptions.push(dialogRef.afterClosed().subscribe(async result => {
      console.log("Dialog result:", result);
      await this.logbookIconScrollService.reload();
    }));
  }

  async deleteLogbook(logbookId: string) {
    await this.dataService.deleteLogbook(logbookId);
    await this.logbookIconScrollService.reload();
    console.log("deleted logbook ", logbookId);
  }

  addCollectionLogbook(contentType: string) {
    console.log(contentType);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    let dialogRef: any;
    switch (contentType) {
      case ContentType.COLLECTION:
        dialogRef = this.dialog.open(AddCollectionComponent, dialogConfig);
        break;
      case ContentType.LOGBOOK:
        dialogRef = this.dialog.open(AddLogbookComponent, dialogConfig);
        break;
      default:
        break;
    }
    this.subscriptions.push(dialogRef.afterClosed().subscribe(async result => {
      if (typeof result != "undefined") {
        await this.logbookIconScrollService.reload();
      }
    }));
  }

  private _prepareConfig() {
    // let searchResult = this._parseSearchString();
    let _config: WidgetItemConfig = {
      filter: {
        targetId: "",
      },
      general: {
        type: "logbook",
        title: "",
        readonly: true
      },
      view: {
        order: ["defaultOrder DESC"],
        hideMetadata: false,
        showSnippetHeader: false
      }
    }
    return _config;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(
      (subscription) => subscription.unsubscribe());
  }

}
