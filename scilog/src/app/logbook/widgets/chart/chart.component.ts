import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { ChangeStreamService } from '@shared/change-stream.service';
import { Basesnippets } from '@model/basesnippets';
import { ViewsService } from '@shared/views.service';
import { PlotDataService } from '@shared/remote-data.service';
import { WidgetConfig, WidgetItemConfig } from '@model/config';
import { NgChartsModule } from 'ng2-charts';

@Component({
    selector: 'chart',
    templateUrl: './chart.component.html',
    styleUrls: ['./chart.component.css'],
    imports: [NgChartsModule]
})
export class ChartComponent implements OnInit {

  @Input()
  configIndex: number;

  config: WidgetItemConfig;
  snippetId: string;
  snippetData: Basesnippets = null;


  public lineChartLabels = [];
  public lineChartData = [
    { data: [], label: '' },
    // {data: [90, 150, 200, 45], label: '2018'}
  ];
  public lineChartType = 'line';

  subscriptions: Subscription[] = [];

  lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    maxTicksLimit: 5,
    scales: {
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Counts'
        },
        type: 'logarithmic'
      }],
      xAxes: [{
        ticks: {
          maxTicksLimit: 5
        }
      }]
    },
    animation: {
      duration: 50
    }
  };
  snippetSubscription: any;
  notificationSubscription: any;


  constructor(private views: ViewsService,
    private dataService: PlotDataService,
    private logbookInfo: LogbookInfoService,
    private notificationService: ChangeStreamService) { }

  ngOnInit(): void {
    console.log("create chartComponent")
    this.subscriptions.push(this.views.currentWidgetConfigs.subscribe((config:WidgetConfig[]) => {
      console.log(this.configIndex)
      console.log(config)
      if ((config != null) && (typeof this.configIndex != "undefined") && (this.configIndex < config.length)) {
        console.log(config)
        this.snippetId = config[this.configIndex].config.filter.targetId;
        this.config = config[this.configIndex].config;
        if (this.snippetId){
          this.getPlotSnippets();
        }
        this.startNotificationManager();
        
      }
    }));
  }

  startNotificationManager(){
    if (this.notificationSubscription != null) {
      this.notificationSubscription.unsubscribe();
    }
    console.log(this.logbookInfo.logbookInfo.id)
    let configPlot = this.config;
    configPlot.filter.snippetType = ["plot"];
    this.notificationSubscription = this.notificationService.getNotification(this.logbookInfo.logbookInfo.id, configPlot).subscribe(data => {
      console.log(data);
      if (this.snippetData != null){
        if (data.id == this.snippetData.id) {
          for (const key in data.content) {
            this.snippetData[key] = data.content[key];
          }
        }
        this.updateChartData();
      }
    });
  }

  async getPlotSnippets(){

    let snippet = await this.dataService.getPlotSnippets(this.snippetId); 
    this.snippetData = snippet[0];
    console.log(this.snippetData);
    if (typeof this.snippetData != 'undefined'){
      this.updateChartData();
    }
  }

  updateChartData(){
    this.lineChartLabels = [];
    this.lineChartData[0]["data"] = [];
    this.lineChartData[0]["label"] = this.snippetData["name"];
    if (typeof this.snippetData['plottable'] != 'undefined'){
      this.snippetData['plottable'].forEach(entry => {
        this.lineChartLabels.push(entry["x"])
        this.lineChartData[0]["data"].push(entry["y"])
      });
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

