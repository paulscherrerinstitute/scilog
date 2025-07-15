import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogContent } from '@angular/material/dialog';
import { LogbookItemDataService } from '@shared/remote-data.service';
import { DatePipe, NgIf } from '@angular/common';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-export-dialog',
    templateUrl: './export-dialog.component.html',
    styleUrls: ['./export-dialog.component.css'],
    providers: [DatePipe],
    imports: [CdkScrollable, MatDialogContent, NgIf, MatProgressBar, MatButton]
})
export class ExportDialogComponent {

  config:any;
  inProgress = false;

  @ViewChild('downloadLink') private downloadLink: ElementRef;

  constructor(@Inject(MAT_DIALOG_DATA) public data,
  private logbookItemDataService: LogbookItemDataService,
  private dialogRef: MatDialogRef<ExportDialogComponent>,
  private datePipe: DatePipe,
) {
    this.config = data;

   }

  close() {
    this.dialogRef.close();
  }

  async exportData(){
    console.log(this.config)
    this.inProgress = true;
    const blob = await this.logbookItemDataService.exportLogbook('pdf', this.config, 0, Infinity);
    if (typeof blob != "undefined"){
      const url = window.URL.createObjectURL(blob);
      const link = this.downloadLink.nativeElement;
      link.href = url;
      link.download = `export - ${this.datePipe.transform(Date.now(), 'yyyy-MM-dd hh:mm:ss z')}`;
      link.click();
      window.URL.revokeObjectURL(url);
    }
    this.close();
  }

}
