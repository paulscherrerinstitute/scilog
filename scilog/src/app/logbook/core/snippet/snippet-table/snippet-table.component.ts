import { Component, OnInit, Input, SecurityContext } from '@angular/core';
import { ChangeStreamNotification } from '@shared/changestreamnotification.model';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'snippet-table',
  templateUrl: './snippet-table.component.html',
  styleUrls: ['./snippet-table.component.css']
})
export class SnippetTableComponent implements OnInit {


  @Input()
  snippets: ChangeStreamNotification[];

  secContext = SecurityContext;

  displayedColumns: string[] = ['index', 'content', 'action'];


  constructor(public sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    
  }

}
