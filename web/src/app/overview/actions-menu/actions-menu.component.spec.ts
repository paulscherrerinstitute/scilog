import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActionsMenuComponent } from './actions-menu.component';
import { UserPreferencesService } from 'src/app/core/user-preferences.service';
import { MatMenuModule } from '@angular/material/menu';

class UserPreferencesMock {
  userInfo = {
    roles: ['roles'],
  };
}

describe('ActionsMenuComponent', () => {
  let component: ActionsMenuComponent;
  let fixture: ComponentFixture<ActionsMenuComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatMenuModule, ActionsMenuComponent],
      providers: [{ provide: UserPreferencesService, useClass: UserPreferencesMock }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should enableActions', () => {
    const isAllowedSpy = spyOn(component['isAllowedService'], 'isAnyEditAllowed');
    component['enableActions']();
    expect(isAllowedSpy).toHaveBeenCalledTimes(1);
  });
});
