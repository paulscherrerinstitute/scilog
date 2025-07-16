import { Component, Input, OnInit } from '@angular/core';
import { Tasks } from '@model/tasks';
import { TasksService } from '@shared/tasks.service';
import { IsAllowedService } from 'src/app/overview/is-allowed.service';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatTooltip } from '@angular/material/tooltip';
import { NgStyle } from '@angular/common';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-task',
    templateUrl: './task.component.html',
    styleUrls: ['./task.component.scss'],
    providers: [IsAllowedService],
    imports: [MatCard, MatCardContent, MatCheckbox, MatTooltip, NgStyle, MatIconButton, MatIcon]
})
export class TaskComponent implements OnInit {

  @Input()
  task: Tasks;

  constructor(
    private tasksService: TasksService,
    protected isActionAllowed: IsAllowedService) {
    console.log("constructor called")
  }

  ngOnInit(): void {
    this.isActionAllowed.snippet = this.task;
    this.isAllowed();
  }

  toggleTaskIsDone() {
    let payload = {
      isDone: !this.task.isDone
    }
    this.tasksService.updateTask(payload, this.task.id);
  }

  deleteTask() {
    console.log("deleting task");
    this.tasksService.deleteTask(this.task.id);
  }

  isAllowed() {
    this.isActionAllowed.canDelete(false);
    this.isActionAllowed.canUpdate(false);
  }

}
