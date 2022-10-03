import {inject} from '@loopback/core';
import {MongoDataSource} from '../datasources';
import {Task, TaskRelations} from '../models';
import {AutoAddRepository} from './autoadd.repository.base';

export class TaskRepository extends AutoAddRepository<
  Task,
  typeof Task.prototype.id,
  TaskRelations
> {
  constructor(@inject('datasources.mongo') dataSource: MongoDataSource) {
    super(Task, dataSource);
  }
}
