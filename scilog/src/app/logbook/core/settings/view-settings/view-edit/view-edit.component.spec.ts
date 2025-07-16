import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewEditComponent } from './view-edit.component';
import { UntypedFormBuilder } from '@angular/forms';
import { UserPreferencesService } from '@shared/user-preferences.service';
import { ViewDataService } from '@shared/remote-data.service';
import { MatAutocomplete } from '@angular/material/autocomplete';


class UserPreferencesMock {
  userInfo = {
    roles: ["roles"]

  }
}

describe('ViewEditComponent', () => {
  let component: ViewEditComponent;
  let fixture: ComponentFixture<ViewEditComponent>;
  let viewDataServiceSpy:any;
  viewDataServiceSpy = jasmine.createSpyObj("ViewDataService", ["getViews", "patchView", "postView"]);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    providers: [
        UntypedFormBuilder,
        { provide: UserPreferencesService, useClass: UserPreferencesMock },
        { provide: ViewDataService, useValue: viewDataServiceSpy }
    ],
    imports: [MatAutocomplete, ViewEditComponent]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewEditComponent);
    component = fixture.componentInstance;
    component["availLocations"] = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
