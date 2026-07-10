import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProfileSettingsComponent } from './profile-settings.component';
import { UserPreferencesService } from '@shared/user-preferences.service';
import { UntypedFormBuilder } from '@angular/forms';
import { AppConfigService } from 'src/app/app-config.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '@shared/auth-services/auth.service';

class UserPreferencesMock {
  userInfo = {
    roles: ['roles'],
  };
}

class AuthServiceMock {
  getScilogToken() {
    return 'mock-token-123';
  }
}

class MatSnackBarMock {
  open() {}
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
        { provide: AppConfigService, useValue: { getConfig } },
        { provide: MatSnackBar, useClass: MatSnackBarMock },
        { provide: AuthService, useClass: AuthServiceMock },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('copies token to clipboard', () => {
    const clipboardSpy = spyOn(navigator.clipboard, 'writeText').and.resolveTo(void 0);
    component.copyToClipboard();
    expect(clipboardSpy).toHaveBeenCalledWith('mock-token-123');
  });
});
