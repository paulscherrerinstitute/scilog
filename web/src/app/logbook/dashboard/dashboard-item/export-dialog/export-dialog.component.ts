import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogContent } from '@angular/material/dialog';
import { LogbookItemDataService } from '@shared/remote-data.service';
import { DatePipe, NgIf } from '@angular/common';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatButton } from '@angular/material/button';
import { HttpErrorResponse } from '@angular/common/http';
import { LoopBackError } from '@model/loopback-error';

@Component({
  selector: 'app-export-dialog',
  templateUrl: './export-dialog.component.html',
  styleUrls: ['./export-dialog.component.css'],
  providers: [DatePipe],
  imports: [CdkScrollable, MatDialogContent, NgIf, MatProgressBar, MatButton],
})
export class ExportDialogComponent {
  config: any;
  inProgress = false;
  errMessage?: string = undefined;

  @ViewChild('downloadLink') private downloadLink: ElementRef;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private logbookItemDataService: LogbookItemDataService,
    private dialogRef: MatDialogRef<ExportDialogComponent>,
    private datePipe: DatePipe,
  ) {
    this.config = data;
  }

  close() {
    this.dialogRef.close();
  }

  async exportData(option: 'pdf' | 'eln') {
    this.inProgress = true;
    this.errMessage = undefined;
    try {
      const blob =
        option === 'pdf'
          ? await this.logbookItemDataService.exportLogbook(option, this.config, 0, Infinity)
          : await this.logbookItemDataService.exportELN(this.config.filter.targetId);
      const url = window.URL.createObjectURL(blob);
      const link = this.downloadLink.nativeElement;
      link.href = url;
      link.download = `export - ${this.datePipe.transform(
        Date.now(),
        'yyyy-MM-dd hh:mm:ss z',
      )}${option === 'eln' ? '.eln' : ''}`;
      link.click();
      window.URL.revokeObjectURL(url);
      this.close();
    } catch (err) {
      this.errMessage = await this.describeError(err);
    } finally {
      this.inProgress = false;
    }
  }

  private async describeError(err: unknown): Promise<string> {
    if (!(err instanceof HttpErrorResponse)) {
      return `Export failed: ${err}`;
    }
    let detail: string;
    try {
      // try parsing as LoopBack server message
      const blob = await (err.error as Blob).text();
      const body = JSON.parse(blob) as LoopBackError;
      detail = body.error.message;
    } catch {
      // fallback to Angular's HttpErrorResponse.message
      detail = err.message;
    }
    return `Export failed (HTTP ${err.status}): ${detail}`;
  }
}
