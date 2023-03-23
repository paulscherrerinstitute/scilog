import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { Logbooks } from '@model/logbooks';
import { Tasks } from '@model/tasks';
import { ChangeStreamNotification } from './changestreamnotification.model';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { TaskDataService, RemoteDataService } from '@shared/remote-data.service';

@Injectable({
  providedIn: 'root'
})
export class TasksService {

  tasks: Tasks[] = [];
  private tasksSource = new BehaviorSubject(this.tasks);
  public currentTasks = this.tasksSource.asObservable();
  subscriptions: Subscription[] = [];

  constructor(
    private dataService: TaskDataService,
    private remotedataService: RemoteDataService,
    private logbookInfo: LogbookInfoService) {
    this.currentTasks.pipe(shareReplay());
    // get tasks from server

    this.subscriptions.push(this.logbookInfo.currentLogbookInfo.subscribe((data: Logbooks) => {
      if (data != null) {
        this.getTasks(data.id);
      }
    }))
  }

  async getTasks(id: string) {
    this.tasks = await this.dataService.getTasksData(id);
    this.tasksSource.next(this.tasks);
  }

  async addTask(task: Tasks) {
    console.log(task)
    // TODO remove again
    await this.remotedataService.getDatacatalogData();
    await this.dataService.addTask(task);
  }

  async deleteTask(id: string) {
    await this.dataService.deleteTask(id);
  }

  async updateTask(payload: Object, id: string) {
    await this.dataService.patchTask(payload, id);
  }

  get numTasks() {
    return this.tasks.filter(task => {
      return !task.isDone;
    }).length;
  }

  taskChange(data: ChangeStreamNotification) {
    // console.log(data)
    if (!data.id) {
      return;
    }
    switch (data.operationType) {
      case 'insert':
        if (data.content.snippetType == "task") {
          this.tasks.push(data.content);
          this.tasksSource.next(this.tasks);
        }
        break;
      case 'update':
        let updateIndex: number = -1;
        for (let taskIndex = 0; taskIndex < this.tasks.length; taskIndex++) {
          if (data.id == this.tasks[taskIndex].id) {
            updateIndex = taskIndex;
            break;
          }
        }
        if (updateIndex >= 0) {
          if (data.content.deleted) {
            this.tasks.splice(updateIndex, 1);
          } else {
            let updateEntry = this.tasks[updateIndex];
            for (const key in data.content) {
              updateEntry[key] = data.content[key];
            }
            this.tasks[updateIndex] = updateEntry;
          }
          console.log(data)
          console.log(updateIndex)
          this.tasksSource.next(this.tasks);
        }
        break;
      default:
        break;
    }

  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    })
  }

}
