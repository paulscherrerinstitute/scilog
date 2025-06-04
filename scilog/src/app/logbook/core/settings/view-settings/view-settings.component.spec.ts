import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewSettingsComponent } from './view-settings.component';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { UserPreferencesService } from '@shared/user-preferences.service';
import { LogbookDataService, ViewDataService } from '@shared/remote-data.service';
import { ViewsService } from '@shared/views.service';
import { UntypedFormBuilder } from '@angular/forms';
import { of } from 'rxjs';


class UserPreferencesMock {
  userInfo = {
    roles: ["roles"],
    username: "myname",
  }
}


describe('ViewSettingsComponent', () => {
  let component: ViewSettingsComponent;
  let fixture: ComponentFixture<ViewSettingsComponent>;
  let logbookSpy:any;
  let logbookDataSpy:any;
  let viewDataSpy:any;
  let viewSpy:any;

  viewSpy = jasmine.createSpyObj("ViewsService", ["views"]);
  viewSpy.views.and.returnValue([]);

  logbookSpy = jasmine.createSpyObj("LogbookInfoService", ["logbookInfo"]);
  logbookSpy.logbookInfo.and.returnValue([]);

  logbookDataSpy = jasmine.createSpyObj("LogbookDataService", ["getLocations"]);
  logbookDataSpy.getLocations.and.returnValue([{}]);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [ViewSettingsComponent],
    providers: [
        UntypedFormBuilder,
        { provide: LogbookInfoService, useValue: logbookSpy },
        { provide: UserPreferencesService, useClass: UserPreferencesMock },
        { provide: LogbookDataService, useValue: logbookDataSpy },
        { provide: ViewDataService, useValue: viewDataSpy },
        { provide: ViewsService, useValue: viewSpy },
    ]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    logbookDataSpy.getLocations.and.returnValue(of([{}]).toPromise());
    expect(component).toBeTruthy();
  });

  it('should retrieve logbook data', async ()=>{
    logbookDataSpy.getLocations.and.returnValue(of([{subsnippets: []}]).toPromise());
    spyOn(component, 'setDefaults');
    await component.getData();
    expect(component['logbookDataService'].getLocations).toHaveBeenCalled();
    expect(component.setDefaults).toHaveBeenCalledTimes(1);
  })

  // it('should set defaults', ()=>{
  //   component.setDefaults();
  //   expect(component.viewFormGroup.get('name').value).toEqual(component['userPreferences'].userInfo.username);
  //   expect(component.viewFormGroup.get('ownerGroup').value).toEqual(component['userPreferences'].userInfo.username);
  //   expect(component.viewFormGroup.get('location').value).toEqual(component.currentLocation.id);

  // })
});
