import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { TaskComponent } from "./task.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { AppConfigService } from "src/app/app-config.service";
import { Tasks } from "src/app/core/model/tasks";

const getConfig = () => ({});

describe('TaskComponent', () => {
    let component: TaskComponent;
    let fixture: ComponentFixture<TaskComponent>;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          { provide: AppConfigService, useValue: { getConfig } },
        ],
        declarations: [TaskComponent]
      })
        .compileComponents();
    }));
  
    beforeEach(() => {
      fixture = TestBed.createComponent(TaskComponent);
      component = fixture.componentInstance;
      component.task = {isDone: false, id: '123'} as Tasks;
      fixture.detectChanges();
    });
  
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should addTask', () => {
      const addTaskSpy = spyOn(component['tasksService'], 'addTask');
      const task = {isDone: false} as Tasks;
      component.addTask(task);
      expect(addTaskSpy).toHaveBeenCalledOnceWith(task);
    });

    it('should toggleTaskIsDone', () => {
      const updateTaskSpy = spyOn(component['tasksService'], 'updateTask');
      component.toggleTaskIsDone();
      expect(updateTaskSpy).toHaveBeenCalledOnceWith({isDone: true}, '123');
    });

    it('should deleteTask', () => {
      const deleteTaskSpy = spyOn(component['tasksService'], 'deleteTask');
      component.deleteTask();
      expect(deleteTaskSpy).toHaveBeenCalledOnceWith('123');
    });

    it('should deleteTask', () => {
      const deleteTaskSpy = spyOn(component['tasksService'], 'deleteTask');
      component.deleteTask();
      expect(deleteTaskSpy).toHaveBeenCalledOnceWith('123');
    });
    
    it('should isAllowed', () => {
      const canUpdateSpy = spyOn(component['isActionAllowed'], 'canUpdate');
      const canDeleteSpy = spyOn(component['isActionAllowed'], 'canDelete');
      component.isAllowed();
      expect(canUpdateSpy).toHaveBeenCalledTimes(1);
      expect(canDeleteSpy).toHaveBeenCalledTimes(1);
    });

  });
