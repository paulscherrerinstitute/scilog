import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileSettingsComponent } from './profile-settings.component';
import { UserPreferencesService } from '@shared/user-preferences.service';
import { FormBuilder } from '@angular/forms';
import { AppConfigService } from 'src/app/app-config.service';


class UserPreferencesMock {
  userInfo = {
    roles: ["roles"]

  }
}

const getConfig = () => ({});

describe('ProfileSettingsComponent', () => {
  let component: ProfileSettingsComponent;
  let fixture: ComponentFixture<ProfileSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers:[
        FormBuilder,
        {provide: UserPreferencesService, useClass: UserPreferencesMock},
        {provide: AppConfigService, useValue: { getConfig }}
      ],
      declarations: [ ProfileSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
