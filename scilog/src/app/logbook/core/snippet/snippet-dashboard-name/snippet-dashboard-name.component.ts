import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ChangeStreamNotification } from '../../changestreamnotification.model';
import { Basesnippets } from '@model/basesnippets';
import { LogbookItemDataService } from '@shared/remote-data.service';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'snippet-dashboard-name',
    templateUrl: './snippet-dashboard-name.component.html',
    styleUrls: ['./snippet-dashboard-name.component.css'],
    imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatFormField, MatLabel, MatInput, FormsModule, MatDialogActions, MatButton]
})
export class SnippetDashboardNameComponent implements OnInit {

  snippet: Basesnippets;
  updateSubscription: Subscription = null; 

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Basesnippets,
    private dialogRef: MatDialogRef<SnippetDashboardNameComponent>,
    private dataService: LogbookItemDataService) {
      this.snippet = data;
     }

  ngOnInit(): void {

  }

  cancelClick(){
    this.dialogRef.close();
  }

  async saveClick(){
    let payload: ChangeStreamNotification = {
      dashboardName: this.snippet.dashboardName
    };
    console.log(payload)
    await this.dataService.uploadParagraph(payload, this.snippet.id);
    this.dialogRef.close();
  }

}
