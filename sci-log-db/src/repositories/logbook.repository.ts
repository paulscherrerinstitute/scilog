import {inject} from '@loopback/core';
import {MongoDataSource} from '../datasources';
import {Logbook, LogbookRelations} from '../models';
import {AutoAddRepository} from './autoadd.repository.base';

export class LogbookRepository extends AutoAddRepository<
  Logbook,
  typeof Logbook.prototype.id,
  LogbookRelations
> {
  constructor(@inject('datasources.mongo') dataSource: MongoDataSource) {
    super(Logbook, dataSource);
  }
}
