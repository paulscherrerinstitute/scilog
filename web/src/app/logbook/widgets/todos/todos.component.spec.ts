import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TodosComponent } from './todos.component';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { TasksService } from '@shared/tasks.service';
import { of } from 'rxjs';
import { ChangeStreamService } from '@shared/change-stream.service';
import { AppConfigService } from 'src/app/app-config.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ViewsService } from '@shared/views.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AddContentService } from '@shared/add-content.service';
import { Tasks } from '@model/tasks';

class ChangeStreamServiceMock {
  getNotification(id: string) {
    return of({});
  }
}

class TasksServiceMock {
  numTasks = 0;
  currentTasks = of([{}]);
  taskChange(data: any) {}
  addTask() {}
  getTasksByParent(parentId: string) {
    return Promise.resolve([]);
  }
}

class ViewsServiceMock {
  currentWidgetConfigs = of([{ config: { filter: {} } }]);
}

class AddContentServiceMock {
  changeMessage(message: any) {}
}

class LogbookInfoMock {
  logbookInfo = {
    id: '1234',
    ownerGroup: 'some',
    accessGroups: ['someAccess'],
    isPrivate: false,
    snippetType: 'task',
    content: '2',
    isDone: false,
  };
  currentLogbookInfo = of({});
}

const getConfig = () => ({});

describe('TodosComponent', () => {
  let component: TodosComponent;
  let fixture: ComponentFixture<TodosComponent>;
  let isActionAllowedServiceSpy;

  beforeEach(waitForAsync(() => {
    isActionAllowedServiceSpy = jasmine.createSpyObj('IsAllowedService', [
      'canUpdate',
      'canDelete',
    ]);
    isActionAllowedServiceSpy.tooltips = { update: '', delete: '' };
    TestBed.configureTestingModule({
      imports: [TodosComponent],
      providers: [
        { provide: LogbookInfoService, useClass: LogbookInfoMock },
        { provide: TasksService, useClass: TasksServiceMock },
        { provide: ChangeStreamService, useClass: ChangeStreamServiceMock },
        { provide: AddContentService, useClass: AddContentServiceMock },
        { provide: AppConfigService, useValue: { getConfig } },
        { provide: ViewsService, useClass: ViewsServiceMock },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TodosComponent);
    component = fixture.componentInstance;
    component.configIndex = 0;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should addTask', () => {
    component.newTask = '2';
    const addTaskSpy = spyOn(component['tasksService'], 'addTask');
    component.addTasks();
    expect(addTaskSpy).toHaveBeenCalledOnceWith({
      ownerGroup: 'some',
      accessGroups: ['someAccess'],
      isPrivate: false,
      parentId: '1234',
      snippetType: 'task',
      content: '2',
      isDone: false,
    });
  });

  it('should buildTaskTree recursively', async () => {
    const parentTask: Tasks = {
      id: 'task-1',
      content: 'Parent task',
      isDone: false,
    } as Tasks;
    const childTask: Tasks = {
      id: 'task-2',
      content: 'Child task',
      isDone: true,
      parentId: 'task-1',
    } as Tasks;

    spyOn(component['tasksService'], 'getTasksByParent').and.callFake((id: string) => {
      if (id === 'task-1') {
        return Promise.resolve([childTask]);
      }
      return Promise.resolve([]);
    });

    const html = await component.buildTaskTree(parentTask);
    expect(html).toContain('⬜ Parent task');
    expect(html).toContain('&nbsp;&nbsp;&nbsp;&nbsp;✅ Child task');
  });

  it('should exportTasksToLogbook using AddContentService', async () => {
    const changeMessageSpy = spyOn(component['addContentService'], 'changeMessage');
    component.tasks = [{ id: '1', content: 'Task 1', isDone: false } as Tasks];
    await component.exportTasksToLogbook();
    expect(changeMessageSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({
        snippetType: 'paragraph',
        parentId: '1234',
        linkType: 'paragraph',
      }),
    );
  });
});
