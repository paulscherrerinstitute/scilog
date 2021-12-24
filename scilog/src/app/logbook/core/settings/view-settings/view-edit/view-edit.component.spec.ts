import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEditComponent } from './view-edit.component';
import { FormBuilder } from '@angular/forms';
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

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        FormBuilder,
        {provide: UserPreferencesService, useClass: UserPreferencesMock},
        {provide: ViewDataService, useValue: viewDataServiceSpy}
      ],
      declarations: [ ViewEditComponent, MatAutocomplete ]
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
