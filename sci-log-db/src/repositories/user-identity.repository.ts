import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {UserIdentity} from '../models';
import {inject} from '@loopback/core';

export class UserIdentityRepository extends DefaultCrudRepository<
  UserIdentity,
  typeof UserIdentity.prototype.id,
  UserIdentity
> {
  constructor(@inject('datasources.mongo') dataSource: juggler.DataSource) {
    super(UserIdentity, dataSource);
  }
}
