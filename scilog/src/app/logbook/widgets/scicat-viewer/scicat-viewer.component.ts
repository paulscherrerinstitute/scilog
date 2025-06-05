import { Component, OnInit } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import {
  type Dataset,
  DatasetService,
  type ScicatUser,
  type DatasetSummary,
} from '@shared/dataset.service';

@Component({
    selector: 'scicat-viewer',
    templateUrl: './scicat-viewer.component.html',
    styleUrls: ['./scicat-viewer.component.css'],
    standalone: false
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
