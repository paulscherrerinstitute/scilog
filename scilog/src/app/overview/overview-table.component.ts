import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Logbooks } from '../core/model/logbooks';
import { WidgetItemConfig } from '../core/model/config';
import { LogbookDataService } from '../core/remote-data.service';
import { Router } from '@angular/router';
import { IsAllowedService } from './is-allowed.service';

@Component({
  selector: 'overview-table',
  templateUrl: './overview-table.component.html',
  styleUrls: ['./overview-table.component.scss'],
  providers: [IsAllowedService],
})
export class OverviewTableComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  dataSource: MatTableDataSource<Logbooks>;
  @Output() logbookEdit = new EventEmitter<Logbooks>();
  @Output() logbookDelete = new EventEmitter<string>();

  displayedColumns = ['name', 'description', 'ownerGroup', 'createdAt', 'thumbnail', 'actions'];

  constructor(
    private dataService: LogbookDataService, 
    private router: Router,
    protected isActionAllowed: IsAllowedService,
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

  editLogbook(logbook: Logbooks) {
    this.logbookEdit.emit(logbook);
  }

  deleteLogbook(logbookId: string) {
    this.logbookDelete.emit(logbookId);
  }

}
