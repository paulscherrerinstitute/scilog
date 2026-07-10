import { TestBed } from '@angular/core/testing';

import { Hotkeys } from './hotkeys.service';
import {
  MatDialogModule,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from '@angular/material/dialog';

describe('Hotkeys', () => {
  let service: Hotkeys;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        // { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialog, useValue: {} },
      ],
      imports: [MatDialogModule],
    });
    service = TestBed.inject(Hotkeys);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
