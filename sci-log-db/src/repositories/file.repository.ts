import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {SnippetRepositoryMixin} from '../mixins';
import {FileRelations, Filesnippet} from '../models/file.model';
import {AutoAddRepository} from './autoadd.repository.base';

export class FileRepository extends SnippetRepositoryMixin<
  Filesnippet,
  typeof Filesnippet.prototype.id,
  FileRelations,
  Constructor<
    DefaultCrudRepository<
      Filesnippet,
      typeof Filesnippet.prototype.id,
      FileRelations
    >
  >
>(AutoAddRepository) {
  constructor(@inject('datasources.mongo') dataSource: MongoDataSource) {
    super(Filesnippet, dataSource);
  }
}
