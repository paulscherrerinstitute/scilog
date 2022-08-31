import { Injectable, ElementRef } from '@angular/core';
import { IDatasource, Datasource } from 'ngx-ui-scroll';
import { Subscription, Subject, Observable, BehaviorSubject } from 'rxjs';
import { LogbookItemDataService } from '@shared/remote-data.service';
import { WidgetItemConfig } from '@model/config';
import { ScrollBaseService } from './scroll-base.service';
import _ from 'lodash';
import { debounceTime } from 'rxjs/operators';

@Injectable()
export class LogbookScrollService extends ScrollBaseService {

  currentViewSubscription: Subscription = null;
  private itemsStatus = new Map();
  isLoadedSubject: Subject<any> = new Subject();
  subscriptions: Subscription[] = [];
  containerRef: ElementRef = null;
  scrollToEnd = false;
  targetPosition = null;

  constructor(
    private logbookItemDataService: LogbookItemDataService,
  ) {
    super();
    this.subscriptions.push(this.isLoadedSubject.pipe(debounceTime(50)).subscribe(async () => {
      await this.relax();
      await this.datasource.adapter.check();
      let _isLoading = this.itemsLoading();
      console.log("loading status: ")
      console.log(_isLoading)
      if (this.targetPosition == null) {
        this.targetPosition = this.datasource.adapter.firstVisible;
      }
      if (!_isLoading) {
        // await this.datasource.adapter.check();
        let firstVisible = this.datasource.adapter.firstVisible;
        let lastVisible = this.datasource.adapter.lastVisible;
        console.log(firstVisible)
        console.log(lastVisible)

        await this.relax();
        console.log(this.datasource.adapter.firstVisible)
        console.log(this.datasource.adapter.lastVisible)

        // if (this.targetPosition.$index != this.datasource.adapter.firstVisible.$index) {
        //   this.datasource.adapter.fix({
        //     scrollToItem: ({ data }) => {
        //       return data.id === this.targetPosition.data.id;
        //     },
        //     scrollToItemOpt: true
        //   });

        // }
        if (this.targetPosition.$index != this.datasource.adapter.firstVisible.$index) {
          this.containerRef.nativeElement.scrollTop = this.targetPosition.element.offsetTop;
        }
        this.targetPosition = null;

        console.log("setting loaded");
        console.log("scrolling to EOF:", this.scrollToEnd);
        if (this.scrollToEnd) {
          setTimeout(() => {
            console.log("scrolling to EOF");
            this.containerRef.nativeElement.scrollTop = this.containerRef.nativeElement.scrollHeight;
          }, 50);
          if (!this.itemsLoading()) {
            this.scrollToEnd = false;
          }
        }
      }
    }));
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
