import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {ChangeStreamNotification} from './changestreamnotification.model';

@Injectable({
  providedIn: 'root'
})
export class AddContentService {
  msg: ChangeStreamNotification = {};
  private messageSource = new BehaviorSubject(this.msg);
  currentMessage = this.messageSource.asObservable();
  constructor() { }

  changeMessage(message: ChangeStreamNotification) {
    this.messageSource.next(message);
    console.log(this.msg);
    this.messageSource.next(null);    
    console.log(this.msg);
  }

}


