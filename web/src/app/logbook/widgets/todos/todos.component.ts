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
import { MatCardModule } from '@angular/material/card';
import { AddContentService } from '@shared/add-content.service';

@Component({
  selector: 'app-todos',
  templateUrl: './todos.component.html',
  styleUrls: ['./todos.component.scss'],
  imports: [NgIf, MatFormField, MatInput, FormsModule, NgFor, TaskComponent, MatCardModule],
})
export class TodosComponent implements OnInit, OnDestroy {
  @Input()
  configIndex: number;

  tasks: Tasks[] = [];
  newTask = '';
  numTasks: number = 0;
  subscriptions: Subscription[] = [];

  notificationSubscription: any = null;

  constructor(
    private tasksService: TasksService,
    private logbookInfo: LogbookInfoService,
    private notificationService: ChangeStreamService,
    private addContentService: AddContentService,
    private views: ViewsService,
  ) {}

  async buildTaskTree(task: Tasks, level: number = 0): Promise<string> {
    const indent = '&nbsp;'.repeat(level * 4);
    const statusIcon = task.isDone ? '✅' : '⬜';
    let html = `${indent}${statusIcon} ${task.content}<br>`;
    const children = await this.tasksService.getTasksByParent(task.id);
    for (const child of children) {
      html += await this.buildTaskTree(child, level + 1);
    }
    return html;
  }

  async exportTasksToLogbook() {
    if (!this.tasks?.length || !this.logbookInfo?.logbookInfo) return;

    let bulletHTML = '';
    for (const task of this.tasks) {
      bulletHTML += await this.buildTaskTree(task);
      bulletHTML += '<br>';
    }

    const notification = {
      ownerGroup: this.logbookInfo.logbookInfo.ownerGroup,
      accessGroups: this.logbookInfo.logbookInfo.accessGroups,
      isPrivate: this.logbookInfo.logbookInfo.isPrivate,
      snippetType: 'paragraph',
      parentId: this.logbookInfo.logbookInfo.id,
      linkType: 'paragraph',
      tags: [],
      id_session: localStorage.getItem('id_session'),
      textcontent: `
      <p><strong>Tasks</strong></p>
      <p>${bulletHTML}</p>
    `,
    };

    this.addContentService.changeMessage(notification);
  }

  ngOnInit(): void {
    // get TODOs from server
    this.subscriptions.push(
      this.tasksService.currentTasks.subscribe((tasks) => {
        this.tasks = tasks;
        this.numTasks = this.tasksService.numTasks;
      }),
    );

    this.subscriptions.push(
      this.views.currentWidgetConfigs.subscribe((config) => {
        if (this.notificationSubscription == null) {
          let configTasks = config[this.configIndex].config;
          configTasks.filter.snippetType = ['task'];

          this.notificationSubscription = this.notificationService
            .getNotification(this.logbookInfo.logbookInfo.id, configTasks)
            .subscribe((data) => {
              this.tasksService.taskChange(data);
            });
        }
      }),
    );
  }

  addTasks() {
    let newTask: Tasks = {
      ownerGroup: this.logbookInfo.logbookInfo.ownerGroup,
      accessGroups: this.logbookInfo.logbookInfo.accessGroups,
      isPrivate: this.logbookInfo.logbookInfo.isPrivate,
      parentId: this.logbookInfo.logbookInfo.id,
      snippetType: 'task',
      content: this.newTask,
      isDone: false,
    };
    this.tasksService.addTask(newTask);
    this.newTask = '';
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
    if (this.notificationSubscription != null) {
      this.notificationSubscription.unsubscribe();
    }
  }
}
