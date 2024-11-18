import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IsAllowedService } from '../is-allowed.service';
import { Logbooks } from 'src/app/core/model/logbooks';

@Component({
  selector: 'actions-menu',
  templateUrl: './actions-menu.component.html',
  providers: [IsAllowedService],
})
export class ActionsMenuComponent implements OnInit {

  @Input() logbook: Logbooks;
  @Output() logbookEdit = new EventEmitter<Logbooks>();
  @Output() logbookDelete = new EventEmitter<string>();

  constructor(protected isAllowedService: IsAllowedService) {}
  
  ngOnInit(): void {
    this.enableActions();
  }

  private enableActions() {
    this.isAllowedService.snippet = this.logbook;
    this.isAllowedService.isAnyEditAllowed();
  }

  editLogbook() {
    this.logbookEdit.emit(this.logbook);
  }

  deleteLogbook() {
    this.logbookDelete.emit(this.logbook.id);
  }

}
