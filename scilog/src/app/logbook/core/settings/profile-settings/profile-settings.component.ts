import { Component, OnInit } from '@angular/core';
import { UserPreferencesService } from '@shared/user-preferences.service';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormControl } from '@angular/forms';

@Component({
    selector: 'app-profile-settings',
    templateUrl: './profile-settings.component.html',
    styleUrls: ['./profile-settings.component.css'],
    standalone: false
})
export class ProfileSettingsComponent implements OnInit {

  formBuilder: UntypedFormBuilder;
  profileFormGroup: UntypedFormGroup;


  constructor(
    private userPreferences: UserPreferencesService,
    fb: UntypedFormBuilder,
  ) { 
    this.formBuilder = fb;

  }

  ngOnInit(): void {
    this.profileFormGroup = this.formBuilder.group({
      name: new UntypedFormControl({ value: this.userPreferences.userInfo.firstName, disabled: true }),
      lastname: new UntypedFormControl({ value: this.userPreferences.userInfo.lastName, disabled: true }),
      email: new UntypedFormControl({ value: this.userPreferences.userInfo.email, disabled: true }),
      username: new UntypedFormControl({ value: this.userPreferences.userInfo.email, disabled: true }),

    });
    console.log(this.userPreferences.userInfo)
    
  }

}
