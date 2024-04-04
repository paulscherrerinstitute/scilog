import { Component, OnInit, Inject } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
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
