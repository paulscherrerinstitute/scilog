import { Component, OnInit, Output, EventEmitter, Input, ElementRef, ViewChild } from '@angular/core';
import { SearchScrollService } from '@shared/search-scroll.service';
import { WidgetConfig, WidgetItemConfig } from '@model/config';
import { Subject, Subscription } from 'rxjs';
import { SearchDataService } from '@shared/remote-data.service';
import { debounceTime } from 'rxjs/operators';
import { UserPreferencesService } from '@shared/user-preferences.service';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { TagService } from '@shared/tag.service';
import { ScrollToElementService } from '@shared/scroll-to-element.service';
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
  providers: [SearchScrollService]
})
export class SearchWindowComponent implements OnInit {


  @Input()
  configsArray: WidgetConfig[];

  config: WidgetItemConfig;

  @Output() close = new EventEmitter<void>();

  @ViewChild('searchSnippets') searchSnippets: ElementRef;

  private _searchString: string = '';
  searchStringSubject: Subject<void> = new Subject();
  searchSnippetIndex: string = '';
  showResults = false;
  showHelp = true;
  tags: string[] = [];
  _sample_user: string = "";
  subscriptions: Subscription[] = [];


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

    this.subscriptions.push(this.searchStringSubject.pipe(debounceTime(500)).subscribe(() => {
      if (this._searchString.length > 0) {
        this.showResults = !this.showHelp;
      } else {
        this.showHelp = true;
        this.showResults = false;
      }
      this.searchScrollService.config = this._prepareConfig();
      this.searchScrollService.reset();

    }));
    this._initialize_help();

    this.subscriptions.push(this.hotkeys.addShortcut({ keys: 'esc', description: { label: 'Close search', group: "General" } }).subscribe(() => {
      this.closeSearch();
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

  public get searchString(): string {
    return this._searchString;
  }
  public set searchString(value: string) {
    if (this.searchString.length > 0) {
      this.showHelp = false;
    }
    this._searchString = value;
    this.searchStringSubject.next();
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
    let searchValue = "";
    let searchParts = this.searchString.split(" ");
    let _globalSearch = false;
    searchParts.forEach(searchPart => {
      console.log(searchPart);
      if (searchPart.length > 0) {
        if (searchPart.startsWith("@")) {
          searchResult.ownerGroup = searchPart.slice(1);
        } else if (searchPart.startsWith(":")) {
          if (searchPart == ":global") {
            _globalSearch = true;
          }
        } else if (searchPart.startsWith("#")) {
          console.log(searchPart)
          searchResult.tags.push(searchPart.slice(1));
        } else {
          searchValue += " " + searchPart;
        }
      }
    })
    if (!_globalSearch) {
      console.log("local search")
      searchResult.location.push(this.logbookInfo.logbookInfo.id);
    }
    console.log("Search value: ", searchValue);
    console.log("Search config: ", searchResult)
    this.searchDataservice.searchString = searchValue;
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
