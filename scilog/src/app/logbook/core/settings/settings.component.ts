import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
    selector: 'settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css'],
    standalone: false
})
export class SettingsComponent implements OnInit {
  data: any;
  sidenavOpened = true;
  sidenavOver = 'side';

  constructor(
    private dialogRef: MatDialogRef<SettingsComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    private router: Router) {
    this.data = data;
  }
  ngOnInit(): void {
    this.router.navigate([{outlets: {'settings': [this.data]}}]);
  }

  close() {
    this.dialogRef.close();
  }

  applyChanges($event) {
    this.dialogRef.close(this.data);
  }

}
