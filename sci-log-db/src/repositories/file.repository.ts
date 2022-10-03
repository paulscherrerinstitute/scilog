import {inject} from '@loopback/core';
import {MongoDataSource} from '../datasources';
import {FileRelations, Filesnippet} from '../models/file.model';
import {AutoAddRepository} from './autoadd.repository.base';

export class FileRepository extends AutoAddRepository<
  Filesnippet,
  typeof Filesnippet.prototype.id,
  FileRelations
> {
  constructor(@inject('datasources.mongo') dataSource: MongoDataSource) {
    super(Filesnippet, dataSource);
  }
}
