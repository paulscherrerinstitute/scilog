import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { ChangeStreamNotification } from './changestreamnotification.model';

interface AddContentEvent {
  originId: string;
  message: ChangeStreamNotification;
}

@Injectable({
  providedIn: 'root',
})
export class AddContentService {
  private messageSource = new Subject<AddContentEvent>();

  changeMessage(message: ChangeStreamNotification, originId?: string): void {
    if (!originId) {
      console.warn('Cannot publish editor content without an originating widget ID.');
      return;
    }
    this.messageSource.next({ message, originId });
  }

  handleMessages(
    originId: string,
    handler: (message: ChangeStreamNotification) => void,
  ): Subscription {
    return this.messageSource.subscribe((event) => {
      if (event.originId === originId) {
        handler(event.message);
      }
    });
  }
}
