/**
 * The ELN import error vocabulary, shared by the container parser
 * (`./archive`), the translators, and the import orchestration
 * (`./import.service`).
 */

export const ElnErrorCode = {
  /** A required field on the RO-Crate metadata descriptor is absent. */
  MISSING_ELN_FIELD: 'MISSING_ELN_FIELD',
  /** A required entity is absent from the crate graph. */
  MISSING_ELN_ENTITY: 'MISSING_ELN_ENTITY',
  /** conformsTo names an unsupported RO-Crate version. */
  INVALID_CONFORMS_TO: 'INVALID_CONFORMS_TO',
  /** No translator matches the crate, or its publisher is malformed. */
  INVALID_PUBLISHER: 'INVALID_PUBLISHER',
  /** A File entity is missing a required field. */
  MISSING_FILE_FIELD: 'MISSING_FILE_FIELD',
  /** A Dataset entity is missing a required field. */
  MISSING_DATASET_FIELD: 'MISSING_DATASET_FIELD',
  /** An author reference points to a missing or invalid Person. */
  INVALID_AUTHOR: 'INVALID_AUTHOR',
  /** A hasPart reference points to an entity not in the crate. */
  INVALID_HAS_PART: 'INVALID_HAS_PART',
  /** A comment reference points to an entity not in the crate. */
  INVALID_COMMENT: 'INVALID_COMMENT',
  /** A File entity's contentSize is not a non-negative integer. */
  INVALID_CONTENT_SIZE: 'INVALID_CONTENT_SIZE',
  /** The upload could not be read as an archive. */
  INVALID_ELN_ARCHIVE: 'INVALID_ELN_ARCHIVE',
  /** The archive's structure is invalid. */
  INVALID_ELN_STRUCTURE: 'INVALID_ELN_STRUCTURE',
  /** ro-crate-metadata.json is absent from the archive. */
  MISSING_ELN_METADATA: 'MISSING_ELN_METADATA',
  /** ro-crate-metadata.json could not be parsed. */
  INVALID_ELN_METADATA: 'INVALID_ELN_METADATA',
  /** A referenced File's bytes are absent from the archive. */
  MISSING_ELN_FILE: 'MISSING_ELN_FILE',
  /** A File's bytes do not match its declared checksum. */
  INVALID_ELN_CHECKSUM: 'INVALID_ELN_CHECKSUM',
} as const;

export type ElnErrorCode = (typeof ElnErrorCode)[keyof typeof ElnErrorCode];

export type ElnError = {
  code: ElnErrorCode;
  message: string;
};

/** Thrown to signal a failed import, carrying the validation errors. */
export class ElnImportError extends Error {
  constructor(readonly errors: ElnError[]) {
    super(`ELN import failed with ${errors.length} error(s)`);
    this.name = 'ElnImportError';
  }
}
