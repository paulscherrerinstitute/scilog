import { Injectable } from '@angular/core';
import { SearchDataService, LogbookDataService } from '@shared/remote-data.service';
import { ScrollBaseService } from '@shared/scroll-base.service';

export class SearchScrollBaseService extends ScrollBaseService {

  protected dataService: SearchDataService | LogbookDataService

  private setSearchString(searchString: string) {
    this.dataService.searchString = searchString;
  }

  reset(searchString?: string) {
    this.setSearchString(searchString);
    super.reset();
  }

}

@Injectable({ providedIn: 'root' })
export class SearchScrollService extends SearchScrollBaseService {

  constructor(
    protected dataService: SearchDataService,
  ) {
    super();
  }


  getDataBuffer(index:number, count:number, config:any){
    return this.dataService.getDataBuffer(index, count, config);
  }

}
