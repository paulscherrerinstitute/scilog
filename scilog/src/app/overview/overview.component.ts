import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Logbooks } from '@model/logbooks';
import { Subscription } from 'rxjs';
import { UserPreferencesService } from '@shared/user-preferences.service';
import { CollectionConfig, WidgetItemConfig } from '@model/config';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AddCollectionComponent } from './add-collection/add-collection.component';
import { AddLogbookComponent } from './add-logbook/add-logbook.component';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { CookiesService } from '@shared/cookies.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { OverviewTableComponent } from './overview-table/overview-table.component';
import { OverviewScrollComponent } from './overview-scroll/overview-scroll.component';
import { ToolbarComponent } from '../core/toolbar/toolbar.component';
import { MatButtonToggleGroup, MatButtonToggle } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

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
                style({ opacity: 0 }),
                animate('1ms 0.2s ease-out', style({ opacity: 1 }))
            ])
        ]),
    ],
    imports: [ToolbarComponent, MatButtonToggleGroup, FormsModule, MatButtonToggle, MatIcon, NgIf, MatProgressSpinner, OverviewTableComponent, OverviewScrollComponent]
})
export class OverviewComponent implements OnInit, OnDestroy {

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
    private cookie: CookiesService) {}

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

  get overviewComponent() {
    return this.matCardType === 'logbook-module'
      ? this.overviewSroll:
      this.overviewTable;
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

    this.subscriptions.push(dialogRef.afterClosed()
    .subscribe(async (result: Logbooks) => {
      await this.reloadData(result, 'edit');
    }));
  }

  async reloadData(logbook: Logbooks, action: 'edit' | 'add') {
    if (!logbook) return
    if (action === 'edit') await this.overviewComponent.afterLogbookEdit(logbook);
    if (action === 'add') await this.overviewComponent.reloadLogbooks();
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
    this.subscriptions.push(dialogRef.afterClosed().subscribe(async (result: Logbooks) => {
      await this.reloadData(result, 'add');
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
        order: ["touchedAt DESC"],
        hideMetadata: false,
        showSnippetHeader: false
      }
    }
    return _config;
  }

  async setSearch(search: string) {
    await this.overviewComponent.reloadLogbooks(true, search);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(
      (subscription) => subscription.unsubscribe());
  }

}
