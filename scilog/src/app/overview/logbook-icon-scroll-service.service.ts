import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { LogbookDataService } from '@shared/remote-data.service';
import { ScrollBaseService } from '@shared/scroll-base.service';
import { Datasource } from 'ngx-ui-scroll';

@Injectable({
  providedIn: 'root'
})
export class LogbookIconScrollService extends ScrollBaseService {

  constructor(private logbookDataService: LogbookDataService) {
    super();
  }

  protected setupDatasource() {
    if (this.datasource != null) {
      this.datasource.adapter.reset(new Datasource({
        get: async (index: number, count: number) => {
          return this.getDataBuffer(index, count, this.config);
        },

        settings: {
          minIndex: 0,
          startIndex: this.startIndex,
          bufferSize: 10,
          padding: 0.1,
        }
      }));
    } else {
      this.datasource = new Datasource({
        get: async (index: number, count: number) => {
          return this.getDataBuffer(index, count, this.config);
        },

        settings: {
          minIndex: 0,
          startIndex: this.startIndex,
          bufferSize: 10,
          padding: 0.1,
        }
      });
    }
  }

  getDataBuffer(index: number, count: number, config: any) {
    return this.logbookDataService.getDataBuffer(index, count, config);
  }
}
