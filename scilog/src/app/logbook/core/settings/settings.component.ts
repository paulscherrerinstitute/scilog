import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatSidenavContainer, MatSidenav, MatSidenavContent } from '@angular/material/sidenav';
import { MatFabButton, MatMiniFabButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css'],
    imports: [MatSidenavContainer, MatSidenav, MatFabButton, MatTooltip, RouterLink, MatIcon, MatSidenavContent, MatMiniFabButton, RouterOutlet]
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
