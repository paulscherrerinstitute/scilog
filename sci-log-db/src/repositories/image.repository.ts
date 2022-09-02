import {inject} from '@loopback/core';
import { repository } from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {Image, ImageRelations} from '../models';
import { ACLRepository } from './acl.repository';
import {AutoAddRepository} from './autoadd.repository.base';

export class ImageRepository extends AutoAddRepository<
  Image,
  typeof Image.prototype.id,
  ImageRelations
  > {

  constructor(
    @inject('datasources.mongo') dataSource: MongoDataSource,
    @repository(ACLRepository)
    public aclRepository: ACLRepository,
  ) {
    super(Image, dataSource, aclRepository);
  }
}
