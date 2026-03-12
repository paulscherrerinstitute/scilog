import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ChangeStreamNotification } from './changestreamnotification.model';

@Injectable({
  providedIn: 'root'
})
export class AddContentService {

  private messageSource = new Subject<ChangeStreamNotification>();

  currentMessage$ = this.messageSource.asObservable();

  constructor() { }

  changeMessage(message: ChangeStreamNotification) {
    this.messageSource.next(message);
  }
}



