import { Component, OnInit } from '@angular/core';
import { MatSelectChange, MatSelect, MatOption } from '@angular/material/select';
import {
  type Dataset,
  ScicatService,
  type ScicatUser,
  type DatasetSummary,
} from '@shared/scicat.service';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatAnchor } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-scicat-viewer',
  templateUrl: './scicat-viewer.component.html',
  styleUrls: ['./scicat-viewer.component.css'],
  imports: [
    NgIf,
    MatFormField,
    MatLabel,
    MatSelect,
    NgFor,
    MatOption,
    MatCardModule,
    MatAnchor,
    MatIcon,
    MatProgressSpinner,
    DatePipe,
  ],
})
export class ScicatViewerComponent implements OnInit {
  constructor(
    private scicatService: ScicatService,
    private logbookInfoService: LogbookInfoService,
  ) {}

  scicatUser: ScicatUser | null = null;
  datasetSummary: DatasetSummary[] = [];
  selectedDataset: Dataset | null = null;
  datasetFetching = false;
  proposalLinkedDatasets: DatasetSummary[] = [];

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

    this.scicatService
      .getDatasets()
      .pipe(
        switchMap((datasets: DatasetSummary[]) => {
          this.datasetSummary = datasets;
          return this.scicatService.getProposalLinkedDatasets(ownerGroup);
        }),
      )
      .subscribe({
        next: (proposalDatasets: DatasetSummary[]) => {
          if (!proposalDatasets?.length) return;
          this.proposalLinkedDatasets = proposalDatasets;
          // add new proposal linked datasets to selection, if not already present
          const datasetsToAdd = proposalDatasets.filter(
            (ds) => !this.datasetSummary.some((d) => d.pid === ds.pid),
          );
          this.datasetSummary = [...datasetsToAdd, ...this.datasetSummary];
          // select the first proposal-linked dataset by default
          this.onDatasetSelect({ value: proposalDatasets[0].pid } as MatSelectChange);
        },
        error: (err) => console.log('Error in getDatasets or getproposalLinkedDatasets', err),
      });
  }

  isProposalLinkedDataset(pid: string): boolean {
    return this.proposalLinkedDatasets.some((dataset) => dataset.pid === pid);
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
    this.scicatService.getDataset(selectedPid).subscribe((data: Dataset) => {
      this.selectedDataset = data;
      this.datasetFetching = false;
    });
  }
}
