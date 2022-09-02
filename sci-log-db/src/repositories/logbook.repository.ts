import {inject} from '@loopback/core';
import { repository } from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {Logbook, LogbookRelations} from '../models';
import { ACLRepository } from './acl.repository';
import {AutoAddRepository} from './autoadd.repository.base';

export class LogbookRepository extends AutoAddRepository<
  Logbook,
  typeof Logbook.prototype.id,
  LogbookRelations
  > {

  constructor(
    @inject('datasources.mongo') dataSource: MongoDataSource,
    @repository(ACLRepository)
    public aclRepository: ACLRepository,
  ) {
    super(Logbook, dataSource, aclRepository);
  }
}
