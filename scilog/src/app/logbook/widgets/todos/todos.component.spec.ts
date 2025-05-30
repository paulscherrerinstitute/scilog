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

class ChangeStreamServiceMock {
  getNotification(id:string){
    return of({});
  }
}

class TasksServiceMock {
  numTasks = 0;
  currentTasks = of([{}]);
  taskChange(data: any){};
  addTask(){};
}

class ViewsServiceMock {
  currentWidgetConfigs = of([{config: {filter: {}}}])
}

class LogbookInfoMock {
  logbookInfo = {
    id: '1234',
    ownerGroup: 'some',
    accessGroups: ['someAccess'],
    isPrivate: false,
    snippetType: "task",
    content: '2',
    isDone: false
  };
  currentLogbookInfo = of({});

}

const getConfig = () => ({});

describe('TodosComponent', () => {
  let component: TodosComponent;
  let fixture: ComponentFixture<TodosComponent>;
  let isActionAllowedServiceSpy
 
  beforeEach(waitForAsync(() => {
    isActionAllowedServiceSpy = jasmine.createSpyObj("IsAllowedService", ["canUpdate", "canDelete"]);
    isActionAllowedServiceSpy.tooltips = {update: '', delete: ''};  
    TestBed.configureTestingModule({
    declarations: [TodosComponent],
    imports: [],
    providers: [
        { provide: LogbookInfoService, useClass: LogbookInfoMock },
        { provide: TasksService, useClass: TasksServiceMock },
        { provide: ChangeStreamService, useClass: ChangeStreamServiceMock },
        { provide: AppConfigService, useValue: { getConfig } },
        { provide: ViewsService, useClass: ViewsServiceMock },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
})
    .compileComponents();
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
    component.newTask = '2'
    const addTaskSpy = spyOn(component['tasksService'], 'addTask');
    component.addTasks();
    expect(addTaskSpy).toHaveBeenCalledOnceWith({
      ownerGroup: 'some',
      accessGroups: ['someAccess'],
      isPrivate: false,
      parentId: '1234',
      snippetType: "task",
      content: '2',
      isDone: false
    });
  });

});
