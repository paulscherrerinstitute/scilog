import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LogbookItemDataService } from '@shared/remote-data.service';

@Component({
  selector: 'app-export-dialog',
  templateUrl: './export-dialog.component.html',
  styleUrls: ['./export-dialog.component.css']
})
export class ExportDialogComponent implements OnInit {

  config:any;
  inProgress = false;

  @ViewChild('downloadLink') private downloadLink: ElementRef;

  constructor(@Inject(MAT_DIALOG_DATA) public data,
  private logbookItemDataService: LogbookItemDataService,
  private dialogRef: MatDialogRef<ExportDialogComponent>,) {
    this.config = data;

   }

  ngOnInit() { 

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
      link.download = 'export.pdf';
      link.click();
    
      window.URL.revokeObjectURL(url);
    }
    this.close();
  }

}
