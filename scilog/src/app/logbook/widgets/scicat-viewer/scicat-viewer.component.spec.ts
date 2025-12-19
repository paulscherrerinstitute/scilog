import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScicatViewerComponent } from './scicat-viewer.component';
import { Dataset, ScicatService } from '@shared/scicat.service';
import { of } from 'rxjs';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { Logbooks } from '@model/logbooks';

describe('ScicatViewerComponent', () => {
  let component: ScicatViewerComponent;
  let fixture: ComponentFixture<ScicatViewerComponent>;
  let scicatServiceSpy: jasmine.SpyObj<ScicatService>;
  let logbookInfoServiceSpy: jasmine.SpyObj<LogbookInfoService>;

  beforeEach(async () => {
    scicatServiceSpy = jasmine.createSpyObj('ScicatService', [
      'getMyself',
      'getDatasets',
      'getProposalLinkedDatasets',
      'getDataset',
      'getDatasetDetailPageUrl',
      'getProposalPageUrl',
    ]);

    scicatServiceSpy.getMyself.and.returnValue(of(null));
    scicatServiceSpy.getDatasets.and.returnValue(of([]));
    scicatServiceSpy.getProposalLinkedDatasets.and.returnValue(of([]));
    scicatServiceSpy.getDataset.and.returnValue(of({} as Dataset));

    logbookInfoServiceSpy = jasmine.createSpyObj('LogbookInfoService', ['logbookInfo']);
    logbookInfoServiceSpy.logbookInfo = { ownerGroup: 'group1' } as Logbooks;

    await TestBed.configureTestingModule({
      imports: [ScicatViewerComponent],
      providers: [
        { provide: ScicatService, useValue: scicatServiceSpy },
        {
          provide: LogbookInfoService,
          useValue: logbookInfoServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ScicatViewerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('populates dataset summary list on init', () => {
    scicatServiceSpy.getDatasets.and.returnValue(
      of([
        { pid: '1', datasetName: 'Dataset 1', creationTime: '2024-01-01' },
        { pid: '2', datasetName: 'Dataset 2', creationTime: '2024-01-02' },
      ]),
    );

    component.ngOnInit();

    expect(scicatServiceSpy.getDatasets).toHaveBeenCalled();
    expect(component.datasetSummary.length).toBe(2);
    expect(component.datasetSummary[0].datasetName).toBe('Dataset 1');
  });

  it('appends new proposal linked datasets on init', () => {
    scicatServiceSpy.getDatasets.and.returnValue(
      of([
        { pid: '1', datasetName: 'Dataset 1', creationTime: '2024-01-01' },
        { pid: '3', datasetName: 'Dataset 3', creationTime: '2022-01-01' },
      ]),
    );
    scicatServiceSpy.getProposalLinkedDatasets.and.returnValue(
      of([
        { pid: '1', datasetName: 'Dataset 1', creationTime: '2024-01-01' },
        { pid: '2', datasetName: 'Dataset 2', creationTime: '2024-01-02' },
      ]),
    );

    component.ngOnInit();

    expect(component.datasetSummary.length).toBe(3);
    expect(component.datasetSummary[0].datasetName).toBe('Dataset 2');
  });

  it('selects the first proposal linked dataset on init', () => {
    scicatServiceSpy.getDatasets.and.returnValue(
      of([{ pid: '3', datasetName: 'Dataset 3', creationTime: '2022-01-01' }]),
    );
    scicatServiceSpy.getDataset.and.returnValue(
      of({ pid: '2', datasetName: 'Dataset 2', creationTime: '2024-01-02' } as Dataset),
    );
    scicatServiceSpy.getProposalLinkedDatasets.and.returnValue(
      of([{ pid: '2', datasetName: 'Dataset 2', creationTime: '2024-01-02' }]),
    );

    component.ngOnInit();

    expect(component.selectedDataset?.pid).toBe('2');
  });
});
