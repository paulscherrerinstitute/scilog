import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { SearchDataService } from '@shared/remote-data.service';
import { ScrollBaseService } from '@shared/scroll-base.service';

@Injectable()
export class SearchScrollService extends ScrollBaseService {
  
  currentViewSubscription: Subscription = null;

  constructor(
    private searchDataService: SearchDataService,
  ) { 
    super();
  }


  getDataBuffer(index:number, count:number, config:any){
    return this.searchDataService.getDataBuffer(index, count, config);
  }

}
