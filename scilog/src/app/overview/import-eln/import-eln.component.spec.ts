import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { LogbookDataService } from '@shared/remote-data.service';
import { SnackbarService } from '@shared/snackbar.service';
import { ImportElnComponent } from './import-eln.component';

function elnFile(name = 'archive.eln', size = 1024): File {
  const file = new File(['x'], name);
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

function selectFile(component: ImportElnComponent, file: File): void {
  component.onFileSelected({ target: { files: [file] } } as unknown as Event);
}

describe('ImportElnComponent', () => {
  const mockDialogRef = { close: jasmine.createSpy('close') };
  let logbookDataSpy: jasmine.SpyObj<LogbookDataService>;
  let snackBarSpy: jasmine.SpyObj<SnackbarService>;
  let routerSpy: jasmine.SpyObj<Router>;

  let component: ImportElnComponent;
  let fixture: ComponentFixture<ImportElnComponent>;

  beforeEach(waitForAsync(() => {
    logbookDataSpy = jasmine.createSpyObj('LogbookDataService', ['getLocations', 'importELN']);
    logbookDataSpy.getLocations.and.returnValue(
      Promise.resolve([{ subsnippets: [{ id: 'loc1', location: 'Beamline 1' }] }]) as any,
    );
    snackBarSpy = jasmine.createSpyObj('SnackbarService', ['showSnackbarMessage']);
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

    TestBed.configureTestingModule({
      imports: [MatDialogModule, NoopAnimationsModule, ImportElnComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: LogbookDataService, useValue: logbookDataSpy },
        { provide: SnackbarService, useValue: snackBarSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportElnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    mockDialogRef.close.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads the selectable locations on init', async () => {
    await fixture.whenStable();
    expect(component.availLocations).toEqual([{ id: 'loc1', location: 'Beamline 1' }] as any);
  });

  it('accepts a valid .eln file', () => {
    selectFile(component, elnFile('good.eln'));
    expect(component.file?.name).toBe('good.eln');
    expect(snackBarSpy.showSnackbarMessage).not.toHaveBeenCalled();
  });

  it('rejects a non-.eln file with a warning', () => {
    selectFile(component, elnFile('notes.txt'));
    expect(component.file).toBeNull();
    expect(snackBarSpy.showSnackbarMessage).toHaveBeenCalledWith(jasmine.any(String), 'warning');
  });

  it('rejects a file larger than the limit', () => {
    selectFile(component, elnFile('huge.eln', 101 * 1024 * 1024));
    expect(component.file).toBeNull();
    expect(snackBarSpy.showSnackbarMessage).toHaveBeenCalledWith(jasmine.any(String), 'warning');
  });

  it('canImport requires a file and a location', () => {
    expect(component.canImport).toBeFalse();
    selectFile(component, elnFile());
    expect(component.canImport).toBeFalse();
    component.locationId = 'loc1';
    expect(component.canImport).toBeTrue();
  });

  it('imports, closes, and navigates to the new logbook on success', async () => {
    logbookDataSpy.importELN.and.returnValue(Promise.resolve({ id: 'lb1' } as any));
    const file = elnFile();
    selectFile(component, file);
    component.locationId = 'loc1';

    await component.importEln();

    expect(logbookDataSpy.importELN).toHaveBeenCalledWith(file, 'loc1');
    expect(snackBarSpy.showSnackbarMessage).toHaveBeenCalledWith('Import successful', 'resolved');
    expect(mockDialogRef.close).toHaveBeenCalledTimes(1);
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/logbooks/lb1/dashboard');
  });

  it('renders 422 validation details and keeps the dialog open', async () => {
    logbookDataSpy.importELN.and.returnValue(
      Promise.reject({
        error: {
          error: { details: [{ code: 'INVALID_PUBLISHER', message: 'Not a SciLog export' }] },
        },
      }),
    );
    selectFile(component, elnFile());
    component.locationId = 'loc1';

    await component.importEln();

    expect(component.errors).toEqual([
      { code: 'INVALID_PUBLISHER', message: 'Not a SciLog export' },
    ]);
    expect(mockDialogRef.close).not.toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();
    expect(component.inProgress).toBeFalse();
  });

  it('shows a generic warning for a non-structured error', async () => {
    logbookDataSpy.importELN.and.returnValue(Promise.reject(new Error('network')));
    selectFile(component, elnFile());
    component.locationId = 'loc1';

    await component.importEln();

    expect(component.errors).toEqual([]);
    expect(mockDialogRef.close).not.toHaveBeenCalled();
    expect(snackBarSpy.showSnackbarMessage).toHaveBeenCalledWith(jasmine.any(String), 'warning');
    expect(component.inProgress).toBeFalse();
  });
});
