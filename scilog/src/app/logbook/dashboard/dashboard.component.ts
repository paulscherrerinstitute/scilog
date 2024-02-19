import { Component, HostListener, OnInit } from '@angular/core';
import { CompactType, DisplayGrid, GridsterConfig, GridsterItemComponent, GridType } from 'angular-gridster2';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ViewsService } from '@shared/views.service';
import { WidgetConfig } from '@model/config';
import { Hotkeys } from '@shared/hotkeys.service';
import { ComponentCanDeactivate } from '../core/navigation-guard-service';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, ComponentCanDeactivate {


  urlPath: object;
  dashboard: WidgetConfig[] = [];
  itemToPush: GridsterItemComponent;

  optionsEdit: GridsterConfig;
  renderContent = true;
  editMode = false;
  editGridText = 'Edit dashboard';
  mobile = false;

  options: GridsterConfig = {
    gridType: GridType.Fit,
    compactType: CompactType.None,
    margin: 5,
    outerMargin: true,
    outerMarginTop: null,
    outerMarginRight: null,
    outerMarginBottom: null,
    outerMarginLeft: null,
    useTransformPositioning: true,
    mobileBreakpoint: 640,
    minCols: 1,
    maxCols: 100,
    minRows: 1,
    maxRows: 100,
    minColWidth: 300,
    maxItemCols: 100,
    minItemCols: 1,
    maxItemRows: 100,
    minItemRows: 1,
    maxItemArea: 2500,
    minItemArea: 1,
    defaultItemCols: 1,
    defaultItemRows: 1,
    // fixedColWidth: 105,
    // fixedRowHeight: 105,
    keepFixedHeightInMobile: false,
    keepFixedWidthInMobile: false,
    scrollSensitivity: 10,
    scrollSpeed: 20,
    enableEmptyCellClick: false,
    enableEmptyCellContextMenu: false,
    enableEmptyCellDrop: false,
    enableEmptyCellDrag: false,
    enableOccupiedCellDrop: false,
    emptyCellDragMaxCols: 50,
    emptyCellDragMaxRows: 50,
    ignoreMarginInRow: false,
    draggable: {
      enabled: false,
    },
    resizable: {
      enabled: false,
    },
    swap: true,
    pushItems: true,
    disablePushOnDrag: false,
    disablePushOnResize: false,
    pushDirections: { north: true, east: true, south: true, west: true },
    pushResizeItems: false,
    displayGrid: DisplayGrid.None,
    disableWindowResize: false,
    disableWarnings: false,
    scrollToNewItems: false
  };

  viewId: string;
  subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private views: ViewsService,
    private hotkeys: Hotkeys) { }

  ngOnInit(): void {
    this.optionsEdit = JSON.parse(JSON.stringify(this.options)); // seriously??? I cannot believe that's the only way to perform a deep copy of an object
    this.optionsEdit.draggable = { 'enabled': true };
    this.optionsEdit.resizable = { 'enabled': true };
    this.optionsEdit.displayGrid = DisplayGrid.Always;

    this.subscriptions.push(this.hotkeys.addShortcut({ keys: 'shift.control.d', description: { label: 'Add dashboard widget', group: "Dashboard" } }).subscribe(() => {
      this.addItemToDashboard("right");
      console.log("adding widget");
    }));
    this.subscriptions.push(this.views.currentWidgetConfigs.subscribe(config => {
      if (config != null) {
        console.log(config);
        this.dashboard = config;
      }
    }));
    console.log(this.optionsEdit);
    console.log(this.options);

    if (this.route.parent != null) {
      this.subscriptions.push(this.route.parent.url.subscribe((urlPath) => {
        this.urlPath = urlPath;
      }));
    }
  }

  editGrid() {

    this.editMode = !this.editMode;
    if (this.editMode) {
      console.log("editing grid");
      this.renderContent = false;
      this.editGridText = 'Done';
    } else {
      this.renderContent = true;
      console.log(this.dashboard);
      this.editGridText = 'Edit dashboard';
      this.views.updateAllWidgets(this.dashboard);
    }

  }

  removeItem($event: MouseEvent | TouchEvent, item): void {
    $event.preventDefault();
    $event.stopPropagation();
    this.dashboard.splice(this.dashboard.indexOf(item), 1);
  }

  addItemToDashboard(position = null): void {
    if (position == null) {
      this.dashboard.push({
        x: 0, y: 0, cols: 1, rows: 1, config: {
          general: {
            type: "",
            title: ""
          },
          filter: {},
          view: {}
        }
      });
    } else {
      let xMax: number = 0;
      let yMax: number = 0;
      let minWidth: number = 999;
      let minHeight: number = 999;
      this.dashboard.forEach(dashboardItem => {
        if (dashboardItem.x > xMax) {
          xMax = dashboardItem.x;
        }
        if (dashboardItem.y > yMax) {
          yMax = dashboardItem.y;
        }
        if (dashboardItem.cols < minWidth) {
          minWidth = dashboardItem.cols;
        }
        if (dashboardItem.rows < minHeight) {
          minHeight = dashboardItem.rows;
        }
      })
      switch (position) {
        case "left":
          this.dashboard.push({
            x: 0, y: 0, cols: minWidth, rows: minHeight, config: {
              general: {
                type: "",
                title: ""
              },
              filter: {},
              view: {}
            }
          });
          break;

        default:
          this.dashboard.push({
            x: xMax + 1, y: yMax, cols: minWidth, rows: minHeight, config: {
              general: {
                type: "",
                title: ""
              },
              filter: {},
              view: {}
            }
          });
          break;
      }

    }
  }

  openFullscreen(index: number) {
    let routerPath = '';
    for (const key in this.urlPath) {
      console.log(this.urlPath[key]);
      routerPath += "/" + this.urlPath[key]["path"];
    }
    // console.log("routerPath:", routerPath, $event["type"]);
    this.router.navigate([routerPath, 'dashboard-item'], { queryParams: { id: index } });
  }

  @HostListener('window:resize')
  onResized() {
    this.mobile = window.innerWidth < 959;
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
