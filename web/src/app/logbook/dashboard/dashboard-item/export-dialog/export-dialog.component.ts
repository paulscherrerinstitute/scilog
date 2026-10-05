import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogContent } from '@angular/material/dialog';
import { LogbookItemDataService } from '@shared/remote-data.service';
import { DatePipe } from '@angular/common';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatButton } from '@angular/material/button';
import { HttpErrorResponse } from '@angular/common/http';
import { LoopBackError } from '@model/loopback-error';
import { AppConfigService } from 'src/app/app-config.service';
import { ScicatExportComponent } from './scicat-export/scicat-export.component';

@Component({
  selector: 'app-export-dialog',
  templateUrl: './export-dialog.component.html',
  styleUrls: ['./export-dialog.component.css'],
  providers: [DatePipe],
  imports: [CdkScrollable, MatDialogContent, MatProgressBar, MatButton, ScicatExportComponent],
})
export class ExportDialogComponent {
  config: any;
  inProgress = false;
  errMessage?: string = undefined;
  showScicatExport = false;

  @ViewChild('downloadLink') private downloadLink: ElementRef;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private logbookItemDataService: LogbookItemDataService,
    private dialogRef: MatDialogRef<ExportDialogComponent>,
    private datePipe: DatePipe,
    private appConfigService: AppConfigService,
  ) {
    this.config = data;
  }

  get scicatEnabled(): boolean {
    const scicat = this.appConfigService.getScicatSettings();
    return !!scicat?.rocrateBaseURL;
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
      console.error('Export failed', err);
      this.errMessage = await this.describeError(err);
    } finally {
      this.inProgress = false;
    }
  }

  private async describeError(err: unknown): Promise<string> {
    if (!(err instanceof HttpErrorResponse)) {
      return `Export failed: ${err}`;
    }
    const status = err.status ? ` (${err.status})` : '';
    const genericMessage = 'contact support if the problem persists.';
    let message: string;
    try {
      // the server returns a LoopBack error as a JSON blob body
      const blob = await (err.error as Blob).text();
      const body = JSON.parse(blob) as LoopBackError;
      message = body.error.message || genericMessage;
    } catch {
      // unparseable error body: network / CORS error, etc
      message = genericMessage;
    }
    return `Export failed${status}: ${message}`;
  }
}
