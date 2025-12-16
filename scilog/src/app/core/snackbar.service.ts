import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
  TextOnlySnackBar,
  MatSnackBarRef,
} from '@angular/material/snack-bar';

export interface SnackbarConfig {
  message?: string;
  show: boolean;
  type: string;
  action?: string;
  duration?: number | undefined;
  horizontalPosition?: MatSnackBarHorizontalPosition;
  verticalPosition?: MatSnackBarVerticalPosition;
  panelClass?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  snackbarConfig: SnackbarConfig = { message: '', show: false, type: '' };
  private serverMessageShown: boolean = false;
  private serverMessage: MatSnackBarRef<TextOnlySnackBar>;
  private snackbarConfigSource = new BehaviorSubject(this.snackbarConfig);
  public snackBar = this.snackbarConfigSource.asObservable();

  constructor(private matSnackbar: MatSnackBar) {}

  async showServerMessage() {
    let snack: SnackbarConfig = {
      show: true,
      type: 'serverMessage',
      message: 'Lost connection to server.',
      action: 'Dismiss',
      duration: undefined,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['warning-snackbar'],
    };
    console.log(snack);
    if (this.serverMessageShown == false) {
      console.log('showing snackbar');
      this.serverMessageShown = true;
      this.serverMessage = this._showMessage(snack);
      await this.serverMessage.afterDismissed().toPromise();
      this.serverMessageShown = false;
    }
  }

  hideServerMessage() {
    if (this.serverMessageShown == true) {
      let snack: SnackbarConfig = {
        show: true,
        type: 'serverMessage',
        message: 'Successfully connected to server.',
        action: 'Dismiss',
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['resolved-snackbar'],
      };
      // this.serverMessage.dismiss();
      this.serverMessage = this._showMessage(snack);
      this.serverMessageShown = false;
      // console.log('hiding snackbar');
      // this.serverMessage.dismiss();
    }
  }

  _showMessage(snack: SnackbarConfig): MatSnackBarRef<TextOnlySnackBar> {
    return this.matSnackbar.open(snack.message, snack.action, {
      duration: snack.duration,
      horizontalPosition: snack.horizontalPosition,
      verticalPosition: snack.verticalPosition,
      panelClass: snack.panelClass,
    });
  }
}
