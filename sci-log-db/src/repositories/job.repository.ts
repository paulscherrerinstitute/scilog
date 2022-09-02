import {inject} from '@loopback/core';
import { repository } from '@loopback/repository';
import { ACLRepository } from '.';
import {MongoDataSource} from '../datasources';
import {Job, JobRelations} from '../models/job.model';
import {AutoAddRepository} from './autoadd.repository.base';


export class JobRepository extends AutoAddRepository<
  Job,
  typeof Job.prototype.id,
  JobRelations
  > {
  constructor(
    @inject('datasources.mongo') dataSource: MongoDataSource,
    @repository(ACLRepository)
    public aclRepository: ACLRepository,
  ) {
    super(Job, dataSource, aclRepository);
  }
}
