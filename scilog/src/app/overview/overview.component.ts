import { Component, OnInit, ViewChild } from '@angular/core';
import { Logbooks } from '@model/logbooks';
import { Subscription } from 'rxjs';
import { UserPreferencesService } from '@shared/user-preferences.service';
import { CollectionConfig, WidgetItemConfig } from '@model/config';
import { MatLegacyDialog as MatDialog, MatLegacyDialogConfig as MatDialogConfig } from '@angular/material/legacy-dialog';
import { AddCollectionComponent } from './add-collection/add-collection.component';
import { AddLogbookComponent } from './add-logbook/add-logbook.component';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { CookiesService } from '@shared/cookies.service';
import { LogbookDataService } from '@shared/remote-data.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { OverviewTableComponent } from './overview-table/overview-table.component';
import { OverviewScrollComponent } from './overview-scroll/overview-scroll.component';

enum ContentType {
  COLLECTION = 'collection',
  LOGBOOK = 'logbook',
}

export type MatCardType = 'logbook-module' | 'logbook-headline';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css'],
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

  subscriptions: Subscription[] = [];
  @ViewChild(OverviewTableComponent) overviewTable: OverviewTableComponent;
  @ViewChild(OverviewScrollComponent) overviewSroll: OverviewScrollComponent;
  matCardType: MatCardType = 'logbook-module';


  constructor(
    private userPreferences: UserPreferencesService,
    public dialog: MatDialog,
    private logbookInfo: LogbookInfoService,
    private cookie: CookiesService,
    private dataService: LogbookDataService) {}

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
      this.config = this._prepareConfig();
    }));
  }

  collectionSelected(collection: CollectionConfig) {
    this.showViewSelection = true;
    // this.views = [];
    console.log("selected collection: ", collection)

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
      await this.reloadData('edit');
    }));
  }

  private async reloadData(action: 'edit' | 'add') {
    const overviewMethod = action === 'edit'? 'getLogbooks': 'resetSortAndReload';
    this.matCardType === 'logbook-module'
      ? await this.overviewSroll.reloadLogbooks()
      : await this.overviewTable[overviewMethod]();
  }

  async deleteLogbook(logbookId: string) {
    await this.dataService.deleteLogbook(logbookId);
    await this.overviewSroll.reloadLogbooks();
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
        await this.reloadData('add');
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
