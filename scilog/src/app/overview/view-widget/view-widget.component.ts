import { Component, EventEmitter, Output, Input } from '@angular/core';
import {Views} from '@model/views';

@Component({
    selector: 'app-view-widget',
    templateUrl: './view-widget.component.html',
    styleUrls: ['./view-widget.component.css']
})
export class ViewWidgetComponent {

  @Output() viewSelection = new EventEmitter<string>();

  @Input()
  view: Views;

  constructor() { }

  selection() {
    this.viewSelection.emit(this.view.id);
  }

}
