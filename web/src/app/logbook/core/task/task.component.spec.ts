import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TaskComponent } from './task.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AppConfigService } from 'src/app/app-config.service';
import { Tasks } from 'src/app/core/model/tasks';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TasksService } from '@shared/tasks.service';
const getConfig = () => ({});
class TasksServiceMock {
  getTasksByParent() {
    return Promise.resolve([]);
  }

  async addTask() {}
  async updateTask() {}
  async deleteTask() {}
}
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
        { provide: TasksService, useClass: TasksServiceMock },
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

  it('should create a subtask with its parent ownership and access fields', async () => {
    spyOn(component['isActionAllowed'], 'canUpdate').and.returnValue(true);
    component.task = {
      id: '123',
      ownerGroup: 'owners',
      accessGroups: ['readers'],
      isPrivate: true,
    } as Tasks;

    const addSpy = spyOn(component['tasksService'], 'addTask').and.resolveTo();
    component.newSubtask = ' New sub ';

    await component.addSubtask();

    expect(addSpy).toHaveBeenCalledOnceWith({
      ownerGroup: 'owners',
      accessGroups: ['readers'],
      isPrivate: true,
      snippetType: 'task',
      content: 'New sub',
      parentId: '123',
      isDone: false,
    });
    expect(component.newSubtask).toBe('');
    expect(component.isExpanded).toBeTrue();
  });
  it('should prevent subtask creation when updating is denied', async () => {
    spyOn(component['isActionAllowed'], 'canUpdate').and.returnValue(false);
    const addSpy = spyOn(component['tasksService'], 'addTask');
    component.newSubtask = 'Restricted subtask';

    component.toggleSubtaskInput();
    await component.addSubtask();

    expect(component.showSubtaskInput).toBeFalse();
    expect(addSpy).not.toHaveBeenCalled();
  });

  it('should isAllowed', () => {
    const canUpdateSpy = spyOn(component['isActionAllowed'], 'canUpdate');
    const canDeleteSpy = spyOn(component['isActionAllowed'], 'canDelete');
    component.isAllowed();
    expect(canUpdateSpy).toHaveBeenCalledOnceWith(false);
    expect(canDeleteSpy).toHaveBeenCalledOnceWith(false);
  });
});
