import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ExportDialogComponent } from './export-dialog.component';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LogbookItemDataService } from '@shared/remote-data.service';
import { HttpErrorResponse } from '@angular/common/http';
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
  lbBaseURL: 'https://scicat.example',
  frontendBaseURL: 'https://discovery.example',
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
  const resolveExport = () =>
    of(new Blob(['data:image/png;base64,iVBORw0KGgoAAAANSUhE'], { type: 'image/png' })).toPromise();
  logbookItemDataSpy.exportLogbook.and.callFake(resolveExport);
  logbookItemDataSpy.exportELN.and.callFake(resolveExport);
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
    logbookItemDataSpy.exportLogbook.and.callFake(resolveExport);
    logbookItemDataSpy.exportLogbook.calls.reset();
    logbookItemDataSpy.exportELN.and.callFake(resolveExport);
    logbookItemDataSpy.exportELN.calls.reset();
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

  it('should export to PDF and close the dialog', async () => {
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

  it('should export to ELN and close the dialog', async () => {
    component['downloadLink'].nativeElement = new NativeElementMock();
    spyOn(component['downloadLink'].nativeElement, 'click');
    component.config = { filter: { targetId: 'logbook-123' } };
    await component.exportData('eln');
    expect(logbookItemDataSpy.exportELN).toHaveBeenCalledOnceWith('logbook-123');
    expect(logbookItemDataSpy.exportLogbook).not.toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalledTimes(1);
    expect(component['downloadLink'].nativeElement.click).toHaveBeenCalledTimes(1);
    expect(component['downloadLink'].nativeElement.download.endsWith('.eln')).toBe(true);
  });

  it('should show the parsed server message when the export fails with a LoopBack error', async () => {
    const message = 'Entity not found: Filesnippet with id "69245ac1a46515a17eb31fe6"';
    const errorBody = new Blob(
      [
        JSON.stringify({
          error: { statusCode: 404, name: 'Error', message, code: 'ENTITY_NOT_FOUND' },
        }),
      ],
      { type: 'application/json' },
    );
    logbookItemDataSpy.exportELN.and.rejectWith(
      new HttpErrorResponse({ error: errorBody, status: 404, statusText: 'ignored' }),
    );
    component.config = { filter: { targetId: 'logbook-123' } };
    await component.exportData('eln');
    expect(component.errMessage).toBe(`Export failed (404): ${message}`);
    expect(component.inProgress).toBe(false);
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should omit the status code in the generic message for a network error (status 0)', async () => {
    const error = new HttpErrorResponse({
      error: new ProgressEvent('error'),
      status: 0,
      statusText: 'ignored',
    });
    logbookItemDataSpy.exportELN.and.rejectWith(error);
    component.config = { filter: { targetId: 'logbook-123' } };
    await component.exportData('eln');
    expect(component.errMessage).toBe('Export failed: contact support if the problem persists.');
    expect(component.inProgress).toBe(false);
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should include the status code in the generic message when the body is not parseable', async () => {
    logbookItemDataSpy.exportELN.and.rejectWith(
      new HttpErrorResponse({
        error: new Blob([], { type: 'text/html' }),
        status: 504,
        statusText: 'ignored',
      }),
    );
    component.config = { filter: { targetId: 'logbook-123' } };
    await component.exportData('eln');
    expect(component.errMessage).toBe(
      'Export failed (504): contact support if the problem persists.',
    );
    expect(component.inProgress).toBe(false);
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should enable SciCat export when scicat is fully configured', () => {
    expect(component.scicatEnabled).toBeTrue();
  });

  it('should not enable SciCat export when scicat is not configured', () => {
    appConfigServiceSpy.getScicatSettings.and.returnValue(undefined);
    expect(component.scicatEnabled).toBeFalse();
  });

  it('should not enable SciCat export when the rocrate URL is missing', () => {
    appConfigServiceSpy.getScicatSettings.and.returnValue({
      ...enabledScicatSettings,
      rocrateBaseURL: '',
    });
    expect(component.scicatEnabled).toBeFalse();
  });

  it('should not enable SciCat export when the scicat lbBaseURL is missing', () => {
    appConfigServiceSpy.getScicatSettings.and.returnValue({
      ...enabledScicatSettings,
      lbBaseURL: '',
    });
    expect(component.scicatEnabled).toBeFalse();
  });

  it('should not enable SciCat export when the frontendBaseURL is missing', () => {
    appConfigServiceSpy.getScicatSettings.and.returnValue({
      ...enabledScicatSettings,
      frontendBaseURL: '',
    });
    expect(component.scicatEnabled).toBeFalse();
  });

  it('should render the error message in the template when an export fails', () => {
    component.errMessage = 'Export failed (404): something went wrong';
    fixture.detectChanges();
    const errorMessage: HTMLElement = fixture.nativeElement.querySelector('.error-message');
    expect(errorMessage).not.toBeNull();
    expect(errorMessage.textContent!.trim()).toBe('Export failed (404): something went wrong');
  });

  it('should disable the export buttons while an export is in progress', () => {
    component.inProgress = true;
    fixture.detectChanges();
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    );
    const exportButtons = buttons.filter((b) =>
      ['Export to PDF', 'Export to ELN', 'Export to SciCat'].includes(b.textContent!.trim()),
    );
    expect(exportButtons.length).toBe(3);
    exportButtons.forEach((b) => expect(b.disabled).toBeTrue());
  });
});
