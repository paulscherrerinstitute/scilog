import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ExportDialogComponent } from './export-dialog.component';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LogbookItemDataService } from '@shared/remote-data.service';
import { of } from 'rxjs';
import { AppConfigService } from 'src/app/app-config.service';

const mockDialogRef = {
  close: jasmine.createSpy('close'),
};

class NativeElementMock {
  href: string = '';
  download: string = '';
  click() {}
}

const enabledScicatSettings = {
  scicatWidgetEnabled: true,
  lbBaseURL: '',
  frontendBaseURL: '',
  rocrateBaseURL: 'https://scicat-rocrate.example',
};

describe('ExportDialogComponent', () => {
  let component: ExportDialogComponent;
  let fixture: ComponentFixture<ExportDialogComponent>;
  let logbookItemDataSpy: any;
  logbookItemDataSpy = jasmine.createSpyObj('LogbookItemDataService', [
    'exportLogbook',
    'exportELN',
  ]);
  logbookItemDataSpy.exportLogbook.and.returnValue(
    of(new Blob(['data:image/png;base64,iVBORw0KGgoAAAANSUhE'], { type: 'image/png' })).toPromise(),
  );
  const appConfigServiceSpy = jasmine.createSpyObj('AppConfigService', [
    'getConfig',
    'getScicatSettings',
  ]);
  appConfigServiceSpy.getConfig.and.returnValue({});

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule, NoopAnimationsModule, ExportDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { filter: { targetId: 'test-logbook-id' } } },
        { provide: LogbookItemDataService, useValue: logbookItemDataSpy },
        { provide: AppConfigService, useValue: appConfigServiceSpy },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    appConfigServiceSpy.getScicatSettings.and.returnValue(enabledScicatSettings);
    fixture = TestBed.createComponent(ExportDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    logbookItemDataSpy.exportLogbook.calls.reset();
    mockDialogRef.close.calls.reset();
  });

  it('should create', () => {
    spyOn(component, 'exportData');
    expect(component).toBeTruthy();
    expect(component.exportData).toHaveBeenCalledTimes(0);
  });

  it('should close the dialog', () => {
    component.close();
    expect(mockDialogRef.close).toHaveBeenCalledTimes(1);
  });

  it('should close the dialog after export', async () => {
    component['downloadLink'].nativeElement = new NativeElementMock();
    spyOn(component['downloadLink'].nativeElement, 'click');
    const datePrefix = '2023-02-1';
    spyOn(Date, 'now').and.returnValue(Date.parse(`${datePrefix}5`));
    await component.exportData('pdf');
    expect(mockDialogRef.close).toHaveBeenCalledTimes(1);
    expect(component['downloadLink'].nativeElement.click).toHaveBeenCalledTimes(1);
    expect(component['downloadLink'].nativeElement.download.slice(0, 18)).toEqual(
      `export - ${datePrefix}`,
    );
  });

  it('should enable SciCat export when scicat is configured with a rocrate URL', () => {
    expect(component.scicatEnabled).toBeTrue();
  });

  it('should not enable SciCat export when scicat is not configured', () => {
    appConfigServiceSpy.getScicatSettings.and.returnValue(undefined);
    expect(component.scicatEnabled).toBeFalse();
  });

  it('should not enable SciCat export when the rocrate URL is missing', () => {
    appConfigServiceSpy.getScicatSettings.and.returnValue({
      scicatWidgetEnabled: true,
      lbBaseURL: '',
      frontendBaseURL: '',
      rocrateBaseURL: '',
    });
    expect(component.scicatEnabled).toBeFalse();
  });
});
