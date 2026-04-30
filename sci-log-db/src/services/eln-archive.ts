/**
 * .eln (RO-Crate 1.2) parser.
 * Contract pinned by `__tests__/unit/eln-archive.unit.ts`.
 *
 * Spec: https://github.com/TheELNConsortium/TheELNFileFormat/blob/master/SPECIFICATION.md
 */

import crypto from 'node:crypto';
import {ROCrate} from 'ro-crate';

// --- types ---

export const ElnErrorCode = {
  MISSING_ELN_FIELD: 'MISSING_ELN_FIELD',
  INVALID_CONFORMS_TO: 'INVALID_CONFORMS_TO',
  INVALID_PUBLISHER: 'INVALID_PUBLISHER',
  MISSING_FILE_FIELD: 'MISSING_FILE_FIELD',
  MISSING_DATASET_FIELD: 'MISSING_DATASET_FIELD',
  INVALID_AUTHOR: 'INVALID_AUTHOR',
  INVALID_HAS_PART: 'INVALID_HAS_PART',
  INVALID_CONTENT_SIZE: 'INVALID_CONTENT_SIZE',
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

export type ElnParseSuccess = {
  ok: true;
  value: ElnArchive;
};

export type ElnParseFailure = {
  ok: false;
  errors: ElnError[];
};

export type ElnParseResult = ElnParseSuccess | ElnParseFailure;

export type ElnValidationSuccess = {
  ok: true;
};

export type ElnValidationFailure = {
  ok: false;
  errors: ElnError[];
};

export type ElnValidationResult = ElnValidationSuccess | ElnValidationFailure;

// --- constants ---

const METADATA_FILENAME = 'ro-crate-metadata.json';

const SUPPORTED_PUBLISHERS = [
  'https://github.com/paulscherrerinstitute/scilog',
];

const SUPPORTED_RO_CRATE_VERSIONS = [
  'https://w3id.org/ro/crate/1.1',
  'https://w3id.org/ro/crate/1.2',
];

// --- parsing ---

export class ElnArchive {
  private constructor(
    readonly crate: ROCrate,
    private readonly entries: Map<string, Buffer>,
    private readonly rootFolder: string,
  ) {}

  /** Look up a file by its RO-Crate @id (e.g. "./book/file.txt"). */
  getFile(fileId: string): Buffer | undefined {
    const path = this.rootFolder + fileId.replace(/^\.\//, '');
    return this.entries.get(path);
  }

  hasFile(fileId: string): boolean {
    return this.getFile(fileId) !== undefined;
  }

  /**
   * Parse raw zip entries into a ElnArchive.
   * Validates archive structure and parses ro-crate-metadata.json.
   * Never throws — all failures returned as ElnParseFailure.
   */
  static parse(entries: Map<string, Buffer>): ElnParseResult {
    const prefixes = new Set<string>();
    for (const name of entries.keys()) {
      const slash = name.indexOf('/');
      if (slash === -1) {
        return {
          ok: false,
          errors: [
            {
              code: ElnErrorCode.INVALID_ELN_STRUCTURE,
              message: 'Archive must contain a single root folder',
            },
          ],
        };
      }
      prefixes.add(name.slice(0, slash + 1));
    }
    if (prefixes.size !== 1) {
      return {
        ok: false,
        errors: [
          {
            code: ElnErrorCode.INVALID_ELN_STRUCTURE,
            message: 'Archive must contain a single root folder',
          },
        ],
      };
    }

    const rootFolder = [...prefixes][0];

    const metadataPath = `${rootFolder}${METADATA_FILENAME}`;
    if (!entries.has(metadataPath)) {
      return {
        ok: false,
        errors: [
          {
            code: ElnErrorCode.MISSING_ELN_METADATA,
            message: `Missing ${METADATA_FILENAME} in archive root folder`,
          },
        ],
      };
    }

    let crate: ROCrate;
    try {
      const raw = JSON.parse(entries.get(metadataPath)!.toString());
      crate = new ROCrate(raw, {array: true});
    } catch {
      return {
        ok: false,
        errors: [
          {
            code: ElnErrorCode.INVALID_ELN_METADATA,
            message: `${METADATA_FILENAME} contains invalid JSON`,
          },
        ],
      };
    }

    return {ok: true, value: new ElnArchive(crate, entries, rootFolder)};
  }
}

// --- validation ---

export function validateEln(parsed: ElnArchive): ElnValidationResult {
  const errors = [
    ...validateMetadata(parsed.crate),
    ...validateIntegrity(parsed),
  ];
  return errors.length ? {ok: false, errors} : {ok: true};
}

export function validateIntegrity(parsed: ElnArchive): ElnError[] {
  const errors: ElnError[] = [];

  for (const entity of parsed.crate.entities()) {
    const types = entity['@type'] as string[];
    if (!types.includes('File')) continue;

    const id = entity['@id'] as string;
    const buf = parsed.getFile(id);

    if (!buf) {
      errors.push({
        code: ElnErrorCode.MISSING_ELN_FILE,
        message: `File ${id} not found in archive`,
      });
      continue;
    }

    const expected = entity.sha256?.[0] as string | undefined;
    if (expected) {
      const actual = crypto.createHash('sha256').update(buf).digest('hex');
      if (actual !== expected) {
        errors.push({
          code: ElnErrorCode.INVALID_ELN_CHECKSUM,
          message: `File ${id}: expected sha256 ${expected}, got ${actual}`,
        });
      }
    }
  }

  return errors;
}

export function validateMetadata(crate: ROCrate): ElnError[] {
  return [
    ...validateConformsTo(crate),
    ...validateSdPublisher(crate),
    ...validateDatasets(crate),
    ...validateAuthors(crate),
    ...validateFiles(crate),
    ...validateHasPartReferences(crate),
  ];
}

function validateConformsTo(crate: ROCrate): ElnError[] {
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

function validateHasPartReferences(crate: ROCrate): ElnError[] {
  const errors: ElnError[] = [];
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
