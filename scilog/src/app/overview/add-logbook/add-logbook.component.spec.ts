import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { AddLogbookComponent } from './add-logbook.component';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { UserPreferencesService } from '@shared/user-preferences.service';
import { LogbookDataService, LogbookItemDataService } from '@shared/remote-data.service';
import { of } from 'rxjs';
import { MatChipInputEvent } from '@angular/material/chips';
import { SnackbarService } from 'src/app/core/snackbar.service';
import { IsAllowedService } from '../is-allowed.service';

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
  let snackBarSpy: SnackbarService;
  let isActionAllowedService: IsAllowedService;

  logbookItemDataServiceSpy = jasmine.createSpyObj("LogbookItemDataService", ["getFile"]);
  logbookItemDataServiceSpy.getFile.and.returnValue([]);

  logbookDataSpy = jasmine.createSpyObj("LogbookDataService", ["getLocations", "patchLogbook", "postLogbook", "uploadLogbookThumbnail"]);
  logbookDataSpy.getLocations.and.returnValue(of([{}]));
  snackBarSpy = jasmine.createSpyObj("SnackbarService", ["_showMessage"]);

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
        {provide: LogbookDataService, useValue: logbookDataSpy},
        {provide: SnackbarService, useValue: snackBarSpy},
        {provide: IsAllowedService, useClass: isActionAllowedService}
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

  it('should test getForm', () => {
    expect(component['getForm']('accessGroups').value).toEqual(['startGroup']);
    expect(component['getForm']('floatLabel').value).toEqual('auto');
    expect(component['getForm']('title').value).toEqual('');
  });

  it('should test setForm', () => {
    component['logbook'] = {ownerGroup: 'testOwner', name: 'a'};
    component['setForm']('ownerGroup');
    component['setForm']('title', 'name');
    expect(component['getForm']('ownerGroup').value).toEqual('testOwner');
    expect(component['getForm']('title').value).toEqual('a');
  });

  [
    true,
    false
  ].forEach((t, i) => {
    it(`should test setOwnerGroupWithEditability ${i}`, () => {
      component['logbook'] = {ownerGroup: 'ownerGroup'};
      spyOn(component['isActionAllowed'], 'canChangeOwnerGroup').and.returnValue(t)
      component['setOwnerGroupWithEditability']();
      expect(component['getForm']('ownerGroup').disabled).toEqual(!t);
    });
  });

  [
    true,
    false
  ].forEach((t, i) => {
    it(`should test setWithEditability ${i}`, () => {
      component['logbook'] = {name: 'a', location: 'b'};
      component['isActionAllowed'].tooltips.expired = t? 'Expired': '';
      component['setWithEditability']('title');
      component['setWithEditability']('location');
      expect(component['getForm']('title').disabled).toEqual(t);
      expect(component['getForm']('location').disabled).toEqual(t);
    });
  });

  it('should test showSnackbarMessage', () => {
    component['showSnackbarMessage']('aMessage', 'warning');
    expect(snackBarSpy._showMessage).toHaveBeenCalledOnceWith({
      message: 'aMessage',
      panelClass: ['warning-snackbar'], 
      action: 'Dismiss',
      show: true,
      duration: 4000,
      type: 'serverMessage',
      horizontalPosition: 'center',
      verticalPosition: 'top',
    })
  });

  it('should test setDefaults on creation', () => {
    component['userPreferences'].userInfo.roles.push('any-authenticated-user');
    const accessGroupsValidatorsSpy = spyOn(component.accessGroups, 'addValidators');
    const ownerGroupValidatorsSpy = spyOn(component['getForm']('ownerGroup'), 'addValidators');
    component['setDefaults']();
    expect(component.accessGroupsAvail).toEqual(['roles']);
    expect(accessGroupsValidatorsSpy).toHaveBeenCalledTimes(1);
    expect(ownerGroupValidatorsSpy).toHaveBeenCalledTimes(2);
  });

  [
    {input: {isAdmin: true}, output: 0},
    {input: {isAdmin: false}, output: 1},
    {input: {expired: 'expired'}, output: true},
    {input: {expired: undefined}, output: false},
  ].forEach((t, i) => {
    it(`should test setDefaults on update ${i}`, () => {
      component.logbook = {
        ownerGroup: 'ownerGroup', 
        accessGroups: ['accessGroups'],
        name: 'name',
        location: 'location',
        description: 'description',
        isPrivate: true,
      }
      const ownerGroupValidatorsSpy = spyOn(component['getForm']('ownerGroup'), 'addValidators');
      spyOn(component['isActionAllowed'], 'isAdmin').and.returnValue(t.input.isAdmin);
      spyOn(component['isActionAllowed'], 'isNotExpired');
      spyOn(component['isActionAllowed'], 'canChangeOwnerGroup');
      component['isActionAllowed'].tooltips.expired = t.input.expired;
      component['setDefaults']();
      expect(component['getForm']('ownerGroup').value).toEqual('ownerGroup');
      expect(component['getForm']('title').value).toEqual('name');
      expect(component['getForm']('description').value).toEqual('description');
      expect(component['getForm']('location').value).toEqual('location');
      expect(component['getForm']('isPrivate').value).toEqual(true);
      expect(component.accessGroups.value).toEqual(['accessGroups']);
      if ('isAdmin' in t.input)
        expect(ownerGroupValidatorsSpy).toHaveBeenCalledTimes(t.output as number);
      if ('expired' in t.input) {
        expect(component['getForm']('description').disabled).toEqual(t.output as boolean);
        expect(component['getForm']('title').disabled).toEqual(t.output as boolean);
        expect(component['getForm']('location').disabled).toEqual(t.output as boolean);
        expect(component['getForm']('isPrivate').disabled).toEqual(t.output as boolean);
      }
    });
  });
  
});
