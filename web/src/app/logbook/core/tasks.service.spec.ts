import { TestBed } from '@angular/core/testing';

import { TasksService } from './tasks.service';
import { TaskDataService } from '@shared/remote-data.service';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { of } from 'rxjs';

class LogbookInfoServiceMock {
  getLogbookInfo(id: string) {
    return;
  }

  currentLogbookInfo = of({});
}

describe('TasksService', () => {
  let service: TasksService;
  let taskDataServiceSpy: any;

  taskDataServiceSpy = jasmine.createSpyObj('TaskDataService', [
    'getTasksData',
    'addTask',
    'patchTask',
    'deleteTask',
  ]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: TaskDataService, useValue: taskDataServiceSpy },
        { provide: LogbookInfoService, useClass: LogbookInfoServiceMock },
      ],
    });
    service = TestBed.inject(TasksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should delete descendants before their parent', async () => {
    taskDataServiceSpy.getTasksData.and.callFake((id: string) => {
      if (id === 'parent') {
        return Promise.resolve([{ id: 'child' }]);
      }
      if (id === 'child') {
        return Promise.resolve([{ id: 'grandchild' }]);
      }
      return Promise.resolve([]);
    });
    taskDataServiceSpy.deleteTask.and.returnValue(Promise.resolve());
    taskDataServiceSpy.deleteTask.calls.reset();

    await service.deleteTask('parent');

    expect(taskDataServiceSpy.deleteTask.calls.allArgs()).toEqual([
      ['grandchild'],
      ['child'],
      ['parent'],
    ]);
  });
});
