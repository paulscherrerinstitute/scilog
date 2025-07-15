import { Component, Input, OnInit, QueryList, ViewChildren, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ChangeStreamService } from '@shared/change-stream.service';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { ViewsService } from '@shared/views.service';
import { Basesnippets } from '@model/basesnippets';
import { SnippetComponent } from '@shared/snippet/snippet.component';
import { SnippetViewerDataService } from '@shared/remote-data.service';
import { WidgetItemConfig, WidgetConfig } from '@model/config';
import { NgFor } from '@angular/common';
import { SnippetComponent as SnippetComponent_1 } from '../../core/snippet/snippet.component';

@Component({
    selector: 'snippet-viewer',
    templateUrl: './snippet-viewer.component.html',
    styleUrls: ['./snippet-viewer.component.css'],
    imports: [NgFor, SnippetComponent_1]
})
export class SnippetViewerComponent implements OnInit, OnDestroy {


  @Input()
  configIndex: number;

  snippetId: string;

  config: WidgetItemConfig;
  subscriptions: Subscription[] = [];
  snippetViewerContent: Observable<Basesnippets[]>;
  notificationSubscription: any = null;
  snippetSubscription: Subscription = null;
  snippetData: Basesnippets[] = [];

  @ViewChildren(SnippetComponent) childSnippets: QueryList<SnippetComponent>;


  constructor(private views: ViewsService,
    private dataService: SnippetViewerDataService,
    private logbookInfo: LogbookInfoService,
    private notificationService: ChangeStreamService) { }

  ngOnInit(): void {
    console.log("create SnippetViewerComponent")
    this.subscriptions.push(this.views.currentWidgetConfigs.subscribe(config => {
      this.getSnippetData(config);
      this.config = config[this.configIndex].config;
      this.startNotificationManager();
    }));

    
  }

  startNotificationManager(){
    if (this.notificationSubscription != null) {
      this.notificationSubscription.unsubscribe();
    }
    this.notificationSubscription = this.notificationService.getNotification(this.logbookInfo.logbookInfo.id, this.config).subscribe(data => {
      console.log(data);
      this.snippetData.forEach(snippet => {
        if (data.id == snippet.id) {
          for (const key in data.content) {
            snippet[key] = data.content[key];
          }
        }
        console.log(this.childSnippets.length)
        this.childSnippets.toArray()[0].updateContent();
      })
    });
  }

  async getSnippetData(config:WidgetConfig[]){
    console.log(this.configIndex)
    if ((config != null) && (typeof this.configIndex != "undefined") && (this.configIndex < config.length)) {
      console.log(config)
      this.snippetId = config[this.configIndex].config.filter.targetId;
      this.snippetData = await this.dataService.getSnippetViewerData(this.snippetId);
    }
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    console.log("destroy snippetViewerComponent")
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    })
    if (this.snippetSubscription != null) {
      this.snippetSubscription.unsubscribe();
    }
    if (this.notificationSubscription != null) {
      this.notificationSubscription.unsubscribe();
    }
  }

}
