import { Component, OnInit, Output, EventEmitter, Input, ElementRef, ViewChild, afterNextRender, OnDestroy } from '@angular/core';
import { WidgetConfig, WidgetItemConfig } from '@model/config';
import { Subscription } from 'rxjs';
import { UserPreferencesService } from '@shared/user-preferences.service';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { TagService } from '@shared/tag.service';
import { Hotkeys } from '@shared/hotkeys.service';
import { SearchScrollService } from 'src/app/core/search-scroll.service';
import { NgIf, NgFor } from '@angular/common';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { SearchComponent } from '../search/search.component';
import { MatDivider } from '@angular/material/divider';

@Component({
    selector: 'app-search-window',
    templateUrl: './search-window.component.html',
    styleUrls: ['./search-window.component.css'],
    imports: [NgIf, MatFormField, MatInput, FormsModule, MatTooltip, MatIconButton, MatIcon, SearchComponent, MatDivider, NgFor]
})
export class SearchWindowComponent implements OnInit, OnDestroy {

  @Input()
  configsArray: WidgetConfig[];

  @Input()
  searched: string;

  config: WidgetItemConfig;

  @Output() closed = new EventEmitter<void>();
  @Output() overviewSearch = new EventEmitter<string>();

  @ViewChild('searchSnippets') searchSnippets: ElementRef;

  _searchString: string = '';
  searchSnippetIndex: string = '';
  tags: string[] = [];
  _sample_user: string = "";
  subscriptions: Subscription[] = [];
  logbookId?: string;
  searchStringFromConfig = '';

  constructor(
    public userPreferences: UserPreferencesService,
    private logbookInfo: LogbookInfoService,
    private tagService: TagService,
    private hotkeys: Hotkeys,
    private searchScrollService: SearchScrollService,
  ) { 
    afterNextRender({ read: () => this.searchSnippets.nativeElement.focus() });
  }

  async ngOnInit(): Promise<void> {
    this.searchString = this.searched;
    this.logbookId = this.logbookInfo?.logbookInfo?.id;
    await this._initialize_help();
    this.config = this._prepareConfig();

    this.subscriptions.push(this.hotkeys.addShortcut({ keys: 'esc', description: { label: 'Close search', group: "General" } }).subscribe(() => {
      this.closeSearch();
    }));
    this.subscriptions.push(this.hotkeys.addShortcut({ keys: 'enter', description: { label: 'Submit search', group: "General" } }).subscribe(() => {
      this.submitSearch();
    }));

  }

  submitSearch() {
    this.searched = this.searchString;
    if (this.logbookId) {
      this.searchScrollService.reset(this.concatSearchStrings());
      return
    }
    this.overviewSearch.emit(this.searchString);
    this.closeSearch();
  }

  private concatSearchStrings(): string {
    return `${this.searchString} ${this.searchStringFromConfig}`.trim();
  }

  private async _initialize_help() {

    this._sample_user = this.userPreferences.userInfo.username;
    if (typeof this._sample_user == 'undefined') {
      this._sample_user = "p12345";
    }
    if (!this.logbookId) return
    this.tags = await this.tagService?.getTags();
    if (this.tags?.length === 0) {
      this.tags = ["alignment"];
    }
  }

  reset() {
    this.searchString = "";
  }

  addToSearch(val: string) {
    let _stringParts = val.split(" ");
    _stringParts.forEach((subVal) => {
      if (!this.searchString?.includes(subVal)) {
        this.searchString = `${subVal} ${this.searchString ?? ''}`;
      }
    }
    );
  }

  closeSearch() {
    this.reset();
    this.closed.emit();
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
    const config = JSON.parse(JSON.stringify(this._extractConfig() ?? this.defaultConfig));
    if (!config?.filter?.tags && !config?.filter?.excludeTags)
      return config;
    this._prepareTags(config);
    this.searchStringFromConfig = this.composeSearchString(config.filter);
    return config;
  }

  private _prepareTags(config: Partial<WidgetItemConfig>) {
    if (config.filter?.tags?.length > 0)
      this.tags = this.tags.filter(tag => config.filter.tags.includes(tag));
    if (config.filter?.excludeTags?.length > 0)
      this.tags = this.tags.filter(tag => !config.filter.excludeTags.includes(tag));
  }

  private _extractConfig() {
    return this.configsArray?.filter?.(configItem => 
      configItem?.config?.filter?.targetId === this.logbookId &&
      configItem?.config?.general?.type === 'logbook' &&
      configItem?.config?.general?.title === 'Logbook view'
    )?.[0]?.config;
  }

  private tagsToString(configFilter: WidgetItemConfig['filter'], tagKey: string, prefix: string) {
    const tagsString = `${configFilter?.[tagKey]?.length > 0? `${prefix}` + configFilter?.[tagKey].join(` ${prefix}`): ''}`
    delete configFilter[tagKey]
    return tagsString
  }

  private composeSearchString(configFilter: WidgetItemConfig['filter']) {
    return `${this.tagsToString(configFilter, 'excludeTags', '-#')} ${this.tagsToString(configFilter, 'tags', '#')}`.trim();
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subscriptions.forEach((sub)=>{
      sub.unsubscribe();
    })
  }

}
