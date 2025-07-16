import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { WidgetConfig, WidgetItemConfig } from '@model/config';
import { Logbooks } from '@model/logbooks';
import { Views } from '@model/views';
import { UserPreferencesService } from './user-preferences.service';
import { ViewDataService } from '@shared/remote-data.service';

@Injectable({
  providedIn: 'root'
})
export class ViewsService implements OnDestroy {

  widgetConfigs: WidgetConfig[] = [];
  private widgetConfigSource = new BehaviorSubject(this.widgetConfigs);
  public currentWidgetConfigs = this.widgetConfigSource.asObservable();
  public views: Views[] = [];
  private _currentView: Views = null;
  subscriptions: Subscription[] = [];
  personalViewIndex: number = null;
  private currentLogbook: Logbooks = null;

  defaultConfig: WidgetConfig[];

  constructor(
    private dataService: ViewDataService,
    private userPreferences: UserPreferencesService) {

    // default config
    this.defaultConfig = [{
      cols: 1,
      rows: 4,
      y: 0,
      x: 0,
      config: {
        general: {
          type: 'tasks',
          title: 'Tasks'
        },
        filter: {},
        view: {}
      }
    }, {
      cols: 2,
      rows: 4,
      y: 0,
      x: 1,
      config: {
        general: {
          type: 'logbook',
          title: 'Logbook view',
        },
        filter: {
          targetId: null,
          additionalLogbooks: [],
          tags: []
        },
        view: {
          order: ['defaultOrder ASC'],
          hideMetadata: false,
          showSnippetHeader: false
        }
      }
    }];
  }



  // get all views for a specific logbook
  async getLogbookViews(logbook: Logbooks) {
    this.currentLogbook = logbook;

    if (logbook != null) {
      // get user views
      let userViews = await this.dataService.getViews(logbook.id);
      userViews.forEach(view => {
        this.views.push(view);
      });

      // get location views
      let locationViews = await this.dataService.getViews(logbook.location);
      locationViews.forEach(view => {
        this.views.push(view);
      });

      // create default view if all of the above are not defined
      if (this.views.length == 0) {
        this.views.push({
          name: this.userPreferences.userInfo.username + "_personal",
          ownerGroup: this.userPreferences.userInfo.username,
          snippetType: 'view',
          parentId: this.currentLogbook.id,
          configuration: {
            'widgetConfig': JSON.parse(JSON.stringify(this.defaultConfig)),
            'isTemplate': true
          }
        });
      }
      this.setView();
      this.getPersonalView();

    } else {
      // unset views
      this.views = [];
      this._currentView = null;
      this.widgetConfigSource.next(null);
      this.personalViewIndex = null;

    }

  }

  public get view(): Views {
    return this._currentView;
  }

  public updateWidgetConfig(config: WidgetItemConfig, index: number) {
    this.widgetConfigs[index].config = config;
    this.widgetConfigSource.next(this.widgetConfigs)
    console.log("new config: ", this.widgetConfigs);
    this.updateView(this.widgetConfigs);
    this.saveView();
  }

  public updateAllWidgets(config: WidgetConfig[]){
    this.updateView(config);
    this.saveView();
  }

  public setView(index: number = null) {
    if (index != null) {
      if (this.views.length > index) {
        this._currentView = this.views[index];
      }
    } else {
      // TODO get last entry from user prefs; for now just take the first one
      this._currentView = this.views[0];
    }

    // update widget settings if it is a template
    if (this._currentView.configuration.isTemplate) {
      this.updateWidgetConfigTemplate();
    }
    // broadcast new widgetConfig
    console.log(this.views)
    this.widgetConfigs = this._currentView.configuration.widgetConfig;
    this.widgetConfigSource.next(this.widgetConfigs);
  }

  private updateView(config: WidgetConfig[]) {
    this._currentView.configuration.widgetConfig = config;
  }

  private async saveView(viewIndex: number = null) {
    if (viewIndex == null) {
      this.getPersonalView();
      if ((this.personalViewIndex == null) || (typeof this.views[this.personalViewIndex].id == 'undefined')) {
        // create new personal view entry
        let payload: Views = {
          name: this.userPreferences.userInfo.username + "_personal",
          ownerGroup: this.userPreferences.userInfo.username,
          snippetType: 'view',
          parentId: this.currentLogbook.id,
          configuration: {
            'widgetConfig': this.widgetConfigs,
            'isTemplate': false
          }
        }
        console.log(JSON.stringify(payload))
        let view_db = await this.dataService.postView(payload);
        if (view_db?.id){
          this.views[this.personalViewIndex] = view_db;
        }
        console.log(view_db);
        this.getPersonalView();
        console.log("Added view to DB")

        // TODO here, we should apped the new view to the list

      } else {
        // update personal view
        console.log('Personal view:', this.personalViewIndex)
        let payload: Views = {
          name: this.userPreferences.userInfo.username + "_personal",
          snippetType: 'view',
          configuration: {
            'widgetConfig': this.widgetConfigs,
            'isTemplate': false
          }
        }
        console.log(this.views)

        await this.dataService.patchView(payload, this.views[this.personalViewIndex].id);
        this.getPersonalView();
        console.log("Updated view in DB");
      }
    } else {
      if (viewIndex < this.views.length) {
        // update view
      }
    }


  }


  private updateWidgetConfigTemplate() {
    this._currentView.configuration.widgetConfig.forEach((configs:WidgetConfig) => {
      if (configs.config?.filter) {
        configs.config.filter.targetId = this.currentLogbook.id;
      }
    })
  }

  private getPersonalView() {
    if (this.views.length == 0) {
      this.personalViewIndex = null;
    } else {
      for (let index = 0; index < this.views.length; index++) {
        if (this.views[index].name == this.views[index].ownerGroup + "_personal") {
          this.personalViewIndex = index;
        }
      }
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
