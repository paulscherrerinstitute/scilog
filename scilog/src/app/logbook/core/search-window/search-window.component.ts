import { Component, OnInit, Output, EventEmitter, Input, ElementRef, ViewChild } from '@angular/core';
import { WidgetConfig, WidgetItemConfig } from '@model/config';
import { Subscription } from 'rxjs';
import { UserPreferencesService } from '@shared/user-preferences.service';
import { TagService } from '@shared/tag.service';
import { Hotkeys } from '@shared/hotkeys.service';

interface SearchResult {
  location: string[],
  tags: string[],
  ownerGroup: string,
  createdBy: string,
  startDate: string,
  endDate: string,
}

@Component({
  selector: 'search-window',
  templateUrl: './search-window.component.html',
  styleUrls: ['./search-window.component.css'],
})
export class SearchWindowComponent implements OnInit {

  @Input()
  configsArray: WidgetConfig[];

  config: WidgetItemConfig;

  @Output() close = new EventEmitter<void>();

  @ViewChild('searchSnippets') searchSnippets: ElementRef;

  _searchString: string = '';
  searchSnippetIndex: string = '';
  tags: string[] = [];
  _sample_user: string = "";
  subscriptions: Subscription[] = [];
  submittedSearch: string;

  constructor(
    public userPreferences: UserPreferencesService,
    private tagService: TagService,
    private hotkeys: Hotkeys,
  ) { }

  async ngOnInit(): Promise<void> {
    this.config = this._prepareConfig();

    this._initialize_help();

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
    this.submittedSearch = this.searchString;
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
    this.tags = await this.tagService.getTags();
    if (this.tags.length == 0) {
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
    this.close.emit();
  }

  set searchString(searchString: string) {
    this._searchString = searchString;
    if (!searchString) this.submittedSearch = searchString;
  }

  get searchString() {
    return this._searchString;
  }

  private _parseSearchString(): SearchResult {
    let searchResult: SearchResult = {
      location: [],
      tags: [],
      ownerGroup: "",
      createdBy: "",
      startDate: "",
      endDate: "",
    }
    console.log("local search")
    console.log("Search value: ", this.searchString);
    console.log("Search config: ", searchResult)
    return searchResult;
  }

  private _prepareConfig() {
    let searchResult = this._parseSearchString();
    let _config: WidgetItemConfig = {
      filter: {
        targetId: "",
        additionalLogbooks: searchResult.location,
        tags: searchResult.tags,
        ownerGroup: searchResult.ownerGroup,
      },
      general: {
        type: "logbook",
        title: "",
        readonly: true
      },
      view: {
        order: ["defaultOrder DESC"],
        hideMetadata: false,
        showSnippetHeader: false
      }
    }
    return _config;
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subscriptions.forEach((sub)=>{
      sub.unsubscribe();
    })
  }

}
