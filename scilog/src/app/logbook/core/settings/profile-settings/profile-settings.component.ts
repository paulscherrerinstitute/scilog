import { Component, OnInit } from '@angular/core';
import { UserPreferencesService } from '@shared/user-preferences.service';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '@shared/auth-services/auth.service';
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
})
export class ProfileSettingsComponent implements OnInit {
  formBuilder: UntypedFormBuilder;
  profileFormGroup: UntypedFormGroup;

  constructor(
    private userPreferences: UserPreferencesService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    fb: UntypedFormBuilder
  ) {
    this.formBuilder = fb;
  }

  ngOnInit(): void {
    this.profileFormGroup = this.formBuilder.group({
      name: new UntypedFormControl({
        value: this.userPreferences.userInfo.firstName,
        disabled: true,
      }),
      lastname: new UntypedFormControl({
        value: this.userPreferences.userInfo.lastName,
        disabled: true,
      }),
      email: new UntypedFormControl({
        value: this.userPreferences.userInfo.email,
        disabled: true,
      }),
      username: new UntypedFormControl({
        value: this.userPreferences.userInfo.email,
        disabled: true,
      }),
      token: new UntypedFormControl({
        value: this.authService.getScilogToken(),
        disabled: true,
      }),
    });
  }

  copyToClipboard() {
    const token = this.profileFormGroup.get('token')?.value;
    if (token) {
      navigator.clipboard
        .writeText(token)
        .then(() => {
          this.snackBar.open('Token copied to clipboard', 'Dismiss', {
            duration: 3000,
            verticalPosition: 'top',
          });
        })
        .catch((err) => {
          console.error('Failed to copy token: ', err);
          this.snackBar.open('Failed to copy token to clipboard', 'Dismiss', {
            duration: 3000,
            verticalPosition: 'top',
          });
        });
    }
  }
}
