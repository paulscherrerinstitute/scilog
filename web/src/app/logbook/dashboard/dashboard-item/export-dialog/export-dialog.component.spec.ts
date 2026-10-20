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
  logbookItemDataSpy = jasmine.createSpyObj('LogbookItemDataService', ['exportLogbook']);
  const resolveExport = () =>
    of(new Blob(['data:image/png;base64,iVBORw0KGgoAAAANSUhE'], { type: 'image/png' })).toPromise();
  logbookItemDataSpy.exportLogbook.and.callFake(resolveExport);

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
    logbookItemDataSpy.exportLogbook.and.rejectWith(
      new HttpErrorResponse({ error: errorBody, status: 404, statusText: 'Not Found' }),
    );
    await component.exportData('pdf');
    expect(component.errMessage).toContain('404');
    expect(component.errMessage).toContain(message);
    expect(component.inProgress).toBe(false);
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should fall back to the HttpClient error message when the response has no parseable body', async () => {
    const error = new HttpErrorResponse({
      error: new ProgressEvent('error'),
      status: 0,
      statusText: 'Unknown Error',
    });
    logbookItemDataSpy.exportLogbook.and.rejectWith(error);
    await component.exportData('pdf');
    expect(component.errMessage).toContain(error.message);
    expect(component.inProgress).toBe(false);
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });
});
