import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { MatCardType, OverviewComponent } from './overview.component';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { UserPreferencesService } from '@shared/user-preferences.service';
import { CookieService } from 'ngx-cookie-service';
import { LogbookDataService } from '@shared/remote-data.service';
import { of } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppConfigService } from '../app-config.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { ToolbarComponent } from '@shared/toolbar/toolbar.component';
import { OverviewScrollComponent } from './overview-scroll/overview-scroll.component';
import { WidgetItemConfig } from '@model/config';
import { provideRouter } from '@angular/router';

class UserPreferencesMock {
  userInfo = {
    roles: ['roles'],
  };
  currentCollectionsConfig = of({});
}

@Component({ selector: 'app-toolbar', template: '' })
class ToolbarStubComponent {}

@Component({ selector: 'app-overview-scroll', template: '' })
class OverviewScrollStubComponent {
  @Input() config: WidgetItemConfig;
}

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;
  let logbookInfoSpy: any;
  let logbookDataSpy: any;
  let cookiesSpy: any;

  logbookInfoSpy = jasmine.createSpyObj('LogbookInfoService', ['logbookInfo', 'getAvailLogbooks']);
  logbookInfoSpy.logbookInfo.and.returnValue([]);

  logbookDataSpy = jasmine.createSpyObj('LogbookDataService', ['deleteLogbook']);
  logbookDataSpy.deleteLogbook.and.returnValue(of({}));

  cookiesSpy = jasmine.createSpyObj('CookieService', ['lastLogbook']);
  cookiesSpy.lastLogbook.and.returnValue([]);
  const tableSpy = jasmine.createSpyObj('OverviewTableComponent', [
    'reloadLogbooks',
    'afterLogbookEdit',
  ]);
  const scrollSpy = jasmine.createSpyObj('OverviewScrollComponent', [
    'reloadLogbooks',
    'afterLogbookEdit',
  ]);

  const returnEmpty = () => ({});

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule, BrowserAnimationsModule, OverviewComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: LogbookInfoService, useValue: logbookInfoSpy },
        { provide: UserPreferencesService, useClass: UserPreferencesMock },
        { provide: CookieService },
        { provide: LogbookDataService, useValue: logbookDataSpy },
        {
          provide: AppConfigService,
          useValue: { getConfig: returnEmpty, getScicatSettings: returnEmpty },
        },
        provideRouter([{ path: '', component: ToolbarStubComponent }]),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    })
      .overrideComponent(OverviewComponent, {
        remove: { imports: [ToolbarComponent, OverviewScrollComponent] },
        add: { imports: [ToolbarStubComponent, OverviewScrollStubComponent] },
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
    ['logbook-module', scrollSpy.reloadLogbooks, 'add', true],
    ['logbook-module', scrollSpy.afterLogbookEdit, 'edit', false],
    ['logbook-headline', tableSpy.reloadLogbooks, 'add', true],
    ['logbook-headline', tableSpy.afterLogbookEdit, 'edit', false],
  ].forEach((t, i) => {
    it(`should test reloadData ${i}`, async () => {
      t[1].calls.reset();
      component.matCardType = t[0];
      await component['reloadData']({ id: '1' }, t[2]);
      expect(t[1]).toHaveBeenCalledTimes(1);
    });
  });

  [
    ['logbook-module', scrollSpy],
    ['logbook-headline', tableSpy],
  ].forEach((t, i) => {
    it(`should test setSearch ${i}`, async () => {
      t[1].reloadLogbooks.calls.reset();
      component.matCardType = t[0] as MatCardType;
      await component.setSearch('abc');
      expect(t[1].reloadLogbooks).toHaveBeenCalledOnceWith(true, 'abc');
    });
  });
});
