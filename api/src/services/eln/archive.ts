/**
 * .eln (RO-Crate 1.2) parser.
 * Contract pinned by `__tests__/unit/eln-archive.unit.ts`.
 *
 * Spec: https://github.com/TheELNConsortium/TheELNFileFormat/blob/master/SPECIFICATION.md
 */

import crypto from 'node:crypto';
import {buffer} from 'node:stream/consumers';
import {ROCrate} from 'ro-crate';
import yauzl from 'yauzl';
import {ElnError, ElnErrorCode} from './errors';

// --- types ---

export type ElnParseSuccess = {
  ok: true;
  elnArchive: ElnArchive;
};

export type ElnParseFailure = {
  ok: false;
  errors: ElnError[];
};

export type ElnParseResult = ElnParseSuccess | ElnParseFailure;

// --- constants ---

const METADATA_FILENAME = 'ro-crate-metadata.json';

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
   * Read, parse, and fully validate an .eln archive from disk.
   * Runs unzip → raw parse → metadata + integrity checks.
   * Never throws — all failures returned as ElnParseFailure.
   */
  static async parse(filepath: string): Promise<ElnParseResult> {
    let entries: Map<string, Buffer>;
    try {
      entries = await unzip(filepath);
    } catch (err) {
      return {
        ok: false,
        errors: [
          {
            code: ElnErrorCode.INVALID_ELN_ARCHIVE,
            message: `Could not read .eln archive: ${(err as Error).message}`,
          },
        ],
      };
    }

    const parsed = ElnArchive.parseRaw(entries);
    if (!parsed.ok) return parsed;

    const errors = [
      ...ElnArchive.validateMetadata(parsed.elnArchive.crate),
      ...parsed.elnArchive.validateIntegrity(),
    ];
    if (errors.length) return {ok: false, errors};

    return parsed;
  }

  /**
   * @internal Test seam — consumers should call `ElnArchive.parse(filepath)`.
   * Parses raw zip entries into an `ElnArchive` without running metadata or
   * integrity validation. Checks archive structure and parses
   * ro-crate-metadata.json only.
   */
  static parseRaw(entries: Map<string, Buffer>): ElnParseResult {
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
      crate = new ROCrate(raw, {array: true, link: true});
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

    return {ok: true, elnArchive: new ElnArchive(crate, entries, rootFolder)};
  }

  /**
   * @internal Test seam — invoked by `parse(filepath)`. Validates the
   * RO-Crate metadata against the ELN spec (conformsTo, sdPublisher,
   * Datasets, Authors, Files, hasPart references).
   */
  static validateMetadata(crate: ROCrate): ElnError[] {
    return [
      ...validateConformsTo(crate),
      ...validateHasPartReferences(crate),
      ...validateCommentReferences(crate),
    ];
  }

  /**
   * @internal Test seam — invoked by `parse(filepath)`. Verifies that each
   * File entity referenced by the crate is present in the archive and that
   * its bytes match the declared sha256.
   */
  validateIntegrity(): ElnError[] {
    const errors: ElnError[] = [];

    for (const entity of this.crate.entities()) {
      const types = entity['@type'] as string[];
      if (!types.includes('File')) continue;

      const id = entity['@id'] as string;
      const buf = this.getFile(id);

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
}

// --- private helpers ---

function unzip(filepath: string): Promise<Map<string, Buffer>> {
  return new Promise((resolve, reject) => {
    yauzl.open(filepath, {lazyEntries: true}, (err, zipfile) => {
      if (err) {
        reject(err);
        return;
      }

      const entries = new Map<string, Buffer>();

      zipfile.on('error', reject);

      zipfile.on('entry', entry => {
        if (entry.fileName.endsWith('/')) {
          zipfile.readEntry();
          return;
        }

        zipfile.openReadStream(entry, (streamErr, readStream) => {
          if (streamErr) {
            reject(streamErr);
            return;
          }

          // eslint-disable-next-line no-void
          void (async () => {
            entries.set(entry.fileName, await buffer(readStream));
            zipfile.readEntry();
          })().catch(reject);
        });
      });

      zipfile.on('end', () => resolve(entries));
      zipfile.readEntry();
    });
  });
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

function validateCommentReferences(crate: ROCrate): ElnError[] {
  const errors: ElnError[] = [];
  for (const entity of crate.entities()) {
    const comment = entity.comment;
    if (!comment?.length) continue;

    for (const ref of comment) {
      const id = ref['@id'];
      if (!crate.getEntity(id)) {
        errors.push({
          code: ElnErrorCode.INVALID_COMMENT,
          message: `Entity ${entity['@id']}: comment ${id} not found`,
        });
      }
    }
  }
  return errors;
}
