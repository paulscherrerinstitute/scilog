import { Component, OnInit, Output, EventEmitter, Input, ElementRef, ViewChild } from '@angular/core';
import { WidgetConfig, WidgetItemConfig } from '@model/config';
import { Subscription } from 'rxjs';
import { UserPreferencesService } from '@shared/user-preferences.service';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { TagService } from '@shared/tag.service';
import { Hotkeys } from '@shared/hotkeys.service';
import { LogbookIconScrollService } from 'src/app/overview/logbook-icon-scroll-service.service';
import { SearchScrollService } from 'src/app/core/search-scroll.service';

@Component({
  selector: 'search-window',
  templateUrl: './search-window.component.html',
  styleUrls: ['./search-window.component.css'],
})
export class SearchWindowComponent implements OnInit {

  @Input()
  configsArray: WidgetConfig[];

  @Input()
  searched: string;

  config: WidgetItemConfig;

  @Output() close = new EventEmitter<void>();
  @Output() overviewSearch = new EventEmitter<string>();

  @ViewChild('searchSnippets') searchSnippets: ElementRef;

  _searchString: string = '';
  searchSnippetIndex: string = '';
  tags: string[] = [];
  _sample_user: string = "";
  subscriptions: Subscription[] = [];
  logbookId?: string;

  constructor(
    public userPreferences: UserPreferencesService,
    private logbookInfo: LogbookInfoService,
    private tagService: TagService,
    private hotkeys: Hotkeys,
    private logbookIconScrollService: LogbookIconScrollService,
    private searchScrollService: SearchScrollService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.searchString = this.searched;
    this.logbookId = this.logbookInfo?.logbookInfo?.id;
    this.config = this._prepareConfig();

    await this._initialize_help();
    this.subscriptions.push(this.hotkeys.addShortcut({ keys: 'esc', description: { label: 'Close search', group: "General" } }).subscribe(() => {
      this.closeSearch();
    }));
    this.subscriptions.push(this.hotkeys.addShortcut({ keys: 'enter', description: { label: 'Submit search', group: "General" } }).subscribe(() => {
      this.submitSearch();
    }));

  }
  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.

    this.searchSnippets.nativeElement.focus();
  }

  submitSearch() {
    this.searched = this.searchString;
    if (this.logbookId) {
      this.searchScrollService.reset(this.searchString);
      return
    }
    this.logbookIconScrollService.reset(this.searchString);
    this.overviewSearch.emit(this.searchString);
    this.closeSearch();
  }

  private async _initialize_help() {

    this._sample_user = this.userPreferences.userInfo.username;
    // roles.find((val)=>{
    //   if ((val.length == 6)&&(val.substring(0,1)=="p")){
    //     return true;
    //   }
    //   return false;
    // })
    if (typeof this._sample_user == 'undefined') {
      this._sample_user = "p12345";
    }
    if (!this.logbookId) return
    this.tags = await this.tagService?.getTags();
    if (this.tags?.length == 0) {
      this.tags = ["alignment"];
    }
  }

  reset() {
    this.searchString = "";
  }

  addToSearch(val: string) {
    let _stringParts = val.split(" ");
    _stringParts.forEach((subVal) => {
      if (!this.searchString.includes(subVal)) {
        this.searchString = subVal + " " + this.searchString;
      }
    }
    );
  }

  closeSearch() {
    this.reset();
    this.close.emit();
  }

  set searchString(searchString: string) {
    this._searchString = searchString;
    if (!searchString) this.searched = searchString;
  }

  get searchString() {
    return this._searchString;
  }

  get defaultConfig() {
    return {
      filter: {
        targetId: this.logbookId,
      },
      general: {
        type: "logbook",
        readonly: true
      },
      view: {
        order: ["defaultOrder DESC"],
        hideMetadata: false,
        showSnippetHeader: false
      }
    };
  }

  private _prepareConfig() {
    return this._extractConfig() ?? this.defaultConfig;
  }

  private _extractConfig() {
    return this.configsArray?.filter?.(configItem => 
      configItem?.config?.filter?.targetId === this.logbookId &&
      configItem?.config?.general?.type === 'logbook' &&
      configItem?.config?.general?.title === 'Logbook view'
    )?.[0]?.config;
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subscriptions.forEach((sub)=>{
      sub.unsubscribe();
    })
  }

}
