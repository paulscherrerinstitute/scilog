/**
 * Translator for openBIS-exported ELN archives: RO-Crate 1.1 with the openBIS
 * vocabulary — UPPERCASE entity types (BOOK/MESSAGE/COMMENT/PERSON) and dotted
 * `openBIS:has*` link/field names.
 */

import path from 'node:path';
import {JSDOM} from 'jsdom';
import _ from 'lodash';
import {Entity, ROCrate} from 'ro-crate';
import {LinkType} from '../../../models/paragraph.model';
import {ElnError, ElnErrorCode} from '../errors';
import {provenanceTags, sourceTag} from './provenance';
import type {
  FileDraft,
  LogbookDraft,
  ParagraphDraft,
  Translator,
} from './translator';

const SOURCE = 'openbis';

// openBIS namespaces every field (`openBIS:` prefix + dotted `has<TYPE>.<FIELD>`
// form, plus schema.org's `schema:hasPart`), so all are reached by bracket
// access under these keys.
const FIELD = {
  NAME: 'openBIS:hasNAME',
  EMAIL: 'openBIS:hasPERSON.EMAIL',
  BOOK_AUTHOR: 'openBIS:hasBOOK.AUTHOR',
  BOOK_CREATED: 'openBIS:hasBOOK.CREATED_AT',
  BOOK_MESSAGES: 'openBIS:hasBOOK.HASMESSAGE',
  MESSAGE_TEXT: 'openBIS:hasMESSAGE.TEXT',
  MESSAGE_AUTHOR: 'openBIS:hasMESSAGE.AUTHOR',
  MESSAGE_CREATED: 'openBIS:hasMESSAGE.CREATED_AT',
  MESSAGE_COMMENTS: 'openBIS:hasMESSAGE.HASCOMMENT',
  COMMENT_TEXT: 'openBIS:hasCOMMENT.TEXT',
  COMMENT_AUTHOR: 'openBIS:hasCOMMENT.AUTHOR',
  COMMENT_CREATED: 'openBIS:hasCOMMENT.CREATED_AT',
  FILES: 'schema:hasPart',
} as const;

export class OpenbisTranslator implements Translator {
  /**
   * openBIS crates declare the `openBIS` prefix in their `@context`; SciLog
   * crates don't, so this never collides with `ScilogTranslator` (which keys
   * off `sdPublisher`). The prefix's IRI varies between exports, so match on
   * its presence, not its value.
   */
  matches(crate: ROCrate): boolean {
    return crate.getContextDefinition('openBIS') !== undefined;
  }

  /**
   * Validate the crate's openBIS entities. RO-Crate's `@graph` is a flat,
   * type-tagged node list, so each entity type is scanned once — every entity
   * is validated a single time, and a shared author's email is checked once
   * (in `validatePerson`) rather than once per thing they authored.
   */
  validate(crate: ROCrate): ElnError[] {
    const books = entitiesOfType(crate, 'BOOK');
    if (books.length === 0) {
      return [{code: ElnErrorCode.MISSING_ELN_ENTITY, message: 'Missing BOOK'}];
    }
    if (books.length > 1) {
      return [
        {
          code: ElnErrorCode.INVALID_ELN_STRUCTURE,
          message: `Expected one BOOK, found ${books.length}`,
        },
      ];
    }
    return [
      ...books.flatMap(validateBook),
      ...entitiesOfType(crate, 'MESSAGE').flatMap(validateMessage),
      ...entitiesOfType(crate, 'COMMENT').flatMap(validateComment),
      ...entitiesOfType(crate, 'PERSON').flatMap(validatePerson),
    ];
  }

  /**
   * Translate the crate into a logbook draft: the BOOK becomes the logbook, its
   * messages become paragraphs, each message's comments nest under it as
   * `linkType=comment` paragraphs, and each message's files ride along. Link
   * mode has already resolved the `openBIS:has*` references to entities.
   */
  toSciLog(crate: ROCrate): LogbookDraft {
    const book = entitiesOfType(crate, 'BOOK')[0];
    // validate() rejects crates with no BOOK, so this should never happen.
    if (!book) throw new Error('OpenbisTranslator: no BOOK entity in crate');
    return buildLogbook(book);
  }
}

// --- per-entity validation: each returns the entity's errors. Link mode
// resolves child references, so none of these need the crate. Codes follow the
// failure-kind axis: MISSING_* for an absent entity/field, INVALID_* for one
// present but malformed. ---

function validateBook(book: Entity): ElnError[] {
  const requiredFields = [FIELD.NAME, FIELD.BOOK_AUTHOR, FIELD.BOOK_CREATED];
  return [
    ...missingFieldErrors(book, requiredFields),
    ...referenceErrors(book, FIELD.BOOK_MESSAGES),
    ...referenceErrors(book, FIELD.BOOK_AUTHOR),
  ];
}

function validateMessage(message: Entity): ElnError[] {
  const requiredFields = [FIELD.MESSAGE_AUTHOR, FIELD.MESSAGE_CREATED];
  return [
    ...missingFieldErrors(message, requiredFields),
    ...referenceErrors(message, FIELD.FILES),
    ...referenceErrors(message, FIELD.MESSAGE_COMMENTS),
    ...referenceErrors(message, FIELD.MESSAGE_AUTHOR),
  ];
}

function validateComment(comment: Entity): ElnError[] {
  const requiredFields = [FIELD.COMMENT_AUTHOR, FIELD.COMMENT_CREATED];
  return [
    ...missingFieldErrors(comment, requiredFields),
    ...referenceErrors(comment, FIELD.COMMENT_AUTHOR),
  ];
}

/** A PERSON is an author, so it must carry an email. */
function validatePerson(person: Entity): ElnError[] {
  return person[FIELD.EMAIL]?.length
    ? []
    : [
        {
          code: ElnErrorCode.INVALID_AUTHOR,
          message: `${person['@id']}: missing email`,
        },
      ];
}

function entitiesOfType(crate: ROCrate, type: string): Entity[] {
  return [...crate.entities()].filter(entity => entity.$$hasType(type));
}

/** One MISSING_DATASET_FIELD per absent required field. */
function missingFieldErrors(entity: Entity, fields: string[]): ElnError[] {
  return fields
    .filter(field => !entity[field]?.length)
    .map(field => ({
      code: ElnErrorCode.MISSING_DATASET_FIELD,
      message: `${entity['@id']}: missing ${field}`,
    }));
}

/**
 * Each reference under `field` must resolve to an entity in the graph. In link
 * mode a resolved child carries a `@type`; a dangling ref is a bare `{@id}`.
 */
function referenceErrors(entity: Entity, field: string): ElnError[] {
  const errors: ElnError[] = [];
  for (const ref of entity[field] ?? []) {
    if (ref['@type'] === undefined) {
      errors.push({
        code: ElnErrorCode.MISSING_ELN_ENTITY,
        message: `${entity['@id']}: ${field} ${ref['@id']} not found`,
      });
    }
  }
  return errors;
}

// --- translation: openBIS entity → canonical draft, following the same
// `openBIS:has*` links (resolved by link mode). Kept defensive — validate() is
// the gate, so this stays best-effort. ---

function buildLogbook(book: Entity): LogbookDraft {
  return {
    fields: {
      name: book[FIELD.NAME]?.[0],
      tags: [
        sourceTag(SOURCE),
        ...entityProvenance(book, FIELD.BOOK_AUTHOR, FIELD.BOOK_CREATED),
      ],
    },
    paragraphs: (book[FIELD.BOOK_MESSAGES] ?? []).map(buildMessage),
  };
}

function buildMessage(message: Entity): ParagraphDraft {
  return {
    fields: {
      linkType: LinkType.PARAGRAPH,
      textcontent: extractBody(message[FIELD.MESSAGE_TEXT]?.[0]),
      defaultOrder: defaultOrder(message[FIELD.MESSAGE_CREATED]?.[0]),
      tags: entityProvenance(
        message,
        FIELD.MESSAGE_AUTHOR,
        FIELD.MESSAGE_CREATED,
      ),
    },
    files: (message[FIELD.FILES] ?? []).map(buildFile),
    paragraphs: (message[FIELD.MESSAGE_COMMENTS] ?? []).map(buildComment),
  };
}

function buildComment(comment: Entity): ParagraphDraft {
  const text = comment[FIELD.COMMENT_TEXT]?.[0];
  return {
    fields: {
      linkType: LinkType.COMMENT,
      // openBIS comment text is plain; escape it so markup renders as text.
      textcontent: text !== undefined ? _.escape(text) : undefined,
      defaultOrder: defaultOrder(comment[FIELD.COMMENT_CREATED]?.[0]),
      tags: entityProvenance(
        comment,
        FIELD.COMMENT_AUTHOR,
        FIELD.COMMENT_CREATED,
      ),
    },
    files: [],
    paragraphs: [],
  };
}

function buildFile(file: Entity): FileDraft {
  // Keep the raw (percent-encoded) @id as elnId: it matches the file's inline
  // `src`/`href` for reference rewriting, and getFile decodes it to find bytes.
  const id = file['@id'];
  const name = path.basename(safeDecode(id));
  const ext = path.extname(name);
  return {
    elnId: id,
    fields: {
      name,
      filename: name,
      fileExtension: ext ? ext.slice(1) : undefined,
      tags: provenanceTags({id}),
    },
  };
}

/** Provenance tags for an entity; the author email comes from the linked PERSON. */
function entityProvenance(
  entity: Entity,
  authorField: string,
  createdField: string,
): string[] {
  const author = (entity[authorField] ?? [])[0];
  const created = entity[createdField]?.[0];
  return provenanceTags({
    id: entity['@id'],
    author: author?.[FIELD.EMAIL]?.[0],
    created: created ? new Date(created) : undefined,
  });
}

function defaultOrder(created: string | undefined): number | undefined {
  return created ? new Date(created).getTime() * 1000 : undefined;
}

/** The `<body>` inner html of a full-document message, or undefined. */
function extractBody(html: string | undefined): string | undefined {
  return html === undefined
    ? undefined
    : new JSDOM(html).window.document.body.innerHTML;
}

/** Percent-decode a URI reference, leaving a malformed value unchanged. */
function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
