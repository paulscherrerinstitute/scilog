import { Component, OnInit, ComponentFactoryResolver } from '@angular/core';
import { ChangeStreamService } from '@shared/change-stream.service';
import { ChangeStreamNotification } from '@shared/changestreamnotification.model'
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { Logbooks } from '@model/logbooks';
import { WidgetConfig } from '@model/config';
import { TasksService } from '@shared/tasks.service'
import { ViewsService } from '@shared/views.service';
import { TagService } from '@shared/tag.service';

@Component({
  selector: 'logbook',
  templateUrl: './logbook.component.html',
  styleUrls: ['./logbook.component.scss'],
  providers: [ChangeStreamService]

})

export class LogbookComponent implements OnInit {
  logbookId: string;

  showLoadingCircle = true;
  array: ChangeStreamNotification[];

  numTasks = 0;

  sidenavOpened = true;
  sidenavOver = 'push';
  expandHeight = '42px';
  collapseHeight = '42px';
  displayMode = 'flat';
  mobile = false;
  viewOption = 'table';
  logbook: Logbooks;
  widgetConfigs: WidgetConfig[];
  dashboardView = true;

  logbookContainer: number[] = [];
  tasksContainer: number[] = [];
  chatContainer: number[] = [];
  plotContainer: number[] = [];
  snippetViewerContainer: number[] = [];

  subscriptions: Subscription[] = [];

  constructor(
    private media: MediaObserver,
    private route: ActivatedRoute,
    private logbookInfo: LogbookInfoService,
    private tasks: TasksService,
    private views: ViewsService,
    private router: Router,
    private tags: TagService) {
    this.subscriptions.push(this.media.asObservable().subscribe((change: any) => {
      if (change[0].mqAlias === 'sm' || change[0].mqAlias === 'xs') {
        this.sidenavOpened = false;
        this.sidenavOver = 'over';
        this.mobile = true;
        console.log("mobile");
        if (this.route.snapshot.queryParams.id) {
          this.dashboardView = false;
        }
        // this.initialNavigation(); -- this should be fixed!!!
      } else {
        this.sidenavOpened = true;
        this.sidenavOver = 'side';
        this.mobile = false;
      }
    }));
  }

  ngOnInit() {
    this.subscriptions.push(this.tasks.currentTasks.subscribe(tasks => {
      this.numTasks = this.tasks.numTasks;
    }));

    this.subscriptions.push(this.views.currentWidgetConfigs.subscribe(view => {
      if ((view != null) && (view.length > 0)){
        console.log(view);
        this.widgetConfigs = view;
        this.logbookContainer = [];
        this.chatContainer = [];
        this.tasksContainer = [];
        this.plotContainer = [];
        this.snippetViewerContainer = [];
        view.forEach((view, index) => {
          switch (view.config.general.type) {
            case "logbook":
              this.logbookContainer.push(index);
              break;
            case "chat":
              this.chatContainer.push(index);
              break;
            case "graph":
              this.plotContainer.push(index);
              break;
            case "tasks":
              this.tasksContainer.push(index);
              break;
            case "snippetViewer":
              this.snippetViewerContainer.push(index)
              break;
            default:
              break;
          }
        })
      }
    }));

    this.subscriptions.push(this.route.paramMap.subscribe(params => {
      this.logbookId = params.get('logbookId');
      console.log('logbook: ', this.logbookId);
    }));
    this.updateLogbookInfo();
  }

  async updateLogbookInfo(){
    if (this.logbookInfo.logbookInfo == null) {
      await this.logbookInfo.getLogbookInfo(this.logbookId);
    }
    await this.tags.updateTags();
    console.log(this.tags.getTags());
  }

  openMenu() {
    this.sidenavOpened = !this.sidenavOpened;
  }

  deactivateLogbook() {
    this.logbookInfo.logbookInfo = null;
  }

  openDashboardItem(id: number) {

  }

  initialNavigation() {
    if (this.mobile && this.logbookId) {
      console.log(['logbooks/' + this.logbookId + '/dashboard-item'])
      this.router.navigate(['logbooks/' + this.logbookId + '/dashboard-item'], { queryParams: { id: 0 } });
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(
      (subscription) => subscription.unsubscribe());
  }


}
