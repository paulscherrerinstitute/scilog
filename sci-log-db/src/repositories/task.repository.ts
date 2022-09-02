import {inject} from '@loopback/core';
import { repository } from '@loopback/repository';
import { ACLRepository } from './acl.repository';
import {MongoDataSource} from '../datasources';
import {Task, TaskRelations} from '../models';
import {AutoAddRepository} from './autoadd.repository.base';

export class TaskRepository extends AutoAddRepository<
  Task,
  typeof Task.prototype.id,
  TaskRelations
  > {

  constructor(
    @inject('datasources.mongo') dataSource: MongoDataSource,
    @repository(ACLRepository)
    public aclRepository: ACLRepository,
  ) {
    super(Task, dataSource, aclRepository);
  }
}
