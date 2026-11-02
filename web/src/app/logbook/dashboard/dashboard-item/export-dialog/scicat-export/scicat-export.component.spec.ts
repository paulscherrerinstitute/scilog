import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';

import { ScicatExportComponent } from './scicat-export.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LogbookItemDataService } from '@shared/remote-data.service';
import { ScicatService } from '@shared/scicat.service';
import { RocrateService } from '@shared/rocrate.service';
import { SnackbarService } from '@shared/snackbar.service';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { of } from 'rxjs';

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

  beforeEach(() => {
    fixture = TestBed.createComponent(ScicatExportComponent);
    component = fixture.componentInstance;
    component.logbookId = 'test-logbook-id';
    fixture.detectChanges();
  });

  afterEach(() => {
    logbookItemDataSpy.exportScicatRoCrate.calls.reset();
    rocrateServiceSpy.importRoCrate.calls.reset();
    scicatServiceSpy.getMyself.calls.reset();
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
    expect(logbookItemDataSpy.exportScicatRoCrate).toHaveBeenCalledWith('test-logbook-id');
    expect(rocrateServiceSpy.importRoCrate).toHaveBeenCalledWith(jasmine.any(Blob), 'psi-demo');
    expect(component.showResult).toBeTrue();
    expect(component.createdPid).toBe('20.500.11935/pid');
    expect(component.datasetUrl).toBe('https://discovery.example/datasets/pid');
    expect(snackBarSpy.showSnackbarMessage).toHaveBeenCalledWith(jasmine.any(String), 'resolved');
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
