import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TodosComponent } from './todos.component';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { TasksService } from '@shared/tasks.service';
import { of } from 'rxjs';
import { ChangeStreamService } from '@shared/change-stream.service';
import { AppConfigService } from 'src/app/app-config.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

class ChangeStreamServiceMock {
  getNotification(id:string){
    return of({});
  }
}

class TasksServiceMock {
  numTasks = 0;
  currentTasks = of([{}]);
  taskChange(data: any){}
}

class LogbookInfoMock {
  logbookInfo = {
    id: '1234'
  };
  currentLogbookInfo = of({});

}

const getConfig = () => ({});

describe('TodosComponent', () => {
  let component: TodosComponent;
  let fixture: ComponentFixture<TodosComponent>;


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers:[
        {provide: LogbookInfoService, useClass: LogbookInfoMock},
        {provide: TasksService, useClass: TasksServiceMock},
        { provide: ChangeStreamService, useClass: ChangeStreamServiceMock },
        { provide: AppConfigService, useValue: { getConfig } },
      ],
      imports: [HttpClientTestingModule],
      declarations: [ TodosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TodosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
