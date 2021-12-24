import { TestBed } from '@angular/core/testing';

import { TasksService } from './tasks.service';
import { TaskDataService } from '@shared/remote-data.service';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { of } from 'rxjs';

class LogbookInfoServiceMock {
  getLogbookInfo(id:string){
    return;
  }

  currentLogbookInfo = of({});
}

describe('TasksService', () => {
  let service: TasksService;
  let taskDataServiceSpy:any;

  taskDataServiceSpy = jasmine.createSpyObj("TaskDataService", ["getTasksData", "addTask", "patchTask"]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: TaskDataService, useValue: taskDataServiceSpy},
        { provide: LogbookInfoService, useClass: LogbookInfoServiceMock },
      ],
    });
    service = TestBed.inject(TasksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
