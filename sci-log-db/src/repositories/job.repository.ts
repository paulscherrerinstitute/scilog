import {inject} from '@loopback/core';
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
  ) {
    super(Job, dataSource);
  }
}
