import {DefaultCrudRepository} from '@loopback/repository';
import {View, ViewRelations} from '../models';
import {MongoDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class ViewRepository extends DefaultCrudRepository<
  View,
  typeof View.prototype.id,
  ViewRelations
> {
  constructor(
    @inject('datasources.mongo') dataSource: MongoDataSource,
  ) {
    super(View, dataSource);
  }
}
