import { TestBed } from '@angular/core/testing';

import { SnackbarService } from './snackbar.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('SnackbarService', () => {
  let service: SnackbarService;
  let matSnackbar: MatSnackBar;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatSnackBarModule, BrowserAnimationsModule],
    });
    service = TestBed.inject(SnackbarService);
    matSnackbar = TestBed.inject(MatSnackBar);
    spyOn(matSnackbar, 'open').and.stub();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('showSnackbarMessage', () => {
    it('opens a snackbar with the 4s default duration when none is given', () => {
      service.showSnackbarMessage('Edit successful', 'resolved');

      expect(matSnackbar.open).toHaveBeenCalledWith('Edit successful', 'Dismiss', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['resolved-snackbar'],
      });
    });

    it('opens a sticky snackbar (no auto-dismiss) when duration is null', () => {
      service.showSnackbarMessage('Lost connection to server.', 'warning', null);

      expect(matSnackbar.open).toHaveBeenCalledWith('Lost connection to server.', 'Dismiss', {
        duration: undefined,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['warning-snackbar'],
      });
    });

    it('derives the panel class from the message class', () => {
      service.showSnackbarMessage('Invalid keys', 'warning');

      expect(matSnackbar.open).toHaveBeenCalledWith(
        'Invalid keys',
        'Dismiss',
        jasmine.objectContaining({ panelClass: ['warning-snackbar'] }),
      );
    });
  });
});
