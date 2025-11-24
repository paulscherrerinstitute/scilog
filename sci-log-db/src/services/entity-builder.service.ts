import {injectable, BindingScope} from '@loopback/core';
import {Logbook, Paragraph} from '../models';
import {Filesnippet} from '../models/file.model';

@injectable({scope: BindingScope.TRANSIENT})
export class EntityBuilderService {
  constructor() {}

  buildPerson(createdBy: string) {
    return {
      '@id': `person://${createdBy}`,
      '@type': 'Person',
    };
  }

  buildParagraphEntity(snippet: Paragraph, author: unknown) {
    return {
      '@id': this.getEntityId(snippet.id),
      '@type': ['Message', 'Dataset'],
      name: `Paragraph ${snippet.id}`,
      text: snippet.textcontent ?? '',
      dateCreated: snippet.createdAt.toISOString(),
      keywords: snippet.tags ? snippet.tags.join(',') : '',
      encodingFormat: 'text/html',
      author,
    };
  }

  buildCommentEntity(
    snippet: Paragraph,
    author: unknown,
    paragraphEntity: unknown,
  ) {
    return {
      '@id': this.getEntityId(snippet.id),
      '@type': ['Comment', 'Dataset'],
      name: `Comment ${snippet.id}`,
      text: snippet.textcontent ?? '',
      dateCreated: snippet.createdAt.toISOString(),
      keywords: snippet.tags ? snippet.tags.join(',') : '',
      encodingFormat: 'text/html',
      parentItem: paragraphEntity,
      author,
    };
  }

  buildLogbookEntity(logbook: Logbook, author: unknown) {
    return {
      '@id': this.getEntityId(logbook.id),
      '@type': ['Book', 'Dataset'],
      genre: 'experiment',
      name: `test scilog export: ${logbook.name}`,
      description: logbook.description ?? '',
      dateCreated: logbook.createdAt.toISOString(),
      hasPart: [] as Array<ReturnType<typeof this.buildParagraphEntity>>,
      author,
    };
  }

  buildFileEntity(snippetId: string, fileObj: Filesnippet) {
    return {
      '@id': `./${snippetId}/${fileObj._fileId}.${fileObj.fileExtension}`,
      '@type': 'File',
      name: fileObj.name,
      encodingFormat: fileObj.contentType,
    };
  }

  getEntityId(snippetId: string) {
    return `./${snippetId}/`;
  }
}
