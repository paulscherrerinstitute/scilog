import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, Input, NgZone, OnInit, ViewChild } from '@angular/core';
import { take } from 'rxjs/operators';
import { Basesnippets } from '@model/basesnippets';
import { NgFor } from '@angular/common';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';


@Component({
    selector: 'snippet-info-section',
    templateUrl: './snippet-info-section.component.html',
    styleUrls: ['./snippet-info-section.component.css'],
    imports: [NgFor, MatFormField, MatLabel, MatInput, CdkTextareaAutosize, FormsModule]
})
export class SnippetInfoSectionComponent implements OnInit {

  @Input()
  infoSnippets: string[];

  @Input()
  data: Basesnippets;

  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  infoFieldsGeneral = ['id', 'dashboardName'];
  infoFieldsPermissions = ['ownerGroup', 'accessGroups'];
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
