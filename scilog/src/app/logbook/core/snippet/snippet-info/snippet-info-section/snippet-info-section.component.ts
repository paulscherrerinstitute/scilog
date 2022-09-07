import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, Input, NgZone, OnInit, ViewChild } from '@angular/core';
import { take } from 'rxjs/operators';
import { Basesnippets } from '@model/basesnippets';


@Component({
  selector: 'snippet-info-section',
  templateUrl: './snippet-info-section.component.html',
  styleUrls: ['./snippet-info-section.component.css']
})
export class SnippetInfoSectionComponent implements OnInit {

  @Input()
  infoSnippets: string[];

  @Input()
  data: Basesnippets;

  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  infoFieldsGeneral = ['id', 'dashboardName'];
  infoFieldsPermissions = ['createACL', 'readACL', 'updateACL', 'deleteACL', 'shareACL', 'adminACL'];
  infoFieldsType = ['snippetType'];
  infoFieldsCreated = ['createdBy', 'createdAt'];
  infoFieldsUpdated = ['updatedBy', 'updatedAt'];

  constructor(private _ngZone: NgZone) { }

  ngOnInit(): void {
  }

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }

}
