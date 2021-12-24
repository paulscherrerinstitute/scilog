import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LogbookItemDataService } from '@shared/remote-data.service';

interface ExportType {
  exportType: string;
  display: string;
}

@Component({
  selector: 'app-export-dialog',
  templateUrl: './export-dialog.component.html',
  styleUrls: ['./export-dialog.component.css']
})
export class ExportDialogComponent implements OnInit {

  config:any;
  exportTypes: ExportType[] = [
    {exportType: "pdf", display: "PDF"},
    {exportType: "zip", display: "LaTeX zip"}
  ]
  selectedExportType = this.exportTypes[0].exportType;
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

  async exportData(exportType: string){
    console.log(this.config)
    this.inProgress = true;
    console.log(exportType);
    const blob = await this.logbookItemDataService.exportLogbook(exportType, this.config, 0, Infinity);
    if (typeof blob != "undefined"){
      const url = window.URL.createObjectURL(blob);
  
      const link = this.downloadLink.nativeElement;
      link.href = url;
      switch (exportType) {
        case "pdf":
          link.download = 'export.pdf';
          break;
        case "zip":
          link.download = 'export.zip';
          break;
        default:
          break;
      }
      link.click();
    
      window.URL.revokeObjectURL(url);
    }
    this.close();
  }

}
