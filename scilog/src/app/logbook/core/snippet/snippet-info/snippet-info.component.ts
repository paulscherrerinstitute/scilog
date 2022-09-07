import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Basesnippets } from '@model/basesnippets';


@Component({
  selector: 'snippet-info',
  templateUrl: './snippet-info.component.html',
  styleUrls: ['./snippet-info.component.css']
})
export class SnippetInfoComponent implements OnInit {

  snippet: Basesnippets;

  infoFieldsGeneral = ['id', 'dashboardName'];
  infoFieldsPermissions = ['createACL', 'readACL', 'updateACL', 'deleteACL', 'shareACL', 'adminACL'];
  infoFieldsType = ['snippetType'];
  infoFieldsCreated = ['createdBy', 'createdAt'];
  infoFieldsUpdated = ['updatedBy', 'updatedAt'];

  constructor(@Inject(MAT_DIALOG_DATA) public data: Basesnippets,
    private dialogRef: MatDialogRef<SnippetInfoComponent>) {
    this.snippet = data;
  }

  ngOnInit(): void {

  }

  closeInfo() {
    this.dialogRef.close();
  }

}


