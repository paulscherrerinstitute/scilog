import {model, property} from '@loopback/repository';
import {Basesnippet} from './basesnippet.model';

@model({
  settings: {
    strict: true,
    scope: {
      where: {snippetType: 'job'},
    },
    mongodb: {collection: 'Basesnippet'},
  },
})
export class Job extends Basesnippet {
  @property({
    type: 'string',
    default: 'job',
  })
  snippetType: string;

  @property({
    type: 'string',
    description: 'Job description',
  })
  description?: string;

  @property({
    type: Object,
    description: 'Job parameters',
  })
  params?: Object;

  constructor(data?: Partial<Job>) {
    super(data);
  }
}

export interface JobRelations {
  // describe navigational properties here
}

export type JobWithRelations = Job & JobRelations;
