import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {SnippetRepositoryMixin} from '../mixins';
import {View, ViewRelations} from '../models';
import {AutoAddRepository} from './autoadd.repository.base';

export class ViewRepository extends SnippetRepositoryMixin<
  View,
  typeof View.prototype.id,
  ViewRelations,
  Constructor<
    DefaultCrudRepository<View, typeof View.prototype.id, ViewRelations>
  >
>(AutoAddRepository) {
  constructor(@inject('datasources.mongo') dataSource: MongoDataSource) {
    super(View, dataSource);
  }
}
