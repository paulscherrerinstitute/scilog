import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { SearchScrollService } from 'src/app/core/search-scroll.service';
import { ScrollToElementService } from '../scroll-to-element.service';
import { WidgetItemConfig } from 'src/app/core/model/config';
import { animate, style, transition, trigger } from '@angular/animations';
import { NgIf } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { UiScrollModule } from 'ngx-ui-scroll';
import { SnippetComponent } from '../snippet/snippet.component';

@Component({
    selector: 'search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.css'],
    animations: [
        trigger('spinner', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('1ms 0.2s ease-out', style({ opacity: 1 }))
            ])
        ]),
    ],
    imports: [NgIf, MatProgressSpinner, UiScrollModule, SnippetComponent]
})
export class SearchComponent implements OnInit {

  @Input()
  config: WidgetItemConfig;

  @Output() close = new EventEmitter<void>();

  constructor(
    public searchScrollService: SearchScrollService,
    private scrollToElementService: ScrollToElementService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.searchScrollService.initialize(this.config);
  }

  selectedSnippet($event) {
    console.log($event);
    this.scrollToElementService.selectedItem = {
      event: $event,
      config: this.config
    };
    this.close.emit();
  }

}
