import {inject} from '@loopback/core';
import { DefaultCrudRepository } from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {ACL, ACLRelations} from '../models';

export class ACLRepository extends DefaultCrudRepository<
  ACL,
  typeof ACL.prototype.id,
  ACLRelations
  > {

  constructor(
    @inject('datasources.mongo') dataSource: MongoDataSource,
  ) {
    super(ACL, dataSource);
  }
}
