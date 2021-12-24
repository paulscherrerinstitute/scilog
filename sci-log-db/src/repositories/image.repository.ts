import {inject} from '@loopback/core';
import {MongoDataSource} from '../datasources';
import {Image, ImageRelations} from '../models';
import {AutoAddRepository} from './autoadd.repository.base';

export class ImageRepository extends AutoAddRepository<
  Image,
  typeof Image.prototype.id,
  ImageRelations
  > {

  constructor(
    @inject('datasources.mongo') dataSource: MongoDataSource,
  ) {
    super(Image, dataSource);
  }
}
