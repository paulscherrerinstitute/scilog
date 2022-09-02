import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { Logbooks } from '@model/logbooks';
import { ViewsService } from './views.service';
import { ACLDataService, LogbookDataService } from '@shared/remote-data.service';
import { ACL } from '@model/acl';

@Injectable({
  providedIn: 'root'
})
export class LogbookInfoService {

  subscriptions: Subscription[] = [];
  private logbook: Logbooks = null;
  private logbookACL: ACL = null;
  private _availLogbooks: Logbooks[] = [];
  private oldLogbookId: String = null;
  private logbookInfoSource = new BehaviorSubject(this.logbook);
  public currentLogbookInfo = this.logbookInfoSource.asObservable();

  constructor(private dataService: LogbookDataService,
    private views: ViewsService,
    private aclDataService: ACLDataService) {
    this.logbookInfoSource.pipe(shareReplay());
  }


  async getLogbookInfo(id: string) {
    this.logbookInfo = await this.dataService._getLogbookInfo(id);
    this.logbookACL = await this.aclDataService.getACL(this.logbookInfo.aclId);
    console.log(this.logbookACL);
  }

  async getAvailLogbooks() {
    this.availLogbooks = await this.dataService._getAvailLogbooks();
  }

  public get availLogbooks(): Logbooks[] {
    if (this._availLogbooks.length == 0) {
      this.getAvailLogbooks();
    }
    return this._availLogbooks;
  }
  public set availLogbooks(value: Logbooks[]) {
    this._availLogbooks = value;
    console.log("updating logbook")
  }

  get logbookInfo() {
    return this.logbook;
  }

  set logbookInfo(logbook: Logbooks) {
    console.log("new logbook");
    this.logbook = logbook;
    console.log(this.logbook);

    this.logbookInfoSource.next(this.logbook);

    if ((this.logbook == null) || (this.oldLogbookId != this.logbook.id)) {
      console.log("updating views")
      this.updateViews();
    }
    this.oldLogbookId = this.logbook == null ? null : this.logbook.id;
  }

  updateViews() {
    this.views.getLogbookViews(this.logbook);
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    })
  }
}
