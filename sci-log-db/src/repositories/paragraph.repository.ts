import {inject} from '@loopback/core';
import {MongoDataSource} from '../datasources';
import {Paragraph, ParagraphRelations} from '../models';
import {AutoAddRepository} from './autoadd.repository.base';


export class ParagraphRepository extends AutoAddRepository<
  Paragraph,
  typeof Paragraph.prototype.id,
  ParagraphRelations
  > {
  constructor(
    @inject('datasources.mongo') dataSource: MongoDataSource,
  ) {
    super(Paragraph, dataSource);
  }
}
