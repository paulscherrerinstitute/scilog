import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { SearchScrollService } from 'src/app/core/search-scroll.service';
import { ScrollToElementService } from '../scroll-to-element.service';
import { WidgetItemConfig } from 'src/app/core/model/config';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  providers: [SearchScrollService],
  animations: [
    trigger('spinner', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('1ms 0.2s ease-out', style({ opacity: 1 }))
      ])
    ]),
  ]
})
export class SearchComponent implements OnInit {

  @Input()
  config: WidgetItemConfig;

  @Input()
  searchString: string;

  @Output() close = new EventEmitter<void>();

  constructor(
    public searchScrollService: SearchScrollService,
    private scrollToElementService: ScrollToElementService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.searchScrollService.initialize(this.config);
    if (this.searchString) this.submitSearch();
  }

  submitSearch() {
    this.searchScrollService.reset(this.searchString);
  }

  selectedSnippet($event) {
    console.log($event);
    this.scrollToElementService.selectedItem = $event;
    this.close.emit();
  }

}
