import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { WidgetConfig } from '@model/config';

@Component({
    selector: 'app-navigation-button',
    templateUrl: './navigation-button.component.html',
    styleUrls: ['./navigation-button.component.scss'],
    standalone: false
})
export class NavigationButtonComponent implements OnInit {

  @Input()
  widgetConfigs: WidgetConfig[];

  @Input()
  logbookId: string;

  @Input()
  container: number[];

  @Input()
  type: string;

  @Input()
  badgeNumber: number;

  iconName: string;
  iconTip: string;
  urlPath: object;
  subscriptions: Subscription[] = [];

  constructor(private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    if (this.route.parent != null){
      this.subscriptions.push(this.route.parent.url.subscribe((urlPath)=>{
        this.urlPath = urlPath;
      }));
    }

    switch (this.type) {
      case "logbook":
        this.iconName = 'book';
        this.iconTip = "Logbook";
        break;
      case "plot":
        this.iconName = 'show_chart';
        this.iconTip = "Plot";
        break;
      case "task":
        this.iconName = 'playlist_add_check';
        this.iconTip = "Tasks";
        break;
      case "chat":
        this.iconName = 'chat';
        this.iconTip = "Chat";
        break;
      case "snippetViewer":
        this.iconName = 'pageview';
        this.iconTip = "SnippetViewer";
        break;
      default:
        break;
    }
  }

  navigateToItem(index:number){
    if (typeof this.urlPath != "undefined"){
      let routerPath = '';
      for (const key in this.urlPath) {
        console.log(this.urlPath[key]);
        routerPath += "/" + this.urlPath[key]["path"];
      }
      console.log([routerPath + '/logbooks/' + this.logbookId + '/dashboard-item']);
      this.router.navigate(['logbooks/' + this.logbookId + '/dashboard-item'], {queryParams: {id: index}});
    }
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    })
  }

}
