import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { UntypedFormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AddLogbookComponent } from './add-logbook.component';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { UserPreferencesService } from '@shared/user-preferences.service';
import { LogbookDataService, LogbookItemDataService } from '@shared/remote-data.service';
import { of } from 'rxjs';

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
        {provide: MAT_DIALOG_DATA, useValue: {}},
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
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
