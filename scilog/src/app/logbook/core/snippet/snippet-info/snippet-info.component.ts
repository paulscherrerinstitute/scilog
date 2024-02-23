import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Basesnippets } from '@model/basesnippets';


@Component({
  selector: 'snippet-info',
  templateUrl: './snippet-info.component.html',
  styleUrls: ['./snippet-info.component.css']
})
export class SnippetInfoComponent implements OnInit {

  snippet: Basesnippets;

  infoFieldsGeneral = ['id', 'dashboardName'];
  infoFieldsPermissions = ['ownerGroup', 'accessGroups'];
  infoFieldsType = ['snippetType'];
  infoFieldsCreated = ['createdBy', 'createdAt'];
  infoFieldsUpdated = ['updatedBy', 'updatedAt'];

  constructor(@Inject(MAT_DIALOG_DATA) public data: Basesnippets,
  private dialogRef: MatDialogRef<SnippetInfoComponent>) { 
    this.snippet = data;
  }

  ngOnInit(): void {

  }

  closeInfo(){
    this.dialogRef.close();
  }

}


