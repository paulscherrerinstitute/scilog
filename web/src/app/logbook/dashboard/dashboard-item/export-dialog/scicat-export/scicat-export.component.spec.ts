import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';

import { ScicatExportComponent } from './scicat-export.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LogbookItemDataService } from '@shared/remote-data.service';
import { ScicatService } from '@shared/scicat.service';
import { RocrateService } from '@shared/rocrate.service';
import { SnackbarService } from '@shared/snackbar.service';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { of, throwError } from 'rxjs';

describe('ScicatExportComponent', () => {
  let component: ScicatExportComponent;
  let fixture: ComponentFixture<ScicatExportComponent>;
  let logbookItemDataSpy: any;
  let scicatServiceSpy: any;
  let rocrateServiceSpy: any;
  let snackBarSpy: any;

  logbookItemDataSpy = jasmine.createSpyObj('LogbookItemDataService', ['exportScicatRoCrate']);
  scicatServiceSpy = jasmine.createSpyObj('ScicatService', [
    'getMyself',
    'getDatasetDetailPageUrl',
    'getUserLinkedDatasetsSummary',
  ]);
  rocrateServiceSpy = jasmine.createSpyObj('RocrateService', ['importRoCrate']);
  snackBarSpy = jasmine.createSpyObj('SnackbarService', ['showSnackbarMessage']);

  const logbookInfoService = { logbookInfo: { ownerGroup: 'psi-demo', id: 'test-logbook-id' } };

  beforeEach(waitForAsync(() => {
    logbookItemDataSpy.exportScicatRoCrate.and.returnValue(
      Promise.resolve(new Blob(['zip'], { type: 'application/zip' })),
    );
    scicatServiceSpy.getMyself.and.returnValue(
      of({ profile: { accessGroups: ['psi-demo', 'p22281'] } }),
    );
    scicatServiceSpy.getDatasetDetailPageUrl.and.returnValue(
      'https://discovery.example/datasets/pid',
    );
    scicatServiceSpy.getUserLinkedDatasetsSummary.and.returnValue(of([]));
    rocrateServiceSpy.importRoCrate.and.returnValue(of('20.500.11935/pid'));

    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, ScicatExportComponent],
      providers: [
        { provide: LogbookItemDataService, useValue: logbookItemDataSpy },
        { provide: ScicatService, useValue: scicatServiceSpy },
        { provide: RocrateService, useValue: rocrateServiceSpy },
        { provide: SnackbarService, useValue: snackBarSpy },
        { provide: LogbookInfoService, useValue: logbookInfoService },
      ],
    }).compileComponents();
  }));

  beforeEach(async () => {
    fixture = TestBed.createComponent(ScicatExportComponent);
    component = fixture.componentInstance;
    component.logbookId = 'test-logbook-id';
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    logbookItemDataSpy.exportScicatRoCrate.calls.reset();
    rocrateServiceSpy.importRoCrate.calls.reset();
    scicatServiceSpy.getMyself.calls.reset();
    scicatServiceSpy.getUserLinkedDatasetsSummary.calls.reset();
    snackBarSpy.showSnackbarMessage.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load access groups and preselect the matching logbook owner group', async () => {
    await component.ngOnInit();
    expect(component.accessGroups).toEqual(['psi-demo', 'p22281']);
    expect(component.ownerGroup).toBe('psi-demo');
  });

  it('should not preselect an owner group the user is not a member of', async () => {
    scicatServiceSpy.getMyself.and.returnValue(of({ profile: { accessGroups: ['other-group'] } }));
    await component.ngOnInit();
    expect(component.accessGroups).toEqual(['other-group']);
    expect(component.ownerGroup).toBeNull();
  });

  it('should show the created dataset on a successful export', async () => {
    component.ownerGroup = 'psi-demo';
    await component.submit();
    expect(logbookItemDataSpy.exportScicatRoCrate).toHaveBeenCalledWith('test-logbook-id', []);
    expect(rocrateServiceSpy.importRoCrate).toHaveBeenCalledWith(jasmine.any(Blob), 'psi-demo');
    expect(component.showResult).toBeTrue();
    expect(component.createdPid).toBe('20.500.11935/pid');
    expect(component.datasetUrl).toBe('https://discovery.example/datasets/pid');
    expect(snackBarSpy.showSnackbarMessage).toHaveBeenCalledWith(jasmine.any(String), 'resolved');
  });

  it('should load the linked datasets when the dialog opens and export them', async () => {
    scicatServiceSpy.getUserLinkedDatasetsSummary.and.returnValue(
      of([
        { pid: 'pid/ds1', datasetName: 'ds1', creationTime: '2026-01-01' },
        { pid: 'pid/ds2', datasetName: 'ds2', creationTime: '2026-01-02' },
      ]),
    );
    await component.ngOnInit();
    expect(scicatServiceSpy.getUserLinkedDatasetsSummary).toHaveBeenCalledWith(
      'test-logbook-id',
      component.maxLinkedDatasets,
    );
    expect(component.linkedDatasetPids).toEqual(['pid/ds1', 'pid/ds2']);
    expect(component.linkedDatasetsLimitReached).toBeFalse();

    component.ownerGroup = 'psi-demo';
    await component.submit();
    expect(logbookItemDataSpy.exportScicatRoCrate).toHaveBeenCalledWith('test-logbook-id', [
      'pid/ds1',
      'pid/ds2',
    ]);
    expect(component.createdPid).toBe('20.500.11935/pid');
  });

  it('should note the limit when maxLinkedDatasets were loaded', async () => {
    const datasets = Array.from({ length: component.maxLinkedDatasets }, (_, i) => ({
      pid: `pid/ds${i}`,
      datasetName: `ds${i}`,
      creationTime: '2026-01-01',
    }));
    scicatServiceSpy.getUserLinkedDatasetsSummary.and.returnValue(of(datasets));
    await component.ngOnInit();
    expect(component.linkedDatasetsLimitReached).toBeTrue();
  });

  it('should block the export when the linked datasets cannot be loaded', async () => {
    scicatServiceSpy.getUserLinkedDatasetsSummary.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500, error: 'SciCat down' })),
    );
    await component.ngOnInit();
    component.ownerGroup = 'psi-demo';
    expect(component.linkedDatasetsError).toBeTrue();
    expect(component.canSubmit).toBeFalse();

    await component.submit();
    expect(logbookItemDataSpy.exportScicatRoCrate).not.toHaveBeenCalled();
    expect(component.showResult).toBeFalse();
  });

  it('should surface the backend error body when the export fails', async () => {
    const error = new HttpErrorResponse({
      status: 422,
      error: {
        isValid: false,
        errors: [{ errorType: 'PropertyError', message: 'Cardinality error' }],
      },
    });
    logbookItemDataSpy.exportScicatRoCrate.and.returnValue(Promise.reject(error));
    component.ownerGroup = 'psi-demo';
    await component.submit();
    expect(component.showResult).toBeTrue();
    expect(component.createdPid).toBeNull();
    expect(component.errorMessage).toContain('422');
    expect(component.errorMessage).toContain('Cardinality error');
    expect(snackBarSpy.showSnackbarMessage).toHaveBeenCalledWith(jasmine.any(String), 'warning');
  });

  it('should emit the closed event when dismissed', () => {
    spyOn(component.closed, 'emit');
    component.close();
    expect(component.closed.emit).toHaveBeenCalledTimes(1);
  });
});
