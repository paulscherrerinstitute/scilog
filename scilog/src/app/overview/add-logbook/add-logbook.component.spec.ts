import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { AddLogbookComponent } from './add-logbook.component';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { UserPreferencesService } from '@shared/user-preferences.service';
import { LogbookDataService, LogbookItemDataService } from '@shared/remote-data.service';
import { of } from 'rxjs';
import { MatChipInputEvent } from '@angular/material/chips';

class UserPreferencesMock {
  userInfo = {
    roles: ["roles"]

  }
}



describe('AddLogbookComponent', () => {
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  let component: AddLogbookComponent;
  let fixture: ComponentFixture<AddLogbookComponent>;
  let logbookItemDataServiceSpy:any;
  let logbookDataSpy:any;

  logbookItemDataServiceSpy = jasmine.createSpyObj("LogbookItemDataService", ["getFile"]);
  logbookItemDataServiceSpy.getFile.and.returnValue([]);

  logbookDataSpy = jasmine.createSpyObj("LogbookDataService", ["getLocations", "patchLogbook", "postLogbook", "uploadLogbookThumbnail"]);
  logbookDataSpy.getLocations.and.returnValue(of([{}]));

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AddLogbookComponent],
      imports: [MatDialogModule, MatAutocompleteModule],
      providers: [
        UntypedFormBuilder,
        {provide: MatDialogRef, useValue: mockDialogRef},
        {provide: MAT_DIALOG_DATA, useValue: null},
        {provide: LogbookItemDataService, useValue: logbookItemDataServiceSpy},
        {provide: UserPreferencesService, useClass: UserPreferencesMock},
        {provide: LogbookDataService, useValue: logbookDataSpy}
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddLogbookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.accessGroups.setValue(['startGroup']);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#addAccessGroup', () => {
    const spyUpdate = spyOn(component.optionsFormGroup, 'updateValueAndValidity').and.callThrough();
    component.addAccessGroup({value: 'addAccessGroup '} as MatChipInputEvent);
    expect(component.accessGroups.value).toEqual(['startGroup', 'addAccessGroup']);
    expect(component.accessGroups.valid).toBeTrue();
    component.addAccessGroup({value: 'any-authenticated-user'} as MatChipInputEvent);
    expect(component.accessGroups.value).toEqual(['startGroup', 'addAccessGroup', 'any-authenticated-user']);
    expect(component.accessGroups.valid).toBeFalse();
    expect(component.accessGroups.errors.anyAuthGroup).not.toEqual(null);
    expect(spyUpdate).toHaveBeenCalledTimes(2);
  });

  it('#removeAccessGroup', () => {
    component.addAccessGroup({value: 'any-authenticated-user'} as MatChipInputEvent);
    expect(component.accessGroups.valid).toBeFalse();
    const spyUpdate = spyOn(component.optionsFormGroup, 'updateValueAndValidity').and.callThrough();
    component.removeAccessGroup('any-authenticated-user');
    expect(component.accessGroups.valid).toBeTrue();
    expect(component.accessGroups.value).toEqual(['startGroup']);
    expect(spyUpdate).toHaveBeenCalledTimes(1);
  });

  it('#selectedAccessGroup', () => {
    const spyUpdate = spyOn(component.optionsFormGroup, 'updateValueAndValidity').and.callThrough();
    component.selectedAccessGroup({option: {viewValue: 'selectedAccessGroup'}} as MatAutocompleteSelectedEvent);
    expect(component.accessGroups.value).toEqual(['startGroup', 'selectedAccessGroup']);
    expect(component.accessGroups.valid).toBeTrue();
    component.selectedAccessGroup({option: {viewValue: 'any-authenticated-user'}} as MatAutocompleteSelectedEvent);
    expect(component.accessGroups.value).toEqual(['startGroup', 'selectedAccessGroup', 'any-authenticated-user']);
    expect(component.accessGroups.valid).toBeFalse();
    expect(component.accessGroups.errors.anyAuthGroup).not.toEqual(null);
    expect(spyUpdate).toHaveBeenCalledTimes(2);
  });

});
