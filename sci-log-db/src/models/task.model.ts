import {model, property} from '@loopback/repository';
import {Basesnippet} from './basesnippet.model';

@model({
  settings: {
    strict: false,
    scope: {
      where: {snippetType: 'task'},
    },
    mongodb: {collection: 'Basesnippet'},
  },
})
export class Task extends Basesnippet {
  @property({
    type: 'string',
    default: 'task',
  })
  snippetType: string;

  @property({
    type: 'string',
    description: 'Description of the task',
  })
  content: string;

  @property({
    type: 'boolean',
    default: false,
    description: 'True if the task is done',
  })
  isDone: boolean;

  constructor(data?: Partial<Task>) {
    super(data);
  }
}

export interface TaskRelations {
  // describe navigational properties here
}

export type TaskWithRelations = Task & TaskRelations;
