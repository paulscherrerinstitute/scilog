import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScrollToElementService {

  private _selectedItem = null;
  private selectedItemSource = new BehaviorSubject(this._selectedItem);
  public $selectedItem = this.selectedItemSource.asObservable();
  constructor() { }


  set selectedItem(val: any) {
    this._selectedItem = val;
    this.selectedItemSource.next(this._selectedItem);
  }

  get selectedItem() {
    return this._selectedItem;
  }
}
