import { Component, computed, OnInit, signal } from '@angular/core';
import { MatSelectChange, MatSelect, MatOption } from '@angular/material/select';
import {
  type Dataset,
  ScicatService,
  type ScicatUser,
  type DatasetSummary,
} from '@shared/scicat.service';
import { NgIf, DatePipe } from '@angular/common';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatAnchor, MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { switchMap } from 'rxjs/operators';
import { MatTooltip } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { SnackbarService } from '@shared/snackbar.service';

@Component({
  selector: 'app-scicat-viewer',
  templateUrl: './scicat-viewer.component.html',
  styleUrls: ['./scicat-viewer.component.css'],
  imports: [
    NgIf,
    FormsModule,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatCardModule,
    MatCheckboxModule,
    MatAnchor,
    MatButton,
    MatIcon,
    MatProgressSpinner,
    DatePipe,
    MatTooltip,
  ],
})
export class ScicatViewerComponent implements OnInit {
  constructor(
    private scicatService: ScicatService,
    private logbookInfoService: LogbookInfoService,
    private snackbarService: SnackbarService,
  ) {}

  scicatUser: ScicatUser | null = null;
  datasetSummary = signal<DatasetSummary[]>([]);
  selectedDataset: Dataset | null = null;
  datasetFetching = false;
  private proposalLinkedPids = new Set<string>();
  private userLinkedPids = signal<Set<string>>(new Set());

  ngOnInit(): void {
    this.scicatService.getMyself().subscribe({
      next: (data: ScicatUser) => {
        this.scicatUser = data;
      },
      error: (_err) => {
        this.scicatUser = null;
      },
    });

    const ownerGroup = this.logbookInfoService.logbookInfo.ownerGroup;
    const logbookId = this.logbookInfoService.logbookInfo.id;

    this.scicatService
      .getDatasetsSummary()
      .pipe(
        switchMap((datasets: DatasetSummary[]) => {
          this.datasetSummary.set(datasets);
          return this.scicatService.getProposalLinkedDatasets(ownerGroup);
        }),
        switchMap((proposalDatasets: DatasetSummary[]) => {
          if (proposalDatasets?.length) {
            this.proposalLinkedPids = new Set(proposalDatasets.map((d) => d.pid));
            // add new proposal linked datasets to selection, if not already present
            const existingPids = new Set(this.datasetSummary().map((d) => d.pid));
            const datasetsToAdd = proposalDatasets.filter((ds) => !existingPids.has(ds.pid));
            this.datasetSummary.set([...datasetsToAdd, ...this.datasetSummary()]);
            // select the first proposal-linked dataset by default
            this.onDatasetSelect({ value: proposalDatasets[0].pid } as MatSelectChange);
          }
          return this.scicatService.getUserLinkedDatasetsSummary(logbookId);
        }),
      )
      .subscribe({
        next: (userLinkedDatasets: DatasetSummary[]) => {
          if (!userLinkedDatasets?.length) return;
          this.userLinkedPids.set(new Set(userLinkedDatasets.map((d) => d.pid)));
          // add new user linked datasets to selection, if not already present
          const existingPids = new Set(this.datasetSummary().map((d) => d.pid));
          const datasetsToAdd = userLinkedDatasets.filter((ds) => !existingPids.has(ds.pid));
          this.datasetSummary.set([...datasetsToAdd, ...this.datasetSummary()]);
          // select the first user-linked dataset by default, if no proposal-linked dataset is selected
          if (!this.selectedDataset) {
            this.onDatasetSelect({ value: userLinkedDatasets[0].pid } as MatSelectChange);
          }
        },
        error: (err) => {
          console.error('Error fetching datasets or linked datasets', err);
          this.snackbarService.showSnackbarMessage(
            'Error fetching datasets or linked datasets',
            'warning',
          );
        },
      });
  }

  isProposalLinkedDataset(pid: string): boolean {
    return this.proposalLinkedPids.has(pid);
  }

  isUserLinkedDataset(pid: string): boolean {
    return this.userLinkedPids().has(pid);
  }

  get scicatDatasetUrl(): string {
    return this.scicatService.getDatasetDetailPageUrl(this.selectedDataset?.pid);
  }

  get scicatProposalUrl(): string {
    return this.scicatService.getProposalPageUrl(this.selectedDataset?.proposalId);
  }

  onDatasetSelect(event: MatSelectChange): void {
    const selectedPid = event.value;
    this.datasetFetching = true;
    this.selectedDataset = null;
    this.scicatService.getDataset(selectedPid).subscribe({
      next: (data: Dataset) => {
        this.selectedDataset = data;
        this.datasetFetching = false;
      },
      error: () => {
        this.snackbarService.showSnackbarMessage('Error fetching dataset details', 'warning');
        this.datasetFetching = false;
      },
    });
  }

  linkLogbook(): void {
    if (!this.selectedDataset) return;
    const logbookId = this.logbookInfoService.logbookInfo.id;
    this.scicatService.linkLogbookToDataset(logbookId, this.selectedDataset.pid).subscribe({
      next: () => {
        this.userLinkedPids.update((set) => new Set([...set, this.selectedDataset!.pid]));
        this.snackbarService.showSnackbarMessage(
          'Logbook linked to dataset successfully',
          'resolved',
        );
      },
      error: (err) => {
        console.log('Error linking logbook to dataset', err);
        this.snackbarService.showSnackbarMessage('Error linking logbook to dataset', 'warning');
      },
    });
  }
}
