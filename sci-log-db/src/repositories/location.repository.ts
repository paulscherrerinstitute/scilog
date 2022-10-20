import {inject} from '@loopback/core';
import {MongoDataSource} from '../datasources';
import {Location, LocationRelations} from '../models';
import {AutoAddRepository} from './autoadd.repository.base';

export class LocationRepository extends AutoAddRepository<
  Location,
  typeof Location.prototype.id,
  LocationRelations
> {
  constructor(@inject('datasources.mongo') dataSource: MongoDataSource) {
    super(Location, dataSource);
  }
}
