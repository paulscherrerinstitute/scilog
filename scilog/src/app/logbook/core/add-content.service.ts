import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { ChangeStreamNotification } from './changestreamnotification.model';

interface AddContentEnvelope {
  message: ChangeStreamNotification;
  /** Returns true for the first caller only. */
  claim(): boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AddContentService {
  // Plain Subject on purpose: no replay, so widgets created later (e.g. the next
  // logbook) never receive messages that were emitted before they subscribed.
  private messageSource = new Subject<AddContentEnvelope>();

  constructor() {}

  /** Emits one submit request. Every call is a distinct request, even with identical content. */
  changeMessage(message: ChangeStreamNotification): void {
    if (!message) {
      return;
    }
    let claimed = false;
    this.messageSource.next({
      message,
      claim: () => {
        if (claimed) {
          return false;
        }
        claimed = true;
        return true;
      },
    });
  }

  /**
   * Registers a submit handler. Any number of handlers may be registered (one per
   * logbook widget), but each emitted message is passed to exactly one of them.
   */
  handleMessages(handler: (message: ChangeStreamNotification) => void): Subscription {
    return this.messageSource.subscribe((envelope) => {
      if (envelope.claim()) {
        handler(envelope.message);
      }
    });
  }
}
