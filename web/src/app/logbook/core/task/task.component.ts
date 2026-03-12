import { Component, Input, OnInit } from '@angular/core';
import { Tasks } from '@model/tasks';
import { TasksService } from '@shared/tasks.service';
import { IsAllowedService } from 'src/app/overview/is-allowed.service';

import { MatCard, MatCardContent } from '@angular/material/card';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatTooltip } from '@angular/material/tooltip';
import { NgStyle, NgIf, NgFor } from '@angular/common';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Output, EventEmitter } from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';


@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
  providers: [IsAllowedService],
  standalone: true,
  imports: [
    MatCard,
    MatCardContent,
    MatCheckbox,
    MatTooltip,
    NgStyle,
    NgIf,
    NgFor,
    MatIconButton,
    MatIcon,
    FormsModule,
    MatFormField,
    MatInput,
  ]
})
export class TaskComponent implements OnInit {
  @Input()
  task: Tasks;


  // Expand / collapse
  isExpanded = false;
  hasLoadedSubtasks = false;
  subtasks: Tasks[] = [];

  // Add subtask
  showSubtaskInput = false;
  newSubtask = '';

  @Output() taskDeleted = new EventEmitter<void>();

  constructor(
    private tasksService: TasksService,
    protected isActionAllowed: IsAllowedService
  ) {}

  ngOnInit(): void {
    this.isActionAllowed.snippet = this.task;
    this.isAllowed();
  }

  // Toggle done
  toggleTaskIsDone() {
    let payload = {
      isDone: !this.task.isDone,
    };
    this.tasksService.updateTask(payload, this.task.id);
  }

  // Delete
 async deleteTask() {
  await this.tasksService.deleteTask(this.task.id);
  this.taskDeleted.emit();
}


  // Expand / collapse
  toggleExpand() {
    this.isExpanded = !this.isExpanded;

    if (this.isExpanded && !this.hasLoadedSubtasks) {
      this.loadSubtasks();
    }
  }

  async loadSubtasks() {
    this.subtasks = await this.tasksService.getTasksByParent(this.task.id);
    this.hasLoadedSubtasks = true;
  }

  // Add subtask
  toggleSubtaskInput() {
    this.showSubtaskInput = !this.showSubtaskInput;
  }

  async addSubtask() {
    if (!this.newSubtask.trim()) return;

    const payload: Tasks = {
      content: this.newSubtask,
      parentId: this.task.id,
      isDone: false
    } as Tasks;

    await this.tasksService.addTask(payload);

    this.newSubtask = '';
    this.showSubtaskInput = false;

    this.loadSubtasks();
    this.isExpanded = true;
  }

  get taskHasChildren(): boolean {
    return this.subtasks.length > 0 || !this.hasLoadedSubtasks;
  }

  isAllowed() {
    this.isActionAllowed.canDelete(false);
    this.isActionAllowed.canUpdate(false);
  }
}
