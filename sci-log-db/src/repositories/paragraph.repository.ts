import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {SnippetRepositoryMixin} from '../mixins';
import {Paragraph, ParagraphRelations} from '../models';
import {AutoAddRepository} from './autoadd.repository.base';

export class ParagraphRepository extends SnippetRepositoryMixin<
  Paragraph,
  typeof Paragraph.prototype.id,
  ParagraphRelations,
  Constructor<
    DefaultCrudRepository<
      Paragraph,
      typeof Paragraph.prototype.id,
      ParagraphRelations
    >
  >
>(AutoAddRepository) {
  constructor(@inject('datasources.mongo') dataSource: MongoDataSource) {
    super(Paragraph, dataSource);
  }
}
