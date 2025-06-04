import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SnippetViewerComponent } from './snippet-viewer.component';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { ChangeStreamService } from '@shared/change-stream.service';
import { SnippetViewerDataService } from '@shared/remote-data.service';
import { ViewsService } from '@shared/views.service';
import { of } from 'rxjs';

class ViewsServiceMock {
  currentWidgetConfigs = of([{config: {filter: {targetId: 1}}}]);

}

describe('SnippetViewerComponent', () => {
  let component: SnippetViewerComponent;
  let fixture: ComponentFixture<SnippetViewerComponent>;
  let logbookInfoSpy:any;
  let snippetViewerDataSpy:any;
  let changestreamSpy:any;

  logbookInfoSpy = jasmine.createSpyObj("LogbookInfoService", ["logbookInfo", "getAvailLogbooks"]);
  logbookInfoSpy.logbookInfo.and.returnValue([]);
  snippetViewerDataSpy = jasmine.createSpyObj("SnippetViewerDataService", ["getSnippetViewerData"]);

  changestreamSpy = jasmine.createSpyObj("ChangeStreamService", ["getNotification"]);
  changestreamSpy.getNotification.and.returnValue(of({}));

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [SnippetViewerComponent],
    providers: [
        { provide: LogbookInfoService, useValue: logbookInfoSpy },
        { provide: ViewsService, useClass: ViewsServiceMock },
        { provide: SnippetViewerDataService, useValue: snippetViewerDataSpy },
        { provide: ChangeStreamService, useValue: changestreamSpy },
    ]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SnippetViewerComponent);
    component = fixture.componentInstance;
    component.configIndex = 0;
    fixture.detectChanges();
  });

  it('should get data from dataService', () => {
    expect(snippetViewerDataSpy.getSnippetViewerData).toHaveBeenCalledWith(component.config.filter.targetId);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
