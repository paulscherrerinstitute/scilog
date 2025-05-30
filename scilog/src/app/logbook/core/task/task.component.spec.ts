import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { TaskComponent } from "./task.component";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { AppConfigService } from "src/app/app-config.service";
import { Tasks } from "src/app/core/model/tasks";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";

const getConfig = () => ({});

describe('TaskComponent', () => {
    let component: TaskComponent;
    let fixture: ComponentFixture<TaskComponent>;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
    declarations: [TaskComponent],
    imports: [],
    providers: [
        { provide: AppConfigService, useValue: { getConfig } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
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
      expect(canUpdateSpy).toHaveBeenCalledOnceWith(false);
      expect(canDeleteSpy).toHaveBeenCalledOnceWith(false);
    });

  });
