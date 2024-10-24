import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatLegacyDialogModule as MatDialogModule, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

import { MatCardType, OverviewComponent } from './overview.component';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { UserPreferencesService } from '@shared/user-preferences.service';
import { CookieService } from 'ngx-cookie-service';
import { LogbookDataService } from '@shared/remote-data.service';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { ResizedEvent } from '@shared/directives/resized.directive';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LogbookIconScrollService } from './logbook-icon-scroll-service.service';

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
  const logbookIconSpy = jasmine.createSpyObj("logbookIconScrollService", ['reload', 'initialize']);
  
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
        {provide: LogbookIconScrollService, useValue: logbookIconSpy},

      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.logbookIconScrollService.groupSize = 3;
    component.overviewTable = tableSpy;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  [
    {},
    undefined,
    {clientWidth: 0, clientHeight: 0},
    {clientWidth: 10, clientHeight: 20},
  ].forEach((t, i) => {
    [['logbook-module', 10], ['logbook-headline', 20]].forEach(st => {
      it(`should test get matCardSide ${i}:${st[0]}`, () => {
        spyOn<any>(component, 'getFirstVisibleElement').and.returnValue(t);
        component.matCardType = st[0] as MatCardType;
        const expected = st[0] === 'logbook-module' ? 352 : 47;
        expect(component.matCardSide).toEqual(i === 3 ? st[1] as number : expected);
      });
    });
  });

  [[1, 1], [800, 2]].forEach(t => {
    it(`should test groupSize ${t[0]}`, () => {
      expect(component.groupSize(t[0])).toEqual(t[1]);
    });
  });

  [
    [{newRect: {width: 1056}}, [0, 0]], 
    [{newRect: {width: 700}, oldRect: {width: 300}}, [1, 0]], 
    [{newRect: {width: 100}, oldRect: {width: 300}}, [1, 0]],
    [{newRect: {width: 200}, oldRect: {width: 300}}, [0, 1]],
    [{newRect: {width: 400}, oldRect: {width: 300}}, [0, 1]],
  ].forEach((t, i) => {
    it(`should test onResized ${i}:logbook-module`, () => {
      logbookIconSpy.initialize.calls.reset();
      logbookIconSpy.reload.calls.reset();
      component.onResized(t[0] as ResizedEvent);
      expect(logbookIconSpy.initialize).toHaveBeenCalledTimes(t[1][0]);
      expect(logbookIconSpy.reload).toHaveBeenCalledTimes(t[1][1]);
    });
  });

  [
    [{newRect: {height: 147}}, [0, 0]],
    [{newRect: {height: 700}, oldRect: {height: 300}}, [1, 0]],
    [{newRect: {height: 100}, oldRect: {height: 300}}, [1, 0]],
    [{newRect: {height: 200}, oldRect: {height: 300}}, [0, 1]],
    [{newRect: {height: 400}, oldRect: {height: 300}}, [0, 1]],
  ].forEach((t, i) => {
    it(`should test onResized ${i}:logbook-headline`, () => {
      logbookIconSpy.initialize.calls.reset();
      logbookIconSpy.reload.calls.reset();
      component.matCardType = 'logbook-headline';
      component.onResized(t[0] as ResizedEvent);
      expect(logbookIconSpy.initialize).toHaveBeenCalledTimes(t[1][0]);
      expect(logbookIconSpy.reload).toHaveBeenCalledTimes(t[1][1]);
    });
  });

  [
    ['logbook-module', 'clientWidth'],
    ['logbook-headline', 'clientHeight']
  ].forEach(t => {
    it(`should test clientSide ${t[0]}`, () => {
      component.matCardType = t[0] as MatCardType;
      expect(component.clientSide).toEqual(t[1]);
    });
  });

  it('should trigger onResized on window resize', () => {
    const onResizedSpy = spyOn(component, 'onResized');
    window.dispatchEvent(new Event('resize'));
    expect(onResizedSpy).toHaveBeenCalled();
  });

  [
    ['logbook-module', logbookIconSpy.reload, 'add'],
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
