import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatLegacyDialogModule as MatDialogModule, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

import { MatCardType, OverviewComponent } from './overview.component';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { UserPreferencesService } from '@shared/user-preferences.service';
import { CookieService } from 'ngx-cookie-service';
import { LogbookDataService } from '@shared/remote-data.service';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OverviewScrollComponent } from './overview-scroll/overview-scroll.component';

class UserPreferencesMock {
  userInfo = {
    roles: ["roles"]

  }
  currentCollectionsConfig = of({});
}

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;
  let logbookInfoSpy:any;
  let logbookDataSpy:any;
  let cookiesSpy:any;


  logbookInfoSpy = jasmine.createSpyObj("LogbookInfoService", ["logbookInfo", "getAvailLogbooks"]);
  logbookInfoSpy.logbookInfo.and.returnValue([]);

  logbookDataSpy = jasmine.createSpyObj("LogbookDataService", ["deleteLogbook"]);
  logbookDataSpy.deleteLogbook.and.returnValue(of({}));

  cookiesSpy = jasmine.createSpyObj("CookieService", ["lastLogbook"]);
  cookiesSpy.lastLogbook.and.returnValue([]);
  const tableSpy = jasmine.createSpyObj("OverviewTableComponent", ['getLogbooks', 'resetSortAndReload']);
  const scrollSpy = jasmine.createSpyObj("OverviewScrollComponent", ['reloadLogbooks']);
  
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OverviewComponent],
      imports: [MatDialogModule, RouterTestingModule, BrowserAnimationsModule],
      providers: [
        {provide: MAT_DIALOG_DATA, useValue: {}},
        {provide: LogbookInfoService, useValue: logbookInfoSpy},
        {provide: UserPreferencesService, useClass: UserPreferencesMock},
        {provide: CookieService},
        {provide: LogbookDataService, useValue: logbookDataSpy},
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.overviewTable = tableSpy;
    component.overviewSroll = scrollSpy;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  [
    ['logbook-module', scrollSpy.reloadLogbooks, 'add'],
    ['logbook-headline', tableSpy.getLogbooks, 'edit'],
    ['logbook-headline', tableSpy.resetSortAndReload, 'add'],
  ].forEach((t, i) => {
    it(`should test reloadData ${i}`, async() => {
      t[1].calls.reset();
      component.matCardType = t[0] as MatCardType;
      await component['reloadData'](t[2] as 'edit' | 'add');
      expect(t[1]).toHaveBeenCalledTimes(1);
    });
  });

});
