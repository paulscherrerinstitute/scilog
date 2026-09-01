/**
 * Translator between SciLog domain models and ELN metadata
 * (RO-Crate 1.2 with ELN-spec constraints).
 *
 * See https://github.com/paulscherrerinstitute/scilog/issues/610 for design
 * rationale and open questions.
 */

import path from 'node:path';
import {Entity, ROCrate} from 'ro-crate';
import {Logbook, Paragraph} from '../../../models';
import {Filesnippet} from '../../../models/file.model';
import {LinkType} from '../../../models/paragraph.model';
import {ElnError, ElnErrorCode} from '../errors';
import {provenanceTags, sourceTag} from './provenance';
import type {
  FileDraft,
  LogbookDraft,
  ParagraphDraft,
  Translator,
} from './translator';

const SOURCE = 'scilog';
const PUBLISHER = 'https://github.com/paulscherrerinstitute/scilog';

export class ScilogTranslator implements Translator {
  matches(crate: ROCrate): boolean {
    return crate.descriptor.sdPublisher?.[0]?.['@id'] === PUBLISHER;
  }

  /** Validate the crate against SciLog's ELN profile; `[]` means valid. */
  validate(crate: ROCrate): ElnError[] {
    return [
      ...validateSdPublisher(crate),
      ...validateDatasets(crate),
      ...validateAuthors(crate),
      ...validateFiles(crate),
    ];
  }

  /**
   * Translate ELN metadata into a SciLog logbook draft: a tree whose nodes
   * carry their embedded files and their nested paragraphs (a comment is a
   * paragraph with `linkType=comment`). Files keep their `@id` so the
   * orchestrator can fetch their bytes; the orchestrator assigns SciLog
   * identity (id, hashes) when it creates them.
   */
  toSciLog(crate: ROCrate): LogbookDraft {
    const book = findBook(crate);
    if (!book) throw new Error('ScilogTranslator: no Book entity in crate');
    return buildLogbook(book);
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

/** Extract SciLog's provenance values from an entity and format them. */
function entityProvenance(entity: Entity): string[] {
  const created = entity.dateCreated?.[0] as string | undefined;
  return provenanceTags({
    id: entity['@id'] as string,
    author: entity.author?.[0]?.email?.[0] as string | undefined,
    created: created ? new Date(created) : undefined,
  });
}

function logbookFromBook(book: Entity): Partial<Logbook> {
  return {
    name: book.name?.[0],
    description: book.description?.[0],
    tags: [sourceTag(SOURCE), ...entityProvenance(book)],
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

  const tags = entityProvenance(entity);
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
    tags: provenanceTags({id: file['@id'] as string}),
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

// --- validation: SciLog's ELN profile (crate-level). Generic RO-Crate
// well-formedness (conformsTo, referential integrity, file integrity) stays
// in `../archive`. ---

function validateAuthors(crate: ROCrate): ElnError[] {
  const errors: ElnError[] = [];
  for (const entity of crate.entities()) {
    const author = entity.author;
    if (!author?.length) continue;

    for (const ref of author) {
      const id = ref['@id'];
      const person = crate.getEntity(id);
      if (!person) {
        errors.push({
          code: ElnErrorCode.INVALID_AUTHOR,
          message: `author: entity ${id} not found`,
        });
        continue;
      }

      const types = person['@type'] as string[];
      if (!types.includes('Person')) {
        errors.push({
          code: ElnErrorCode.INVALID_AUTHOR,
          message: `author ${id}: must be a Person`,
        });
      }
      if (!person.email?.length) {
        errors.push({
          code: ElnErrorCode.INVALID_AUTHOR,
          message: `author ${id}: missing email`,
        });
      }
    }
  }
  return errors;
}

function validateFiles(crate: ROCrate): ElnError[] {
  const errors: ElnError[] = [];
  for (const entity of crate.entities()) {
    const types = entity['@type'] as string[];
    if (!types.includes('File')) continue;

    if (!entity.name?.length) {
      errors.push({
        code: ElnErrorCode.MISSING_FILE_FIELD,
        message: `File ${entity['@id']}: missing name`,
      });
    }
    if (!entity.encodingFormat?.length) {
      errors.push({
        code: ElnErrorCode.MISSING_FILE_FIELD,
        message: `File ${entity['@id']}: missing encodingFormat`,
      });
    }
    if (!entity.sha256?.length) {
      errors.push({
        code: ElnErrorCode.MISSING_FILE_FIELD,
        message: `File ${entity['@id']}: missing sha256`,
      });
    }

    if (!entity.contentSize?.length) {
      errors.push({
        code: ElnErrorCode.MISSING_FILE_FIELD,
        message: `File ${entity['@id']}: missing contentSize`,
      });
      continue;
    }
    const contentSize = entity.contentSize[0];
    if (!isValidContentSize(contentSize)) {
      errors.push({
        code: ElnErrorCode.INVALID_CONTENT_SIZE,
        message: `File ${entity['@id']}: invalid contentSize "${contentSize}"`,
      });
    }
  }
  return errors;
}

function isValidContentSize(value: string | number): boolean {
  if (value === '') return false;
  const num = Number(value);
  return Number.isInteger(num) && num >= 0;
}

function validateSdPublisher(crate: ROCrate): ElnError[] {
  const sdPublisher = crate.descriptor.sdPublisher;
  if (!sdPublisher?.length) {
    return [
      {
        code: ElnErrorCode.MISSING_ELN_FIELD,
        message: 'Missing sdPublisher',
      },
    ];
  }

  const id = sdPublisher[0]?.['@id'];
  const publisher = crate.getEntity(id);
  if (!publisher) {
    return [
      {
        code: ElnErrorCode.INVALID_PUBLISHER,
        message: `sdPublisher: entity ${id} not found`,
      },
    ];
  }

  const errors: ElnError[] = [];
  const types = publisher['@type'] as string[];
  if (!types.includes('Organization')) {
    errors.push({
      code: ElnErrorCode.INVALID_PUBLISHER,
      message: `sdPublisher ${id}: must be an Organization`,
    });
  }
  if (!publisher.name?.length) {
    errors.push({
      code: ElnErrorCode.INVALID_PUBLISHER,
      message: `sdPublisher ${id}: missing name`,
    });
  }
  if (!publisher.url?.length) {
    errors.push({
      code: ElnErrorCode.INVALID_PUBLISHER,
      message: `sdPublisher ${id}: missing url`,
    });
  }
  return errors;
}

function validateDatasets(crate: ROCrate): ElnError[] {
  const errors: ElnError[] = [];
  for (const entity of crate.entities()) {
    const types = entity['@type'] as string[];
    if (!types.includes('Dataset')) continue;

    if (!entity.name?.length) {
      errors.push({
        code: ElnErrorCode.MISSING_DATASET_FIELD,
        message: `Dataset ${entity['@id']}: missing name`,
      });
    }
    if (!entity.author?.length) {
      errors.push({
        code: ElnErrorCode.MISSING_DATASET_FIELD,
        message: `Dataset ${entity['@id']}: missing author`,
      });
    }
  }
  return errors;
}
