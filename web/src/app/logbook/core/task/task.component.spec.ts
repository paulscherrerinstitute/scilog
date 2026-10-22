import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TaskComponent } from './task.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AppConfigService } from 'src/app/app-config.service';
import { Tasks } from 'src/app/core/model/tasks';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

const getConfig = () => ({});

describe('TaskComponent', () => {
  let component: TaskComponent;
  let fixture: ComponentFixture<TaskComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TaskComponent],
      providers: [
        { provide: AppConfigService, useValue: { getConfig } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskComponent);
    component = fixture.componentInstance;
    component.task = { isDone: false, id: '123' } as Tasks;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggleTaskIsDone', () => {
    const updateTaskSpy = spyOn(component['tasksService'], 'updateTask');
    component.toggleTaskIsDone();
    expect(updateTaskSpy).toHaveBeenCalledOnceWith({ isDone: true }, '123');
  });

  it('should deleteTask and emit taskDeleted', async () => {
    const deleteTaskSpy = spyOn(component['tasksService'], 'deleteTask').and.returnValue(
      Promise.resolve() as any,
    );
    const emitSpy = spyOn(component.taskDeleted, 'emit');
    await component.deleteTask();
    expect(deleteTaskSpy).toHaveBeenCalledOnceWith('123');
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should toggleExpand and load subtasks on first expand', async () => {
    const subtask: Tasks = { id: 'sub-1', content: 'Subtask 1', parentId: '123' } as Tasks;
    const loadSpy = spyOn(component['tasksService'], 'getTasksByParent').and.returnValue(
      Promise.resolve([subtask]),
    );
    expect(component.isExpanded).toBeFalse();

    component.toggleExpand();
    expect(component.isExpanded).toBeTrue();
    await fixture.whenStable();
    expect(loadSpy).toHaveBeenCalledWith('123');
    expect(component.subtasks).toEqual([subtask]);
    expect(component.hasLoadedSubtasks).toBeTrue();
  });

  it('should addSubtask', async () => {
    const addSpy = spyOn(component['tasksService'], 'addTask').and.returnValue(
      Promise.resolve() as any,
    );
    spyOn(component['tasksService'], 'getTasksByParent').and.returnValue(Promise.resolve([]));
    component.newSubtask = 'New sub';
    await component.addSubtask();
    expect(addSpy).toHaveBeenCalledWith({
      content: 'New sub',
      parentId: '123',
      isDone: false,
    } as Tasks);
    expect(component.newSubtask).toBe('');
    expect(component.isExpanded).toBeTrue();
  });

  it('should isAllowed', () => {
    const canUpdateSpy = spyOn(component['isActionAllowed'], 'canUpdate');
    const canDeleteSpy = spyOn(component['isActionAllowed'], 'canDelete');
    component.isAllowed();
    expect(canUpdateSpy).toHaveBeenCalledOnceWith(false);
    expect(canDeleteSpy).toHaveBeenCalledOnceWith(false);
  });
});
