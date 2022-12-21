import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { WidgetPreferencesComponent } from './widget-preferences.component';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { UserPreferencesService } from '@shared/user-preferences.service';
import { WidgetPreferencesDataService } from '@shared/remote-data.service';
import { of } from 'rxjs';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';


class UserPreferencesMock {
  userInfo = {
    roles: ["roles"]
  }
}


describe('WidgetPreferencesComponent', () => {
  let component: WidgetPreferencesComponent;
  let fixture: ComponentFixture<WidgetPreferencesComponent>;
  let logbookSpy: any;
  let userPreferencesSpy: any;
  let widgetPreferencesSpy: any;


  logbookSpy = jasmine.createSpyObj("LogbookInfoService", ["logbookInfo", "getAvailLogbooks"]);
  logbookSpy.logbookInfo.and.returnValue([]);

  widgetPreferencesSpy = jasmine.createSpyObj("WidgetPreferencesDataService", ["getSnippetsForLogbook", "getPlotSnippets"]);
  widgetPreferencesSpy.getSnippetsForLogbook.and.returnValue(of({}));
  widgetPreferencesSpy.getPlotSnippets.and.returnValue(of({}));

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [WidgetPreferencesComponent, CdkTextareaAutosize,],
      imports: [MatDialogModule, MatAutocompleteModule],
      providers: [
        UntypedFormBuilder,
        { provide: MatDialogRef, useValue: MatDialogRef },
        {
          provide: MAT_DIALOG_DATA, useValue: {
            config: {
              general: {
                type: 'logbook',
                title: 'Logbook view',
              },
              filter: {
                targetId: "12345parentID",
                additionalLogbooks: [],
                tags: []
              },
              view: {
                order: ['defaultOrder ASC'],
                hideMetadata: false,
                showSnippetHeader: false
              }
            }
          }
        },
        { provide: LogbookInfoService, useValue: logbookSpy },
        { provide: UserPreferencesService, useClass: UserPreferencesMock },
        { provide: WidgetPreferencesDataService, useValue: widgetPreferencesSpy },

      ]
    })
      .compileComponents();
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
