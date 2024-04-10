import { Component, OnInit, Output, EventEmitter, Input, ElementRef, ViewChild } from '@angular/core';
import { SearchScrollService } from '@shared/search-scroll.service';
import { WidgetConfig, WidgetItemConfig } from '@model/config';
import { Subscription } from 'rxjs';
import { SearchDataService } from '@shared/remote-data.service';
import { UserPreferencesService } from '@shared/user-preferences.service';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { TagService } from '@shared/tag.service';
import { ScrollToElementService } from '@shared/scroll-to-element.service';
import { Hotkeys } from '@shared/hotkeys.service';
import { animate, style, transition, trigger } from '@angular/animations';

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
  providers: [SearchScrollService],
  animations: [
    trigger('spinner', [
      transition(':enter', [
        style({opacity: 0}), 
        animate('1ms 0.2s ease-out', style({opacity: 1}))
      ])
    ]),
  ]
})
export class SearchWindowComponent implements OnInit {


  @Input()
  configsArray: WidgetConfig[];

  config: WidgetItemConfig;

  @Output() close = new EventEmitter<void>();

  @ViewChild('searchSnippets') searchSnippets: ElementRef;

  searchString: string = '';
  searchSnippetIndex: string = '';
  showResults = false;
  showHelp = true;
  tags: string[] = [];
  _sample_user: string = "";
  subscriptions: Subscription[] = [];
  searchedString: string;

  constructor(
    public searchScrollService: SearchScrollService,
    private searchDataservice: SearchDataService,
    public userPreferences: UserPreferencesService,
    private logbookInfo: LogbookInfoService,
    private tagService: TagService,
    private scrollToElementService: ScrollToElementService,
    private hotkeys: Hotkeys,
  ) { }

  async ngOnInit(): Promise<void> {
    // console.log(this.configsArray[1].config);
    this.config = this._prepareConfig();
    this.searchScrollService.initialize(this.config);

    this._initialize_help();

    this.subscriptions.push(this.hotkeys.addShortcut({ keys: 'esc', description: { label: 'Close search', group: "General" } }).subscribe(() => {
      this.closeSearch();
    }));
    this.subscriptions.push(this.hotkeys.addShortcut({ keys: 'enter', description: { label: 'Submit search', group: "General" } }).subscribe(() => {
      if (this.searchString)
        this.submitSearch(this.searchString);
    }));

  }
  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.

    this.searchSnippets.nativeElement.focus();
  }

  private async _initialize_help() {
    this.tags = await this.tagService.getTags();
    if (this.tags.length == 0) {
      this.tags = ["alignment"];
    }

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

  selectedSnippet($event) {
    console.log($event);
    this.scrollToElementService.selectedItem = $event;
    this.closeSearch();
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
    searchResult.location.push(this.logbookInfo.logbookInfo.id);
    console.log("Search value: ", this.searchString);
    console.log("Search config: ", searchResult)
    this.searchDataservice.searchString = this.searchString;
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

  submitSearch(searchText: string = '') {
    this.searchedString = searchText;
    if (searchText) {
      this.showHelp = false;
      this.showResults = true;
      this.searchScrollService.config = this._prepareConfig();
      this.searchScrollService.reset();
    } else {
      this.showHelp = true;
      this.showResults = false;
    }
  };

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subscriptions.forEach((sub)=>{
      sub.unsubscribe();
    })
  }

}
