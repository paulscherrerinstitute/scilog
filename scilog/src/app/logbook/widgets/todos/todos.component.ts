import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Tasks } from '@model/tasks';
import { TasksService } from '@shared/tasks.service';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { ChangeStreamService } from '@shared/change-stream.service';
import { Subscription } from 'rxjs';
import { ViewsService } from '@shared/views.service';
import { NgIf, NgFor } from '@angular/common';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { TaskComponent } from '../../core/task/task.component';

@Component({
    selector: 'app-todos',
    templateUrl: './todos.component.html',
    styleUrls: ['./todos.component.scss'],
    imports: [NgIf, MatFormField, MatInput, FormsModule, NgFor, TaskComponent]
})
export class TodosComponent implements OnInit, OnDestroy {

  @Input()
  configIndex: number;

  tasks: Tasks[] = [];
  newTask = '';
  numTasks: number = 0;
  subscriptions: Subscription[] = [];

  notificationSubscription: any = null;

  constructor(private tasksService: TasksService,
    private logbookInfo: LogbookInfoService,
    private notificationService: ChangeStreamService,
    private views: ViewsService) {
    console.log("constructor called")
  }

  ngOnInit(): void {
    // get TODOs from server
    console.log("todo: adding subscriptions");
    this.subscriptions.push(this.tasksService.currentTasks.subscribe(tasks => {
      this.tasks = tasks;
      this.numTasks = this.tasksService.numTasks;
      console.log("tasks:", this.tasks);
      console.log(this.logbookInfo.logbookInfo)
    }));

    this.subscriptions.push(this.views.currentWidgetConfigs.subscribe(config => {
      if (this.notificationSubscription == null) {
        console.log(this.logbookInfo.logbookInfo); 
        let configTasks = config[this.configIndex].config;
        configTasks.filter.snippetType = ["task"];

        this.notificationSubscription = this.notificationService.getNotification(this.logbookInfo.logbookInfo.id, configTasks).subscribe(data => {
          console.log(data);
          this.tasksService.taskChange(data);
        });
      }
    }));

  }

  addTasks() {
    let newTask: Tasks = {
      ownerGroup: this.logbookInfo.logbookInfo.ownerGroup,
      accessGroups: this.logbookInfo.logbookInfo.accessGroups,
      isPrivate: this.logbookInfo.logbookInfo.isPrivate,
      parentId: this.logbookInfo.logbookInfo.id,
      snippetType: "task",
      content: this.newTask,
      isDone: false
    };
    console.log("adding new task")
    this.tasksService.addTask(newTask);
    this.newTask = '';
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    })
    if (this.notificationSubscription != null){
      this.notificationSubscription.unsubscribe();
    }
  }

}
