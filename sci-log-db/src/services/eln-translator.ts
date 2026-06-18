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
   * Extract SciLog-shaped fields from ELN metadata. Returns drafts grouped
   * by kind, each carrying the spec's relationship fields (`hasPart`,
   * `comment`) as plain `@id` strings. The orchestrator drives creation in
   * declaration order (logbook → files → paragraphs → comments), resolving
   * references via the kind-specific Maps.
   */
  static toSciLog(crate: ROCrate): ImportDraft {
    let logbook: LogbookDraft | undefined;
    const files = new Map<string, FileDraft>();
    const paragraphs = new Map<string, ParagraphDraft>();
    const comments = new Map<string, CommentDraft>();

    for (const entity of crate.entities()) {
      const types = entity['@type'] as string[];
      const id = entity['@id'] as string;
      const author = resolveAuthor(crate, entity);
      const hasPart = extractRefs(entity.hasPart);
      const comment = extractRefs(entity.comment);

      if (types.includes('Book')) {
        logbook = {fields: logbookFromBook(entity, author), hasPart, comment};
      } else if (types.includes('Message')) {
        paragraphs.set(id, {
          fields: paragraphFromMessage(entity, author),
          hasPart,
          comment,
        });
      } else if (types.includes('Comment')) {
        comments.set(id, {
          fields: paragraphFromComment(entity, author),
          hasPart,
          comment,
        });
      } else if (types.includes('File')) {
        files.set(id, {fields: filesnippetFromFile(entity), hasPart, comment});
      }
    }

    if (!logbook) throw new Error('ElnTranslator: no Book entity in crate');
    return {logbook, files, paragraphs, comments};
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

function extractRefs(refs: unknown): string[] {
  if (!Array.isArray(refs)) return [];
  return refs.map(ref => (ref as Entity)['@id'] as string);
}

function resolveAuthor(crate: ROCrate, entity: Entity): Entity | undefined {
  const authorId = entity.author?.[0]?.['@id'] as string | undefined;
  return authorId ? crate.getEntity(authorId) : undefined;
}

function logbookFromBook(
  book: Entity,
  author: Entity | undefined,
): Partial<Logbook> {
  const dateCreated = book.dateCreated?.[0] as string | undefined;
  const authorEmail = author?.email?.[0] as string | undefined;

  const tags = ['eln:source:scilog', `eln:id:${book['@id']}`];
  if (authorEmail) tags.push(`eln:author:${authorEmail}`);
  if (dateCreated) tags.push(`eln:created:${dateCreated.slice(0, 10)}`);

  return {
    name: book.name?.[0],
    description: book.description?.[0],
    tags,
  };
}

function paragraphFromMessage(
  message: Entity,
  author: Entity | undefined,
): Partial<Paragraph> {
  return paragraphFields(message, author, LinkType.PARAGRAPH);
}

function paragraphFromComment(
  comment: Entity,
  author: Entity | undefined,
): Partial<Paragraph> {
  return paragraphFields(comment, author, LinkType.COMMENT);
}

function paragraphFields(
  entity: Entity,
  author: Entity | undefined,
  linkType: LinkType,
): Partial<Paragraph> {
  const dateCreated = entity.dateCreated?.[0] as string | undefined;
  const authorEmail = author?.email?.[0] as string | undefined;
  const keywords = entity.keywords?.[0] as string | undefined;

  const tags = ['eln:source:scilog', `eln:id:${entity['@id']}`];
  if (authorEmail) tags.push(`eln:author:${authorEmail}`);
  if (dateCreated) tags.push(`eln:created:${dateCreated.slice(0, 10)}`);
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
    tags: ['eln:source:scilog', `eln:id:${file['@id']}`],
  };
}

// --- types ---

/**
 * Drafts of entities to create from an .eln archive, grouped by SciLog kind.
 *
 * The orchestrator drives creation in declaration order: logbook first, then
 * files (all parented to the logbook), then paragraphs (which embed file
 * references via `hasPart` and recurse into `comment` for sub-comments).
 *
 * `hasPart` and `comment` carry the spec's relationship fields as plain
 * `@id` strings — references are resolved via the kind-specific Maps below.
 */
export type ImportDraft = {
  logbook: LogbookDraft;
  files: Map<string, FileDraft>;
  paragraphs: Map<string, ParagraphDraft>;
  comments: Map<string, CommentDraft>;
};

/** Fields common to every draft. */
type DraftBase = {
  /** Child `@id`s from the entity's `hasPart` field. */
  hasPart: string[];
  /** Child `@id`s from the entity's schema.org `comment` field. */
  comment: string[];
};

export type LogbookDraft = DraftBase & {
  fields: Partial<Logbook>;
};

export type ParagraphDraft = DraftBase & {
  fields: Partial<Paragraph>;
};

export type FileDraft = DraftBase & {
  fields: Partial<Filesnippet>;
};

export type CommentDraft = DraftBase & {
  fields: Partial<Paragraph>;
};
