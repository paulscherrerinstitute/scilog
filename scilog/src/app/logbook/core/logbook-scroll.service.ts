import { Injectable, ElementRef } from '@angular/core';
import { Subscription, Subject } from 'rxjs';
import { LogbookItemDataService } from '@shared/remote-data.service';
import { ScrollBaseService } from './scroll-base.service';
import _ from 'lodash';

@Injectable()
export class LogbookScrollService extends ScrollBaseService {

  currentViewSubscription: Subscription = null;
  private itemsStatus = new Map();
  isLoadedSubject: Subject<void> = new Subject();
  subscriptions: Subscription[] = [];
  containerRef: ElementRef = null;
  scrollToEnd = false;
  targetPosition = null;

  constructor(
    private logbookItemDataService: LogbookItemDataService,
  ) {
    super();
  }

  getDataBuffer(index: number, count: number, config: any) {
    return this.logbookItemDataService.getDataBuffer(index, count, config);
  }


  async setupStart() {
    console.log(this.config);
    let _descending = false;
    if ((typeof this.config.view.order != 'undefined') && (this.config.view.order.length > 0)) {
      _descending = this.config.view.order[0].split(" ")[1] == 'DESC' ? true : false;
    }
    if (_descending) {
      this.startIndex = 0;
    } else {
      let count = await this.logbookItemDataService.getCount(this.config);
      console.log(count)
      this.startIndex = count.count - 1;
    }
  }

  setItemStatus(id: string, isLoading: boolean) {
    this.itemsStatus.set(id, isLoading);

    if (!isLoading) {
      this.isLoadedSubject.next();
    }
  }

  itemsLoading() {
    // this.itemsStatus
    let _isLoading = false;
    if (typeof this.itemsStatus != 'undefined') {
      this.itemsStatus.forEach((val, key) => {
        // console.log(val, key);
        if (val) {
          _isLoading = true;
        }
      })
    }
    return _isLoading;

  }
  ngOnDestroy() {
    this.subscriptions.forEach(element => {
      element.unsubscribe();
    });
  }


}
