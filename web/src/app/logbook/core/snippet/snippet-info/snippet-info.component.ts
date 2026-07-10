import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
} from '@angular/material/dialog';
import { Basesnippets } from '@model/basesnippets';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { SnippetInfoSectionComponent } from './snippet-info-section/snippet-info-section.component';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-snippet-info',
  templateUrl: './snippet-info.component.html',
  styleUrls: ['./snippet-info.component.css'],
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    SnippetInfoSectionComponent,
    MatDialogActions,
    MatButton,
  ],
})
export class SnippetInfoComponent {
  snippet: Basesnippets;

  infoFieldsGeneral = ['id', 'dashboardName'];
  infoFieldsPermissions = ['ownerGroup', 'accessGroups'];
  infoFieldsType = ['snippetType'];
  infoFieldsCreated = ['createdBy', 'createdAt'];
  infoFieldsUpdated = ['updatedBy', 'updatedAt'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Basesnippets,
    private dialogRef: MatDialogRef<SnippetInfoComponent>,
  ) {
    this.snippet = data;
  }

  closeInfo() {
    this.dialogRef.close();
  }
}
