import { Injectable } from '@angular/core';
import { MatSnackBar, TextOnlySnackBar, MatSnackBarRef } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  private serverMessageShown = false;
  private serverMessage: MatSnackBarRef<TextOnlySnackBar>;

  constructor(private matSnackbar: MatSnackBar) {}

  async showServerMessage() {
    if (this.serverMessageShown) {
      return;
    }
    this.serverMessageShown = true;
    this.serverMessage = this.showSnackbarMessage('Lost connection to server.', 'warning', null);
    await this.serverMessage.afterDismissed().toPromise();
    this.serverMessageShown = false;
  }

  hideServerMessage() {
    if (!this.serverMessageShown) {
      return;
    }
    this.serverMessage = this.showSnackbarMessage('Successfully connected to server.', 'resolved');
    this.serverMessageShown = false;
  }

  // Set a `null` duration for sticky notifications that stay until Dismissed
  showSnackbarMessage(
    message: string,
    messageClass: 'warning' | 'resolved',
    duration: number | null = 4000,
  ): MatSnackBarRef<TextOnlySnackBar> {
    return this.matSnackbar.open(message, 'Dismiss', {
      duration: duration ?? undefined,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: [`${messageClass}-snackbar`],
    });
  }
}
