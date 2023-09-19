import {inject} from '@loopback/core';
import {MongoDataSource} from '../datasources';
import {AutoAddRepository} from './autoadd.repository.base';
import {Edit, EditRelations} from '../models/edit.model';

export class EditRepository extends AutoAddRepository<
  Edit,
  typeof Edit.prototype.id,
  EditRelations
> {
  constructor(@inject('datasources.mongo') dataSource: MongoDataSource) {
    super(Edit, dataSource);
  }
}
