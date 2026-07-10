import { Component, OnInit, inject } from '@angular/core';
import {
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { Basesnippets } from '@model/basesnippets';
import { LogbookDataService } from '@shared/remote-data.service';
import { SnackbarService } from '@shared/snackbar.service';

interface ElnError {
  code: string;
  message: string;
}

// Keep in sync with the backend limit (eln-import.config.ts: MAX_FILE_SIZE_MB).
const MAX_FILE_SIZE_MB = 100;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

@Component({
  selector: 'app-import-eln',
  templateUrl: './import-eln.component.html',
  styleUrls: ['./import-eln.component.css'],
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatProgressBar,
    MatIcon,
    MatTooltip,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatButton,
  ],
})
export class ImportElnComponent implements OnInit {
  private logbookDataService = inject(LogbookDataService);
  private snackBar = inject(SnackbarService);
  private dialogRef = inject<MatDialogRef<ImportElnComponent>>(MatDialogRef);
  private router = inject(Router);

  availLocations: Basesnippets[] = [];
  locationId: string | null = null;
  file: File | null = null;
  inProgress = false;
  isDragging = false;
  errors: ElnError[] = [];

  readonly maxFileSizeMb = MAX_FILE_SIZE_MB;

  async ngOnInit(): Promise<void> {
    const locations = await this.logbookDataService.getLocations();
    this.availLocations = locations?.[0]?.subsnippets ?? [];
  }

  get canImport(): boolean {
    return !!this.file && !!this.locationId && !this.inProgress;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.setFile(input.files?.[0] ?? null);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    this.setFile(event.dataTransfer?.files?.[0] ?? null);
  }

  private setFile(file: File | null): void {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.eln')) {
      this.snackBar.showSnackbarMessage('Please choose a .eln file.', 'warning');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      this.snackBar.showSnackbarMessage(
        `File is too large (max ${MAX_FILE_SIZE_MB} MB).`,
        'warning',
      );
      return;
    }
    this.file = file;
    this.errors = [];
  }

  async importEln(): Promise<void> {
    const { file, locationId } = this;
    if (!file || !locationId || this.inProgress) return;
    this.inProgress = true;
    this.errors = [];
    try {
      const logbook = await this.logbookDataService.importELN(file, locationId);
      this.snackBar.showSnackbarMessage('Import successful', 'resolved');
      this.dialogRef.close();
      this.router.navigateByUrl(`/logbooks/${logbook.id}/dashboard`);
    } catch (err) {
      const details = (err as { error?: { error?: { details?: ElnError[] } } })?.error?.error
        ?.details;
      if (details?.length) {
        this.errors = details;
        this.snackBar.showSnackbarMessage('The .eln archive could not be imported.', 'warning');
      } else {
        this.snackBar.showSnackbarMessage(
          'Error while importing the logbook. If the error persists contact an administrator',
          'warning',
        );
      }
    } finally {
      this.inProgress = false;
    }
  }
}
