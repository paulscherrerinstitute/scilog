import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { MatLegacyDialogModule as MatDialogModule, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

import { WidgetPreferencesComponent } from './widget-preferences.component';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { UserPreferencesService } from '@shared/user-preferences.service';
import { WidgetPreferencesDataService, LogbookDataService } from '@shared/remote-data.service';
import { of } from 'rxjs';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { AppConfigService } from 'src/app/app-config.service';


class UserPreferencesMock {
  userInfo = {
    roles: ["roles"]
  }
}


describe('WidgetPreferencesComponent', () => {
  let component: WidgetPreferencesComponent;
  let fixture: ComponentFixture<WidgetPreferencesComponent>;
  let logbookSpy: any;
  let logbookDataSpy: any;
  let widgetPreferencesSpy: any;
  const returnEmpty = () => ({});


  logbookSpy = jasmine.createSpyObj("LogbookInfoService", ["logbookInfo", "getAvailLogbooks"]);
  logbookSpy.logbookInfo.and.returnValue([]);

  logbookDataSpy = jasmine.createSpyObj("LogbookDataService", ["getLogbookInfo", "getLogbooksInfo"]);
  logbookDataSpy.getLogbooksInfo.and.returnValue([]);

  widgetPreferencesSpy = jasmine.createSpyObj("WidgetPreferencesDataService", ["getSnippetsForLogbook", "getPlotSnippets"]);
  widgetPreferencesSpy.getSnippetsForLogbook.and.returnValue(of({}));
  widgetPreferencesSpy.getPlotSnippets.and.returnValue(of({}));

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [WidgetPreferencesComponent, CdkTextareaAutosize],
      imports: [MatDialogModule, MatAutocompleteModule],
      providers: [
        UntypedFormBuilder,
        { provide: MatDialogRef, useValue: MatDialogRef },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            config: {
              general: {
                type: 'logbook',
                title: 'Logbook view',
              },
              filter: {
                targetId: '12345parentID',
                additionalLogbooks: [],
                tags: [],
              },
              view: {
                order: ['defaultOrder ASC'],
                hideMetadata: false,
                showSnippetHeader: false,
              },
            },
          },
        },
        { provide: LogbookInfoService, useValue: logbookSpy },
        { provide: LogbookDataService, useValue: logbookDataSpy },
        { provide: UserPreferencesService, useClass: UserPreferencesMock },
        {
          provide: WidgetPreferencesDataService,
          useValue: widgetPreferencesSpy,
        },
        {
          provide: AppConfigService,
          useValue: { getConfig: returnEmpty, getScicatSettings: returnEmpty },
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetPreferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
