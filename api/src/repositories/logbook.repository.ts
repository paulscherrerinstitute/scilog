import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {SnippetRepositoryMixin} from '../mixins';
import {Logbook, LogbookRelations} from '../models';
import {AutoAddRepository} from './autoadd.repository.base';

export class LogbookRepository extends SnippetRepositoryMixin<
  Logbook,
  typeof Logbook.prototype.id,
  LogbookRelations,
  Constructor<
    DefaultCrudRepository<
      Logbook,
      typeof Logbook.prototype.id,
      LogbookRelations
    >
  >
>(AutoAddRepository) {
  constructor(@inject('datasources.mongo') dataSource: MongoDataSource) {
    super(Logbook, dataSource);
  }
}
