import { Component, OnInit } from '@angular/core';
import { UserPreferencesService } from '@shared/user-preferences.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.css']
})
export class ProfileSettingsComponent implements OnInit {

  formBuilder: FormBuilder;
  profileFormGroup: FormGroup;


  constructor(
    private userPreferences: UserPreferencesService,
    fb: FormBuilder,
  ) { 
    this.formBuilder = fb;

  }

  ngOnInit(): void {
    this.profileFormGroup = this.formBuilder.group({
      name: new FormControl({ value: this.userPreferences.userInfo.firstName, disabled: true }),
      lastname: new FormControl({ value: this.userPreferences.userInfo.lastName, disabled: true }),
      email: new FormControl({ value: this.userPreferences.userInfo.email, disabled: true }),
      username: new FormControl({ value: this.userPreferences.userInfo.email, disabled: true }),

    });
    console.log(this.userPreferences.userInfo)
    
  }

}
