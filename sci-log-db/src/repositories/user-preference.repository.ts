import {inject} from '@loopback/core';
import {UserPreference, UserPreferenceRelations} from '../models';
import {DefaultCrudRepository, juggler} from '@loopback/repository';


export class UserPreferenceRepository extends DefaultCrudRepository<
  UserPreference,
  typeof UserPreference.prototype.id,
  UserPreferenceRelations
> {
  constructor(
    @inject('datasources.mongo') dataSource: juggler.DataSource,
  ) {
    super(UserPreference, dataSource);
  }
}
