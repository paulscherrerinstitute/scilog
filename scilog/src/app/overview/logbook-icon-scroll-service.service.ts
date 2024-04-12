import { Injectable } from '@angular/core';
import { LogbookDataService } from '@shared/remote-data.service';
import { SearchScrollBaseService } from '@shared/search-scroll.service';
import { Datasource } from 'ngx-ui-scroll';

@Injectable({
  providedIn: 'root'
})
export class LogbookIconScrollService extends SearchScrollBaseService {

  groupSize = 3;
  constructor(protected dataService: LogbookDataService) {
    super();
  }

  protected setupDatasource() {
    const bufferSize = (this.groupSize + 1) * 3;
    if (this.datasource != null) {
      this.datasource.adapter.reset(new Datasource({
        get: async (index: number, count: number) => {
          return this.getDataBuffer(index, count, this.config);
        },

        settings: {
          minIndex: 0,
          startIndex: this.startIndex,
          bufferSize: bufferSize,
          padding: 0.5,
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
          bufferSize: bufferSize,
          padding: 0.5,
        }
      });
    }
  }

  getDataBuffer(index: number, count: number, config: any) {
    return this.getData(index, count, config);
  }

  async getData(index: number, count: number, config: any) {
    const buffer = await this.dataService.getDataBuffer(index, count, config);
    this.datasource.adapter.relax();
    const groupedBuffer = [];
    while (buffer.length) groupedBuffer.push(buffer.splice(0, this.groupSize));
    return groupedBuffer
  }
}
