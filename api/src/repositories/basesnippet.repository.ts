import {Basesnippet, BasesnippetRelations} from '../models';
import {MongoDataSource} from '../datasources';
import {Constructor, inject} from '@loopback/core';
import {AutoAddRepository} from './autoadd.repository.base';
import {SnippetRepositoryMixin} from '../mixins/basesnippet.repository-mixin';
import {DefaultCrudRepository} from '@loopback/repository';

export class BasesnippetRepository extends SnippetRepositoryMixin<
  Basesnippet,
  typeof Basesnippet.prototype.id,
  BasesnippetRelations,
  Constructor<
    DefaultCrudRepository<
      Basesnippet,
      typeof Basesnippet.prototype.id,
      BasesnippetRelations
    >
  >
>(AutoAddRepository) {
  constructor(@inject('datasources.mongo') dataSource: MongoDataSource) {
    super(Basesnippet, dataSource);
  }
}
