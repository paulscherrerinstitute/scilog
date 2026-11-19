import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { ChangeStreamNotification } from './changestreamnotification.model';
import { LogbookItemDataService } from '@shared/remote-data.service';
import { UserPreferencesService } from '@shared/user-preferences.service';
interface AddContentEvent {
  originId: string;
  message: ChangeStreamNotification;
}

@Injectable({
  providedIn: 'root',
})
export class AddContentService {
  private messageSource = new Subject<AddContentEvent>();
  constructor(
    private logbookItemDataService: LogbookItemDataService,
    private userPreferences: UserPreferencesService,
  ) {}
  submitContent(
    message: ChangeStreamNotification,
    reference: ChangeStreamNotification,
  ): Promise<void> {
    if (message.snippetType === 'edit') {
      return this.logbookItemDataService.uploadParagraph({
        ownerGroup: reference.ownerGroup,
        accessGroups: reference.accessGroups,
        snippetType: message.snippetType,
        parentId: message.id,
        toDelete: message.toDelete,
        linkType: message.linkType,
      });
    }

    if (message.id) {
      const payload: ChangeStreamNotification = {
        isPrivate: reference.isPrivate,
        tags: message.tags,
        snippetType: 'paragraph',
        textcontent: message.textcontent,
        id_session: localStorage.getItem('id_session'),
        files: message.files,
      };
      if (message.isMessage) {
        payload.isMessage = true;
      }
      return this.logbookItemDataService.uploadParagraph(payload, message.id);
    }

    const payload: ChangeStreamNotification = {
      ownerGroup: reference.ownerGroup,
      accessGroups: reference.accessGroups,
      isPrivate: reference.isPrivate,
      tags: message.tags,
      snippetType: 'paragraph',
      linkType: message.linkType,
      textcontent: message.textcontent,
      files: message.files,
      subsnippets: message.subsnippets,
    };
    if (message.parentId) {
      payload.parentId = message.parentId;
    }
    if (message.isMessage) {
      payload.isMessage = true;
      payload.ownerGroup = this.userPreferences.userInfo.username;
    }
    return this.logbookItemDataService.uploadParagraph(payload);
  }
  changeMessage(message: ChangeStreamNotification, originId: string): void {
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
