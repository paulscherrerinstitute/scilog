import { Injectable, Inject } from '@angular/core';
import { EventManager } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { HotkeysComponent } from './hotkeys/hotkeys.component';

export type HotkeyOptions = {
  element: any;
  description: Object | undefined;
  keys: string;
};

@Injectable({
  providedIn: 'root',
})
export class Hotkeys {
  hotkeys = new Map();
  defaults: Partial<HotkeyOptions> = {
    element: this.document,
  };

  constructor(
    private eventManager: EventManager,
    private dialog: MatDialog,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.addShortcut({
      keys: 'control.shift.?',
      description: { label: 'Open hotkey table', group: 'General' },
    }).subscribe(() => {
      this.openHelpModal();
    });
  }

  addShortcut(options: Partial<HotkeyOptions>) {
    const merged = { ...this.defaults, ...options };
    const event = `keyup.${merged.keys}`;
    merged.description && this.hotkeys.set(merged.keys, merged.description);
    console.log(event);
    return new Observable((observer) => {
      const handler = (e) => {
        console.log(e);
        e.preventDefault();
        observer.next(e);
      };

      const dispose = this.eventManager.addEventListener(merged.element, event, handler);

      return () => {
        dispose();
        this.hotkeys.delete(merged.keys);
      };
    });
  }

  openHelpModal() {
    this.dialog.open(HotkeysComponent, {
      width: '500px',
      data: this.hotkeys,
    });
  }
}
