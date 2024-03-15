import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {SnippetRepositoryMixin} from '../mixins';
import {Paragraph, ParagraphRelations} from '../models';
import {AutoAddRepository} from './autoadd.repository.base';
import {sanitizeTextContent} from '../utils/misc';

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

  async migrateHtmlTexcontent() {
    const paragraphsCursor = await this.execute('Paragraph', 'find', {
      htmlTextcontent: null,
      textcontent: {$ne: null},
    });
    const paragraphs = await paragraphsCursor.toArray();
    const baseSnippetRepository = await this.baseSnippetRepository();
    await Promise.all(
      paragraphs.map(async (paragraph: {_id: string; textcontent: string}) => {
        const sanitised = sanitizeTextContent(paragraph.textcontent);
        if (!sanitised) return;
        return baseSnippetRepository.updateById(
          `${paragraph._id}`,
          {htmlTextcontent: sanitised},
          {currentUser: {roles: ['admin']}},
        );
      }),
    );
  }
}
