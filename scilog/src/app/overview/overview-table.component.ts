import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { CdkDragDrop, CdkDrag, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Logbooks } from '../core/model/logbooks';
import { WidgetItemConfig } from '../core/model/config';
import { LogbookDataService } from '../core/remote-data.service';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'overview-table',
  templateUrl: './overview-table.component.html',
  styleUrls: ['./overview-table.component.scss'],
  standalone: true,
  imports: [MatTableModule, MatSortModule, MatPaginatorModule, DatePipe, CdkDropList, CdkDrag],
})
export class OverviewTableComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  dataSource: MatTableDataSource<Logbooks>;

  displayedColumns = ['name', 'description', 'ownerGroup', 'createdAt', 'thumbnail'];

  constructor(
    private dataService: LogbookDataService, 
    private router: Router,
  ) {}
  
  ngOnInit() {
    this.getDatasets();
  }

  private _prepareConfig() {
    let _config: WidgetItemConfig = {
      filter: {
        targetId: "",
      },
      general: {
        type: "logbook",
        title: "",
        readonly: true
      },
      view: {
        order: ["defaultOrder DESC"],
        hideMetadata: false,
        showSnippetHeader: false
      }
    }
    return _config;
  }

  async getDatasets(index = 0, count = 5) {
    const data = await this.dataService.getDataBuffer(index, count, this._prepareConfig());
    console.log(data);
    this.dataSource = new MatTableDataSource<Logbooks>(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  showDataset(row: string) {
    this.router.navigateByUrl(`/logbooks/${encodeURIComponent(row)}/dashboard`);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }

  getImage(thumbnailId: string | undefined){
    if (!thumbnailId) return;
    return`${this.dataService.imagesLocation}/${thumbnailId}`;
  }

}
