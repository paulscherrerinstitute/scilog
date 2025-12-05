import {injectable, BindingScope} from '@loopback/core';
import {Logbook, Paragraph} from '../models';
import {Filesnippet} from '../models/file.model';
import {JSDOM} from 'jsdom';
import path from 'path';

@injectable({scope: BindingScope.SINGLETON})
export class EntityBuilderService {
  constructor() {}

  buildPerson(createdBy: string) {
    return {
      '@id': `person://${createdBy}`,
      '@type': 'Person',
      email: createdBy,
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
      name: `SciLog ELN export: ${logbook.name}`,
      description: logbook.description ?? '',
      dateCreated: logbook.createdAt?.toISOString(),
      author,
    };
  }

  buildFileEntity(snippetId: string, fileObj: Filesnippet) {
    return {
      '@id': this.getFilePath(
        snippetId,
        fileObj._fileId,
        fileObj.fileExtension,
      ),
      '@type': 'File',
      name: fileObj.name,
      encodingFormat: fileObj.contentType,
    };
  }

  replaceFileReferences(paragraph: Paragraph, fileObj: Filesnippet): string {
    const dom = new JSDOM(paragraph.textcontent ?? '');
    const document = dom.window.document;

    const paraFile = paragraph.files?.find(f => f.fileId === fileObj.id);
    const newHref = this.getFilePath(
      paragraph.id,
      fileObj._fileId,
      fileObj.fileExtension,
    );

    this.updateElementsInDocument(
      document,
      `a[href="file:${paraFile?.fileHash}"]`,
      'href',
      newHref,
    );

    this.updateElementsInDocument(
      document,
      `img[title="${paraFile?.fileHash}"]`,
      'src',
      newHref,
    );

    return document.body.innerHTML;
  }

  private updateElementsInDocument(
    document: Document,
    selector: string,
    attribute: string,
    value: string,
  ): void {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.setAttribute(attribute, value);
    });
  }

  getEntityId(snippetId: string) {
    return `./${snippetId}/`;
  }

  getFilePath(snippetId: string, fileId: string, ext: string) {
    return `./${path.join(snippetId, `${fileId}.${ext}`)}`;
  }
}
