import { Component, Input, SecurityContext } from '@angular/core';
import { ChangeStreamNotification } from '@shared/changestreamnotification.model';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import {
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow,
} from '@angular/material/table';
import { MatButton } from '@angular/material/button';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-snippet-table',
  templateUrl: './snippet-table.component.html',
  styleUrls: ['./snippet-table.component.css'],
  imports: [
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatButton,
    MatMenuTrigger,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
  ],
})
export class SnippetTableComponent {
  @Input()
  snippets: ChangeStreamNotification[];

  secContext = SecurityContext;

  displayedColumns: string[] = ['index', 'content', 'action'];

  constructor(public sanitizer: DomSanitizer) {}
}
