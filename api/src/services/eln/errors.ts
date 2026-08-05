/**
 * The ELN import error vocabulary, shared by the container parser
 * (`./archive`), the translators, and the import orchestration
 * (`./import.service`).
 */

export const ElnErrorCode = {
  MISSING_ELN_FIELD: 'MISSING_ELN_FIELD',
  INVALID_CONFORMS_TO: 'INVALID_CONFORMS_TO',
  INVALID_PUBLISHER: 'INVALID_PUBLISHER',
  MISSING_FILE_FIELD: 'MISSING_FILE_FIELD',
  MISSING_DATASET_FIELD: 'MISSING_DATASET_FIELD',
  INVALID_AUTHOR: 'INVALID_AUTHOR',
  INVALID_HAS_PART: 'INVALID_HAS_PART',
  INVALID_COMMENT: 'INVALID_COMMENT',
  INVALID_CONTENT_SIZE: 'INVALID_CONTENT_SIZE',
  INVALID_ELN_ARCHIVE: 'INVALID_ELN_ARCHIVE',
  INVALID_ELN_STRUCTURE: 'INVALID_ELN_STRUCTURE',
  MISSING_ELN_METADATA: 'MISSING_ELN_METADATA',
  INVALID_ELN_METADATA: 'INVALID_ELN_METADATA',
  MISSING_ELN_FILE: 'MISSING_ELN_FILE',
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
