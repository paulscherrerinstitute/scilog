import { Component, OnInit, ComponentFactoryResolver } from '@angular/core';
import { Logbooks } from '@model/logbooks';
import { Subject, Subscription } from 'rxjs';
import { UserPreferencesService } from '@shared/user-preferences.service';
import { CollectionConfig, WidgetItemConfig } from '@model/config';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { AddCollectionComponent } from './add-collection/add-collection.component';
import { AddLogbookComponent } from './add-logbook/add-logbook.component';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { CookiesService } from '@shared/cookies.service';
import { Router } from '@angular/router';
import { LogbookDataService } from '@shared/remote-data.service';
import { LogbookIconScrollService } from './logbook-icon-scroll-service.service';
import { debounceTime } from 'rxjs/operators';

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
  logbooks: Logbooks[];
  viewMode: string;

  fileToUpload: File = null;

  logbookSubscription: Subscription = null;
  subscriptions: Subscription[] = [];
  private _searchString: string = '';
  searchStringSubject: Subject<any> = new Subject();


  constructor(
    public logbookIconScrollService: LogbookIconScrollService,
    private userPreferences: UserPreferencesService,
    public dialog: MatDialog,
    private logbookInfo: LogbookInfoService,
    private cookie: CookiesService,
    private router: Router,
    private dataService: LogbookDataService) {

  }

  ngOnInit(): void {
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
      this.logbookIconScrollService.initialize(this.config);
      this.getLogbookData();
    }));
    this.subscriptions.push(this.searchStringSubject.pipe(debounceTime(500)).subscribe(() => {
      this.logbookIconScrollService.config = this._prepareConfig();
      this.logbookIconScrollService.reset();

    }));
  }

  async getLogbookData() {
    await this.logbookInfo.getAvailLogbooks();
    this.logbooks = this.logbookInfo.availLogbooks.slice(0, 500);
    console.log(this.logbooks);
    if (sessionStorage.getItem('scilog-auto-selection-logbook') == null) {
      sessionStorage.setItem('scilog-auto-selection-logbook', 'true');
      if (this.cookie.lastLogbook != "") {
        this.logbooks.forEach(logbook => {
          if (logbook.id == this.cookie.lastLogbook) {
            this.logbookInfo.logbookInfo = logbook;
            this.router.navigateByUrl('/logbooks/' + this.cookie.lastLogbook + '/dashboard');
            console.log("last logbook: ", this.cookie.lastLogbook)
          }
        })
      }
    }
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

  filterItem(searchTag: string) {
    console.log(this.logbooks.filter((item: Logbooks) => {
      for (const key in item) {
        if (Object.prototype.hasOwnProperty.call(item, key)) {
          const element = item[key];
          if (typeof element == "string") {
            return element.toLowerCase().includes(searchTag.toLowerCase());
          }
        }
      }
      return true;

    }));
    console.log(this.logbooks);
  }

  editLogbook(logbook: Logbooks) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = logbook;
    let dialogRef: any;
    let logIndex: number = null;
    dialogRef = this.dialog.open(AddLogbookComponent, dialogConfig);

    this.subscriptions.push(dialogRef.afterClosed().subscribe(result => {
      console.log("Dialog result:", result);
      logIndex = this.logbooks.findIndex(logbook => {
        return logbook.id == result.id;
      })
      if (logIndex != null) {
        this.logbooks[logIndex] = result;
      }
    }));
  }

  async deleteLogbook(logbookId: string) {
    let logIndex: number = null;
    logIndex = this.logbooks.findIndex(logbook => {
      return logbook.id == logbookId;
    })
    if (logIndex != null) {
      this.logbooks.splice(logIndex, 1);
    }
    await this.dataService.deleteLogbook(logbookId);
    await this.logbookIconScrollService.remove(logbookId)
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
        this.logbooks.push(result);
        await this.logbookIconScrollService.datasource.adapter.reload()
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

  intersectLogbooksWithScroller(scrolledData: Logbooks[]): Logbooks[] {
    if (this.logbooks)
      return this.logbooks.filter(
        logbook => scrolledData.some(
          scrolled => logbook.id === scrolled.id
        )
      );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(
      (subscription) => subscription.unsubscribe());
  }

}
