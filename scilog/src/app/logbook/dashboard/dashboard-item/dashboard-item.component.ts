import { Component, OnInit, Input, Output, EventEmitter, ViewChild, HostListener, OnDestroy } from '@angular/core';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { WidgetPreferencesComponent } from '../../widgets/widget-preferences/widget-preferences.component';
import { LogbookItemComponent } from '../../widgets/logbook-item/logbook-item.component';
import { ActivatedRoute } from '@angular/router';
import { ViewsService } from '@shared/views.service';
import { Subscription } from 'rxjs';
import { ExportDialogComponent } from './export-dialog/export-dialog.component';
import { WidgetItemConfig } from '@model/config';
import { ComponentCanDeactivate } from '../../core/navigation-guard-service';
import { NgStyle, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { ChatComponent } from '../../widgets/chat/chat.component';
import { ChartComponent } from '../../widgets/chart/chart.component';
import { TodosComponent } from '../../widgets/todos/todos.component';
import { SnippetViewerComponent } from '../../widgets/snippet-viewer/snippet-viewer.component';
import { ScicatViewerComponent } from '../../widgets/scicat-viewer/scicat-viewer.component';

@Component({
    selector: 'app-dashboard-item',
    templateUrl: './dashboard-item.component.html',
    styleUrls: ['./dashboard-item.component.scss'],
    imports: [NgStyle, NgIf, MatIconButton, MatTooltip, MatIcon, NgSwitch, NgSwitchCase, LogbookItemComponent, ChatComponent, ChartComponent, TodosComponent, SnippetViewerComponent, ScicatViewerComponent, NgSwitchDefault]
})
export class DashboardItemComponent implements OnInit, ComponentCanDeactivate, OnDestroy {

  @Input()
  configIndex: number;

  config: WidgetItemConfig;

  @Output() openFullscreen = new EventEmitter<any>();

  @Output() openWidgetPreferences = new EventEmitter<any>();

  @ViewChild(LogbookItemComponent) logbookChild: LogbookItemComponent;

  subscriptions: any[] = [];
  dashboardView = true;
  viewSubscription: Subscription = null;

  constructor(private dialog: MatDialog,
    private route: ActivatedRoute,
    private views: ViewsService) {
  }

  ngOnInit(): void {
    this.subscriptions.push(this.route.queryParamMap.subscribe(data => {
      console.log("query params: ", data);
      if (data['params'].id) {
        this.configIndex = data['params'].id;
        this.dashboardView = false;
      }
      if (this.viewSubscription != null){
        this.viewSubscription.unsubscribe();
      }
      this.viewSubscription = this.views.currentWidgetConfigs.subscribe(config => {
        console.log(config);
        if ((config != null) && (config.length>0) && (this.configIndex<config.length)){
          if (typeof this.configIndex !== 'undefined') {
            console.log(config)
            console.log(this.configIndex);
            this.config = config[this.configIndex].config;
          } else {
            this.configIndex = this.route.snapshot.queryParams.id;
            this.config = config[this.configIndex].config;
          }
        }
      });
    }));
    console.log("configIndex", this.configIndex);


  }

  requestFullscreen() {
    this.openFullscreen.emit(this.configIndex);
  }

  exportLogbook(){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.disableClose = true;
    dialogConfig.data = this.config;
    this.dialog.open(ExportDialogComponent, dialogConfig);
  }

  async openPreferences() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.disableClose = true;
    dialogConfig.data = {config: this.config};
    const dialogRef = this.dialog.open(WidgetPreferencesComponent, dialogConfig);
    let data = await dialogRef.afterClosed().toPromise();
    if (data) {
      console.log("Dialog output:", data);
      this.views.updateWidgetConfig(data, this.configIndex);
      this.config = data;
      switch (this.config.general.type) {
        case "logbook":
          this.logbookChild.ngOnInit();
          break;
        default:
          break;
      }
    }
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(
      (subscription) => subscription.unsubscribe());
  }

  @HostListener('window:beforeunload')
  canDeactivate(): boolean {
    if (false) return true;
    return false;
  }

}
