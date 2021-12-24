import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartComponent } from './chart.component';
import { ViewsService } from '@shared/views.service';
import { PlotDataService } from '@shared/remote-data.service';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { ChangeStreamService } from '@shared/change-stream.service';
import { of } from 'rxjs';


class ViewsServiceMock {
  currentWidgetConfigs = of({});

}

class LogbookInfoMock {
  logbookInfo = {
    id: '1234'
  }

}


describe('ChartComponent', () => {
  let component: ChartComponent;
  let fixture: ComponentFixture<ChartComponent>;
  let plotSpy:any;
  // let logbookSpy:any;
  let changestreamSpy:any;

  beforeEach(async(() => {

    plotSpy = jasmine.createSpyObj("PlotDataService", ["getPlotSnippets"]);
    // logbookSpy = jasmine.createSpyObj("LogbookInfoService", ['currentView']);

    changestreamSpy = jasmine.createSpyObj("ChangeStreamService", ["getNotification"]);
    changestreamSpy.getNotification.and.returnValue(of({}));
    
    TestBed.configureTestingModule({
      providers: [
        { provide: ViewsService, useClass: ViewsServiceMock },
        { provide: PlotDataService, useValue: plotSpy },
        { provide: LogbookInfoService, useClass: LogbookInfoMock },
        { provide: ChangeStreamService, useValue: changestreamSpy },

      ],
      declarations: [ ChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
