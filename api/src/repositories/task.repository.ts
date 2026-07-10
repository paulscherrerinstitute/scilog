import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {Task, TaskRelations} from '../models';
import {AutoAddRepository} from './autoadd.repository.base';
import {SnippetRepositoryMixin} from '../mixins/basesnippet.repository-mixin';

export class TaskRepository extends SnippetRepositoryMixin<
  Task,
  typeof Task.prototype.id,
  TaskRelations,
  Constructor<
    DefaultCrudRepository<Task, typeof Task.prototype.id, TaskRelations>
  >
>(AutoAddRepository) {
  constructor(@inject('datasources.mongo') dataSource: MongoDataSource) {
    super(Task, dataSource);
  }
}
