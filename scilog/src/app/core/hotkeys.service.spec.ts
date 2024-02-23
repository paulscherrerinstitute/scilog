import { TestBed } from '@angular/core/testing';

import { Hotkeys } from './hotkeys.service';
import { MatLegacyDialogModule as MatDialogModule, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef, MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';

describe('Hotkeys', () => {
  let service: Hotkeys;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        // { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialog, useValue: {} },
      ],
      imports: [
        MatDialogModule,         
      ]
    });
    service = TestBed.inject(Hotkeys);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
