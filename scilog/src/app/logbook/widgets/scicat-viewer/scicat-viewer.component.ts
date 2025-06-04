import { Component, OnInit } from '@angular/core';
import { MatSelectChange, MatSelect, MatOption } from '@angular/material/select';
import {
  type Dataset,
  DatasetService,
  type ScicatUser,
  type DatasetSummary,
} from '@shared/dataset.service';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatAnchor } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
    selector: 'scicat-viewer',
    templateUrl: './scicat-viewer.component.html',
    styleUrls: ['./scicat-viewer.component.css'],
    imports: [NgIf, MatFormField, MatLabel, MatSelect, NgFor, MatOption, MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, MatCardActions, MatAnchor, MatIcon, MatProgressSpinner, DatePipe]
})
export class ScicatViewerComponent implements OnInit {
  constructor(private datasetService: DatasetService) {}

  scicatUser: ScicatUser | null = null;
  datasetSummary: DatasetSummary[] = [];
  selectedDataset: Dataset | null = null;
  datasetFetching = false;

  ngOnInit(): void {
    this.datasetService.getMyself().subscribe({
      next: (data: ScicatUser) => {
        this.scicatUser = data;
      },
      error: (_err) => {
        this.scicatUser = null;
      },
    });

    this.datasetService.getDatasets().subscribe((data: DatasetSummary[]) => {
      this.datasetSummary = data;
    });
  }

  get scicatDatasetUrl(): string {
    return this.datasetService.getDatasetDetailPageUrl(
      this.selectedDataset?.pid
    );
  }

  onDatasetSelect(event: MatSelectChange): void {
    const selectedPid = event.value;
    this.datasetFetching = true;
    this.selectedDataset = null;
    this.datasetService.getDataset(selectedPid).subscribe((data: Dataset) => {
      this.selectedDataset = data;
      this.datasetFetching = false;
    });
  }
}
