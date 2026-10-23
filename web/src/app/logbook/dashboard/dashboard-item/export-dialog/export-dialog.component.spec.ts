import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ExportDialogComponent } from './export-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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

const getConfig = () => ({});

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

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ExportDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: LogbookItemDataService, useValue: logbookItemDataSpy },
        { provide: AppConfigService, useValue: { getConfig } },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
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
});
