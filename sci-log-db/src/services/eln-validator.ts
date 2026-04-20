/**
 * .eln (RO-Crate 1.1+) metadata validator.
 * Contract pinned by `__tests__/unit/eln-validator.unit.ts`.
 *
 * Spec: https://github.com/TheELNConsortium/TheELNFileFormat/blob/master/SPECIFICATION.md
 */

import {ROCrate} from 'ro-crate';

/**
 * Error codes emitted by the .eln validator.
 * One entry per distinct MUST/SHOULD clause we enforce; see the
 * spec link above for the prose behind each code.
 */
export const ElnErrorCode = {
  MISSING_ELN_FIELD: 'MISSING_ELN_FIELD',
  INVALID_CONFORMS_TO: 'INVALID_CONFORMS_TO',
  INVALID_PUBLISHER: 'INVALID_PUBLISHER',
  MISSING_FILE_FIELD: 'MISSING_FILE_FIELD',
  MISSING_DATASET_FIELD: 'MISSING_DATASET_FIELD',
  INVALID_AUTHOR: 'INVALID_AUTHOR',
  INVALID_HAS_PART: 'INVALID_HAS_PART',
  INVALID_CONTENT_SIZE: 'INVALID_CONTENT_SIZE',
} as const;

export type ElnErrorCode = (typeof ElnErrorCode)[keyof typeof ElnErrorCode];

export interface ElnValidationError {
  code: ElnErrorCode;
  message: string;
}

const SUPPORTED_PUBLISHERS = [
  'https://github.com/paulscherrerinstitute/scilog',
];

const SUPPORTED_RO_CRATE_VERSIONS = [
  'https://w3id.org/ro/crate/1.1',
  'https://w3id.org/ro/crate/1.2',
];

export function validateElnMetadata(crate: ROCrate): ElnValidationError[] {
  return [
    ...validateConformsTo(crate),
    ...validateSdPublisher(crate),
    ...validateDatasets(crate),
    ...validateAuthors(crate),
    ...validateFiles(crate),
    ...validateHasPartReferences(crate),
  ];
}

function validateConformsTo(crate: ROCrate): ElnValidationError[] {
  const conformsTo = crate.descriptor.conformsTo;
  if (!conformsTo?.length) {
    return [
      {
        code: ElnErrorCode.MISSING_ELN_FIELD,
        message: 'Missing conformsTo',
      },
    ];
  }

  const id = conformsTo[0]?.['@id'];
  if (!SUPPORTED_RO_CRATE_VERSIONS.includes(id)) {
    return [
      {
        code: ElnErrorCode.INVALID_CONFORMS_TO,
        message: `Unsupported conformsTo: ${id}`,
      },
    ];
  }
  return [];
}

function validateSdPublisher(crate: ROCrate): ElnValidationError[] {
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
  if (!SUPPORTED_PUBLISHERS.includes(id)) {
    return [
      {
        code: ElnErrorCode.INVALID_PUBLISHER,
        message: `Unsupported sdPublisher: ${id}`,
      },
    ];
  }

  const publisher = crate.getEntity(id);
  if (!publisher) {
    return [
      {
        code: ElnErrorCode.INVALID_PUBLISHER,
        message: `sdPublisher: entity ${id} not found`,
      },
    ];
  }

  const errors: ElnValidationError[] = [];
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

function validateDatasets(crate: ROCrate): ElnValidationError[] {
  const errors: ElnValidationError[] = [];
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

function validateAuthors(crate: ROCrate): ElnValidationError[] {
  const errors: ElnValidationError[] = [];
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

function validateFiles(crate: ROCrate): ElnValidationError[] {
  const errors: ElnValidationError[] = [];
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

function validateHasPartReferences(crate: ROCrate): ElnValidationError[] {
  const errors: ElnValidationError[] = [];
  for (const entity of crate.entities()) {
    const hasPart = entity.hasPart;
    if (!hasPart?.length) continue;

    for (const ref of hasPart) {
      const id = ref['@id'];
      if (!crate.getEntity(id)) {
        errors.push({
          code: ElnErrorCode.INVALID_HAS_PART,
          message: `Entity ${entity['@id']}: hasPart ${id} not found`,
        });
      }
    }
  }
  return errors;
}
