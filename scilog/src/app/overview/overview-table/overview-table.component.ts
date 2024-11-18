import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Logbooks } from '../../core/model/logbooks';
import { WidgetItemConfig } from '../../core/model/config';
import { LogbookDataService } from '../../core/remote-data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'overview-table',
  templateUrl: './overview-table.component.html',
  styleUrls: ['./overview-table.component.scss'],
})
export class OverviewTableComponent implements OnInit {

  @Input() config: WidgetItemConfig;

  @Output() logbookEdit = new EventEmitter<Logbooks>();
  @Output() logbookSelection = new EventEmitter<string>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource: MatTableDataSource<Logbooks>;
  totalItems: number;
  displayedColumns = ['name', 'description', 'ownerGroup', 'createdAt', 'thumbnail', 'actions'];
  private _config: WidgetItemConfig;
  isLoaded: boolean;

  constructor(
    private dataService: LogbookDataService,
    private router: Router,
  ) {}

  ngOnInit() {
    this._config = JSON.parse(JSON.stringify(this.config));
  }

  ngAfterViewInit() {
    this.getLogbooks();
    this.itemsCount();
  }

  onSortChange(): void {
    this.paginator.pageIndex = 0;
    this._config.view.order = [`${this.sort.active || 'defaultOrder'} ${this.sort.direction || 'DESC'}`];
    this.getLogbooks();
  };

  onPageChange(): void {
    this.getLogbooks();
  }

  private async itemsCount() {
    this.totalItems = (await this.dataService.getCount(this._config)).count;
  }

  async getLogbooks() {
    this.isLoaded = false;
    const data = await this.dataService.getDataBuffer(this.paginator.pageIndex * this.paginator.pageSize, this.paginator.pageSize, this._config);
    this.isLoaded = true;
    this.dataSource = new MatTableDataSource<Logbooks>(data);
  }

  async reloadLogbooks(resetSort = true, search?: string) {
    if (search !== null && search !== undefined) this.dataService.searchString = search;
    if (resetSort) {
      this.sort.active = '';
      this.sort.direction = '';
      this.sort.sort({ id: '', start: 'asc', disableClear: false });
      this.paginator.pageIndex = 0;
      this._config = JSON.parse(JSON.stringify(this.config));
    }
    await this.getLogbooks();
  }

  openLogbook(row: string) {
    this.router.navigateByUrl(`/logbooks/${encodeURIComponent(row)}/dashboard`);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }

  getImage(thumbnailId: string | undefined) {
    if (!thumbnailId) return;
    return `${this.dataService.imagesLocation}/${thumbnailId}`;
  }

  editLogbook(logbook: Logbooks) {
    this.logbookEdit.emit(logbook);
  }

  async deleteLogbook(logbookId: string) {
    await this.dataService.deleteLogbook(logbookId);
    await this.reloadLogbooks(false);
  }

  logbookSelected(logbookId: string) {
    this.logbookSelection.emit(logbookId);
  }

}
