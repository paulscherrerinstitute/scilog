/**
 * Translator between SciLog domain models and ELN metadata
 * (RO-Crate 1.2 with ELN-spec constraints).
 *
 * See https://github.com/paulscherrerinstitute/scilog/issues/610 for design
 * rationale and open questions.
 */

import {JSDOM} from 'jsdom';
import path from 'node:path';
import {Entity, ROCrate} from 'ro-crate';
import {Logbook, Paragraph} from '../models';
import {Filesnippet} from '../models/file.model';
import {LinkType} from '../models/paragraph.model';

export class ElnTranslator {
  /**
   * Translate ELN metadata into a SciLog logbook draft: a tree whose nodes
   * carry their embedded files and their nested paragraphs (a comment is a
   * paragraph with `linkType=comment`). Files keep their `@id` so the
   * orchestrator can fetch their bytes; the orchestrator assigns SciLog
   * identity (id, hashes) when it creates them.
   */
  static toSciLog(crate: ROCrate): LogbookDraft {
    const book = findBook(crate);
    if (!book) throw new Error('ElnTranslator: no Book entity in crate');
    return buildLogbook(book);
  }

  /**
   * Rewrite ELN-format file references in a paragraph's HTML back to the
   * SciLog convention. Inverse of `EntityBuilderService.replaceFileReferences`.
   *
   * - `<a href="./<elnPath>">`           → `<a href="file:<newFileHash>">`
   * - `<img src="./<elnPath>" title=...>` → `<img title="<newFileHash>" ...>`
   *   (src is left as-is; SciLog's frontend re-renders it from the file's
   *   accessHash at view time, using `title` as the discriminator.)
   *
   * Throws if an `href`/`src` references a path absent from `fileMap` —
   * the orchestrator is contractually required to supply a complete map.
   */
  static decodeFileReferences(
    html: string,
    fileMap: ReadonlyMap<string, {fileHash: string}>,
  ): string {
    const dom = new JSDOM(html);
    const {document} = dom.window;

    const rewriteRef = (
      el: Element,
      readAttr: string,
      writeAttr: string,
      format: (hash: string) => string,
    ) => {
      const ref = el.getAttribute(readAttr) ?? '';
      if (!ref.startsWith('./')) return;
      const entry = fileMap.get(ref);
      if (!entry) {
        throw new Error(
          `ElnTranslator.decodeFileReferences: no file map entry for ${readAttr} ${ref}`,
        );
      }
      el.setAttribute(writeAttr, format(entry.fileHash));
    };

    for (const link of document.querySelectorAll('a[href]'))
      rewriteRef(link, 'href', 'href', hash => `file:${hash}`);
    for (const img of document.querySelectorAll('img[src]'))
      rewriteRef(img, 'src', 'title', hash => hash);

    return document.body.innerHTML;
  }
}

// --- crate navigation (the crate is parsed in `link` mode, so reference
// fields like `author`, `hasPart`, and `comment` yield linked entities) ---

function findBook(crate: ROCrate): Entity | undefined {
  return [...crate.entities()].find(entity => entity.$$hasType('Book'));
}

/** Linked entities of a given `@type` in `entity`'s `hasPart`. */
function partsOfType(entity: Entity, type: string): Entity[] {
  return (entity.hasPart ?? []).filter((part: Entity) => part.$$hasType(type));
}

// --- field mappers: ELN entity → SciLog model fields ---

/** Provenance tags carried by every entity: ELN id, author, date created. */
function provenanceTags(entity: Entity): string[] {
  const tags = [`eln:id:${entity['@id']}`];
  const authorEmail = entity.author?.[0]?.email?.[0] as string | undefined;
  if (authorEmail) tags.push(`eln:author:${authorEmail}`);
  const dateCreated = entity.dateCreated?.[0] as string | undefined;
  if (dateCreated) tags.push(`eln:created:${dateCreated.slice(0, 10)}`);
  return tags;
}

function logbookFromBook(book: Entity): Partial<Logbook> {
  return {
    name: book.name?.[0],
    description: book.description?.[0],
    tags: ['eln:source:scilog', ...provenanceTags(book)],
  };
}

function paragraphFromMessage(message: Entity): Partial<Paragraph> {
  return paragraphFromEntity(message, LinkType.PARAGRAPH);
}

function paragraphFromComment(comment: Entity): Partial<Paragraph> {
  return paragraphFromEntity(comment, LinkType.COMMENT);
}

function paragraphFromEntity(
  entity: Entity,
  linkType: LinkType,
): Partial<Paragraph> {
  const dateCreated = entity.dateCreated?.[0] as string | undefined;
  const keywords = entity.keywords?.[0] as string | undefined;

  const tags = provenanceTags(entity);
  if (keywords) tags.push(...keywords.split(','));

  return {
    linkType,
    textcontent: entity.text?.[0] as string | undefined,
    tags,
    defaultOrder: dateCreated
      ? new Date(dateCreated).getTime() * 1000
      : undefined,
  };
}

function filesnippetFromFile(file: Entity): Partial<Filesnippet> {
  const name = file.name?.[0] as string | undefined;
  const contentSize = file.contentSize?.[0] as string | undefined;
  // path.extname returns '.jpg'; SciLog stores fileExtension without the dot.
  const ext = name ? path.extname(name) : '';
  const fileExtension = ext ? ext.slice(1) : undefined;

  return {
    name,
    filename: name,
    contentType: file.encodingFormat?.[0] as string | undefined,
    contentSize: contentSize !== undefined ? Number(contentSize) : undefined,
    contentSha256: file.sha256?.[0] as string | undefined,
    fileExtension,
    tags: [`eln:id:${file['@id']}`],
  };
}

// --- draft builders: ELN entity → draft node ---

function buildLogbook(book: Entity): LogbookDraft {
  return {
    fields: logbookFromBook(book),
    // Comments also appear in a Book's hasPart, but are built under their
    // message via the `comment` field, so only messages are taken here.
    paragraphs: partsOfType(book, 'Message').map(buildParagraph),
  };
}

function buildParagraph(entity: Entity): ParagraphDraft {
  return {
    fields: entity.$$hasType('Comment')
      ? paragraphFromComment(entity)
      : paragraphFromMessage(entity),
    files: partsOfType(entity, 'File').map(buildFile),
    paragraphs: (entity.comment ?? []).map(buildParagraph),
  };
}

function buildFile(file: Entity): FileDraft {
  return {
    elnId: file['@id'] as string,
    fields: filesnippetFromFile(file),
  };
}

// --- types ---

export type LogbookDraft = {
  fields: Partial<Logbook>;
  paragraphs: ParagraphDraft[];
};

export type ParagraphDraft = {
  fields: Partial<Paragraph>;
  files: FileDraft[];
  /** Paragraphs nested under this one; comments are the common case. */
  paragraphs: ParagraphDraft[];
};

export type FileDraft = {
  /** Archive-relative `@id`; locates the file's bytes for upload. */
  elnId: string;
  fields: Partial<Filesnippet>;
};
