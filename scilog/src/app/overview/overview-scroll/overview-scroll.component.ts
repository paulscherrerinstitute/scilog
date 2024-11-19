import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, Output, QueryList, ViewChild, ViewChildren } from "@angular/core";
import { ResizedEvent } from "src/app/core/directives/resized.directive";
import { WidgetItemConfig } from "src/app/core/model/config";
import { Logbooks } from "src/app/core/model/logbooks";
import { LogbookDataService } from "src/app/core/remote-data.service";
import { LogbookWidgetComponent } from "../logbook-cover/logbook-cover.component";
import { CdkVirtualScrollViewport } from "@angular/cdk/scrolling";
import { Subscription } from "rxjs";

type Sizes = {
  width: number,
  height: number,
}

@Component({
  selector: 'overview-scroll',
  templateUrl: './overview-scroll.component.html',
  styleUrls: ['./overview-scroll.component.css']
})
export class OverviewScrollComponent {

  @Input() config: WidgetItemConfig;

  @Output() logbookEdit = new EventEmitter<Logbooks>();
  @Output() logbookSelection = new EventEmitter<string>();

  @ViewChild(CdkVirtualScrollViewport) viewPort: CdkVirtualScrollViewport;
  @ViewChildren(LogbookWidgetComponent, { read: ElementRef }) logbookWidgetComponent: QueryList<ElementRef>;

  logbooks: Logbooks[][] = [];
  isLoaded: boolean;
  private contentSize: Sizes = {width: 332, height: 432};
  private minPageSize = 20;
  private currentPage = 0;
  private pageSize: number;
  private groupSize: number;
  private updateSizes = true;
  private endOfData = false;
  private renderedRangeSubscription: Subscription;

  constructor(private dataService: LogbookDataService, private changeRef: ChangeDetectorRef) {}

  async ngAfterViewInit() {
    this.setGroupSize(this.elementSize(this.viewPort.elementRef));
    this.logbooks = await this.getAndGroupLogbooks();
    this.renderedRangeSubscription = this.viewPort.renderedRangeStream.subscribe(
      async ({start, end}) => await this.onScroll(end))
  }

  ngAfterViewChecked() {
    if (!this.updateSizes) return;
    this.logbookWidgetComponent.some(logbookWidget => {
      this.contentSize = this.elementSize(logbookWidget);
      this.updateSizes = false;
      this.compareAndRefreshSizes(this.elementSize(this.viewPort.elementRef));
      return true;
    })
  }

  get itemSize() {
    return this.contentSize.height;
  }

  private setPageSize(pageSize: number) {
    const minSize = this.minPageSize;
    if (this.pageSize && this.pageSize % this.groupSize === 0) return
    this.pageSize = pageSize > minSize? pageSize: Math.ceil(minSize /  this.groupSize) * this.groupSize;
  }

  private setGroupSize(containerSize: Sizes) {
    const cols = Math.max(Math.round(containerSize.width / this.contentSize.width) - 1, 1);
    const rows = Math.ceil(containerSize.height / this.contentSize.height);
    this.groupSize = cols;
    this.setPageSize(cols * rows * 2);
  }

  private elementSize(element: ElementRef) {
    const elementSize = element.nativeElement.getBoundingClientRect();
    return {width: elementSize.width, height: elementSize.height}
  }

  private splitIntoGroups(logbooks: Logbooks[]) {
    const groups = [];
    while (logbooks.length) groups.push(logbooks.splice(0, this.groupSize));
    return groups;
  }

  private regroupLogbooks() {
    return this.splitIntoGroups([...this.logbooks.flat()]);
  }

  private async getLogbooks(pageSize = this.pageSize, limit = this.pageSize) {
    return await this.dataService.getDataBuffer(pageSize  * this.currentPage, limit, this.config);
  }

  private async getAndGroupLogbooks() {
    this.isLoaded = false;
    const logbooks = await this.getLogbooks();
    if (
      logbooks.length < this.pageSize ||
      logbooks.length === 0
    ) this.endOfData = true
    this.currentPage++;
    this.isLoaded = true;
    return this.splitIntoGroups(logbooks);
  }

  private async refreshLogbooks(oldGroupSize: number, oldPageSize: number) {
    if (this.groupSize  === oldGroupSize && this.pageSize === oldPageSize) return;
    else if (
      this.pageSize > oldPageSize ||
      oldPageSize % this.groupSize
    ) await this.reshapeOnResize(oldPageSize);
    else this.logbooks = this.regroupLogbooks();
  }
  
  private async reshapeOnResize(oldPageSize: number, logbooks: Logbooks[] = undefined) {
    const pageDiff = this.pageSize - oldPageSize;
    const _logbooks = [...(logbooks ?? this.logbooks.flat())];
    if (!this.endOfData)
      pageDiff > 0 ?
        _logbooks.push(...(await this.getLogbooks(oldPageSize, pageDiff))) :
        _logbooks.splice(pageDiff, -pageDiff);
    this.logbooks = this.splitIntoGroups(_logbooks);
  }

  async reloadLogbooks(resetSort = true, search?: string) {
    if (search !== null && search !== undefined) this.dataService.searchString = search;
    this.viewPort.scrollToOffset(0);
    this.currentPage = 0;
    this.endOfData = false;
    this.logbooks = await this.getAndGroupLogbooks();
  }

  private async compareAndRefreshSizes(containerSizes: Sizes) {
    const oldGroupSize = this.groupSize;
    const oldPageSize = this.pageSize;
    this.setGroupSize(containerSizes);
    await this.refreshLogbooks(oldGroupSize, oldPageSize);
  }

  async onScroll(index: number) {
    if (this.endOfData) return;
    if (index < this.logbooks.length) return;
    const logbooks = await this.getAndGroupLogbooks();
    this.logbooks = this.logbooks.concat(logbooks);
    this.changeRef.detectChanges();
  }

  @HostListener('window:resize')
  async onResized(event: ResizedEvent) {
    if (!event) return
    await this.compareAndRefreshSizes(event.newRect);
  }

  trackByGroupId(index: number, logbooksGroup: Logbooks[]): string {
    return logbooksGroup.reduce((previousValue, currentValue) => previousValue += currentValue.id, '');
  }
  
  editLogbook(logbook: Logbooks) {
    this.logbookEdit.emit(logbook);
  }

  afterLogbookEdit(logbook: Logbooks) {
    this.logbooks.forEach(group => 
      group.forEach((log, i) => {if (log.id === logbook.id) group[i] = logbook})
    );
  }

  async deleteLogbook(logbookId: string) {
    await this.dataService.deleteLogbook(logbookId);
    const logbooks = this.logbooks.flat().filter(logbook => logbook.id !== logbookId);
    await this.reshapeOnResize(
      this.pageSize - 1, logbooks);
  }

  logbookSelected(logbookId: string) {
    this.logbookSelection.emit(logbookId);
  }

  ngOnDestroy() {
    if (this.renderedRangeSubscription) {
      this.renderedRangeSubscription.unsubscribe();
    }
  }

}
