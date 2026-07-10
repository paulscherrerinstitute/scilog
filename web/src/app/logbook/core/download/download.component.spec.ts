import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DownloadComponent } from './download.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { QueryParams } from '../../widgets/logbook-item/logbook-item.component.spec';
import { LogbookItemDataService } from '@shared/remote-data.service';

class NativeElementMock {
  href: string = '';
  download: string = '';
  click() {}
}

describe('DownloadComponent', () => {
  let component: DownloadComponent;
  let fixture: ComponentFixture<DownloadComponent>;
  const queryParams = new QueryParams();
  queryParams.set('type', '?');
  let logbookItemDataServiceSpy: any;

  const activatedRouteMock = {
    parent: { url: of(queryParams) },
    snapshot: { params: { fileId: '1234' } },
  };

  logbookItemDataServiceSpy = jasmine.createSpyObj('LogbookItemDataService', [
    'getFilesnippet',
    'getImage',
  ]);
  logbookItemDataServiceSpy.getFilesnippet.and.returnValue(of({}));
  logbookItemDataServiceSpy.getImage.and.returnValue(
    of(new Blob(['data:image/png;base64,iVBORw0KGgoAAAANSUhE'], { type: 'image/png' })).toPromise(),
  );

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [DownloadComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: LogbookItemDataService, useValue: logbookItemDataServiceSpy },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    logbookItemDataServiceSpy.getFilesnippet.calls.reset();
    logbookItemDataServiceSpy.getImage.calls.reset();
  });

  it('should create', () => {
    const asyncFunc: () => Promise<void> = async () => {
      await new Promise((resolve) => resolve(undefined));
    };
    component.exportData = asyncFunc;
    component['downloadLink'].nativeElement = new NativeElementMock();
    expect(component).toBeTruthy();
  });

  it('should export data', async () => {
    component['downloadLink'].nativeElement = new NativeElementMock();
    logbookItemDataServiceSpy.getFilesnippet.calls.reset();
    logbookItemDataServiceSpy.getImage.calls.reset();

    await component.exportData();
    expect(component['logbookItemDataService'].getFilesnippet).toHaveBeenCalled();
    expect(component['logbookItemDataService'].getImage).toHaveBeenCalled();
  });
});
