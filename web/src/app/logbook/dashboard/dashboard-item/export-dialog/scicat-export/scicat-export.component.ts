import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatAnchor, MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { LogbookItemDataService } from '@shared/remote-data.service';
import { ScicatService } from '@shared/scicat.service';
import { RocrateService } from '@shared/rocrate.service';
import { SnackbarService } from '@shared/snackbar.service';
import { LogbookInfoService } from '@shared/logbook-info.service';

@Component({
  selector: 'app-scicat-export',
  templateUrl: './scicat-export.component.html',
  imports: [
    MatProgressBar,
    MatButton,
    MatAnchor,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatIcon,
  ],
})
export class ScicatExportComponent implements OnInit {
  @Input() logbookId: string;
  @Output() closed = new EventEmitter<void>();

  inProgress = false;
  loadingGroups = false;
  accessGroups: string[] = [];
  ownerGroup: string | null = null;
  createdPid: string | null = null;
  datasetUrl: string | null = null;
  errorMessage: string | null = null;
  showResult = false;

  constructor(
    private logbookItemDataService: LogbookItemDataService,
    private scicatService: ScicatService,
    private rocrateService: RocrateService,
    private snackBar: SnackbarService,
    private logbookInfoService: LogbookInfoService,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadAccessGroups();
  }

  private async loadAccessGroups(): Promise<void> {
    this.loadingGroups = true;
    try {
      const user = await firstValueFrom(this.scicatService.getMyself());
      this.accessGroups = user?.profile?.accessGroups ?? [];
      // SciCat access groups can differ from the SciLog ownerGroup, so only preselect the
      // logbook's ownerGroup when the user actually has it as a SciCat access group.
      const logbookOwnerGroup = this.logbookInfoService.logbookInfo?.ownerGroup;
      this.ownerGroup = this.accessGroups.includes(logbookOwnerGroup) ? logbookOwnerGroup : null;
    } catch (err) {
      this.accessGroups = [];
      this.ownerGroup = null;
      this.snackBar.showSnackbarMessage(
        'Could not load your SciCat access groups. Please make sure you are logged in to SciCat.',
        'warning',
      );
    } finally {
      this.loadingGroups = false;
    }
  }

  async submit(): Promise<void> {
    if (!this.ownerGroup || this.inProgress) return;
    this.inProgress = true;
    this.errorMessage = null;
    try {
      const zip = await this.logbookItemDataService.exportScicatRoCrate(this.logbookId);
      const pid = await firstValueFrom(this.rocrateService.importRoCrate(zip, this.ownerGroup));
      this.createdPid = pid;
      this.datasetUrl = this.scicatService.getDatasetDetailPageUrl(pid);
      this.showResult = true;
      this.snackBar.showSnackbarMessage('Dataset created in SciCat', 'resolved');
    } catch (err) {
      this.createdPid = null;
      this.errorMessage = this.describeError(err);
      this.showResult = true;
      this.snackBar.showSnackbarMessage('Export to SciCat failed', 'warning');
    } finally {
      this.inProgress = false;
    }
  }

  close(): void {
    this.closed.emit();
  }

  private describeError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      // The scicat-rocrate service returns a ValidationReport ({ isValid, errors: [...] }) on
      // 422; other statuses may send a string, JSON, or nothing. Dump whatever is there.
      const body = err.error;
      const detail = typeof body === 'string' ? body : body ? JSON.stringify(body) : err.message;
      return `The export failed (HTTP ${err.status}): ${detail}`;
    }
    return `The export failed: ${err}`;
  }
}
