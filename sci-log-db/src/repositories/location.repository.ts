import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {SnippetRepositoryMixin} from '../mixins';
import {Location, LocationRelations} from '../models';
import {AutoAddRepository} from './autoadd.repository.base';

export class LocationRepository extends SnippetRepositoryMixin<
  Location,
  typeof Location.prototype.id,
  LocationRelations,
  Constructor<
    DefaultCrudRepository<
      Location,
      typeof Location.prototype.id,
      LocationRelations
    >
  >
>(AutoAddRepository) {
  constructor(@inject('datasources.mongo') dataSource: MongoDataSource) {
    super(Location, dataSource);
  }
}
