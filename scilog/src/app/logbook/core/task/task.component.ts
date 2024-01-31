import { Component, Input, OnInit } from '@angular/core';
import { Tasks } from '@model/tasks';
import { TasksService } from '@shared/tasks.service';
import { IsAllowedService } from 'src/app/overview/is-allowed.service';

@Component({
  selector: 'task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
  providers: [IsAllowedService],
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

  addTask(task: Tasks) {
    this.tasksService.addTask(task);
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
    this.isActionAllowed.canDelete();
    this.isActionAllowed.canUpdate();
  }

}
