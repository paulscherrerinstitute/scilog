import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Logbooks } from '@model/logbooks';
import { Subject, Subscription } from 'rxjs';
import { UserPreferencesService } from '@shared/user-preferences.service';
import { CollectionConfig, WidgetItemConfig } from '@model/config';
import { MatLegacyDialog as MatDialog, MatLegacyDialogConfig as MatDialogConfig } from '@angular/material/legacy-dialog';
import { AddCollectionComponent } from './add-collection/add-collection.component';
import { AddLogbookComponent } from './add-logbook/add-logbook.component';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { CookiesService } from '@shared/cookies.service';
import { LogbookDataService } from '@shared/remote-data.service';
import { LogbookIconScrollService } from './logbook-icon-scroll-service.service';
import { debounceTime } from 'rxjs/operators';
import { ResizedEvent } from '@shared/directives/resized.directive';
import { animate, style, transition, trigger } from '@angular/animations';

enum ContentType {
  COLLECTION = 'collection',
  LOGBOOK = 'logbook',
}

export type MatCardType = 'logbook-module' | 'logbook-headline';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css'],
  providers: [LogbookIconScrollService],
  animations: [
    trigger('spinner', [
      transition(':enter', [
        style({opacity: 0}), 
        animate('1ms 0.2s ease-out', style({opacity: 1}))
      ])
    ]),
  ]
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
  _matCardSide = { 'logbook-module': 352, 'logbook-headline': 47 };
  @ViewChild('logbookContainer', { static: true }) logbookContainer: ElementRef<HTMLElement>;
  matCardType: MatCardType = 'logbook-module';


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


  reInitScrollAfterToggle(matCardType: MatCardType) {
    this.matCardType = matCardType;
    const newSize = this.groupSize(this.logbookContainer.nativeElement[this.clientSide]);
    this.logbookIconScrollService.groupSize = newSize;
    this.logbookIconScrollService.initialize(this.config);
  }

  @HostListener('window:resize')
  onResized(event: ResizedEvent) {
    if (!event) return
    const side = this.matCardType === 'logbook-module' ? 'width' : 'height'
    const newSize = this.groupSize(event.newRect[side]);
    if (newSize === this.logbookIconScrollService.groupSize) return
    this.logbookIconScrollService.groupSize = newSize;
    if (event.newRect[side] > 2 * event.oldRect[side] || event.oldRect[side] > 2 * event.newRect[side]) {
      this.logbookIconScrollService.initialize(this.config);
    }
    else
      this.logbookIconScrollService.reload();
  }

  get clientSide() {
    return this.matCardType === 'logbook-module' ? 'clientWidth' : 'clientHeight'
  }

  get matCardSide() {
    const matCardType = this.matCardType;
    const element = this.getFirstVisibleElement(matCardType);
    const matCardSide = element?.[this.clientSide];
    if (!matCardSide)
      return this._matCardSide[matCardType];
    this._matCardSide[matCardType] = matCardSide;
    return this._matCardSide[matCardType]
  }

  private getFirstVisibleElement(matCardType: string) {
    return this.logbookIconScrollService?.datasource?.adapter?.firstVisible?.element?.querySelector?.(`.${matCardType}`);
  }

  groupSize(viewPortSide: number) {
    return Math.floor(viewPortSide / this.matCardSide) || 1;
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
