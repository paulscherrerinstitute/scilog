import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProfileSettingsComponent } from './profile-settings.component';
import { UserPreferencesService } from '@shared/user-preferences.service';
import { UntypedFormBuilder } from '@angular/forms';
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

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [ProfileSettingsComponent],
    providers: [
        UntypedFormBuilder,
        { provide: UserPreferencesService, useClass: UserPreferencesMock },
        { provide: AppConfigService, useValue: { getConfig } }
    ]
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
