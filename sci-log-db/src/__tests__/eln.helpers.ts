import archiver from 'archiver';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {finished} from 'node:stream/promises';
import {ROCrate} from 'ro-crate';

// Minimal RO-Crate 1.2 + ELN graph that passes validation.
export function validElnCrate(): ROCrate {
  return new ROCrate(
    {
      '@context': 'https://w3id.org/ro/crate/1.2/context',
      '@graph': [
        {
          '@id': 'ro-crate-metadata.json',
          '@type': 'CreativeWork',
          identifier: 'ro-crate-metadata.json',
          about: {
            '@id': './',
          },
          conformsTo: {
            '@id': 'https://w3id.org/ro/crate/1.2',
          },
          sdPublisher: {
            '@id': 'https://github.com/paulscherrerinstitute/scilog',
          },
        },
        {
          '@id': './',
          '@type': 'Dataset',
          name: 'crate',
          author: {'@id': '#author'},
          hasPart: [{'@id': './book/'}],
        },
        {
          '@id': 'https://github.com/paulscherrerinstitute/scilog',
          '@type': 'Organization',
          name: 'SciLog',
          url: 'https://github.com/paulscherrerinstitute/scilog',
        },
        {'@id': '#author', '@type': 'Person', email: 'a@example.org'},
        {
          '@id': './book/',
          '@type': ['Book', 'Dataset'],
          name: 'book',
          description: 'a book',
          dateCreated: '2026-01-19T00:00:00.000Z',
          author: {'@id': '#author'},
          hasPart: [{'@id': './book/file.txt'}],
        },
        {
          '@id': './book/file.txt',
          '@type': 'File',
          name: 'file.txt',
          encodingFormat: 'text/plain',
          contentSize: '123',
          sha256: '0'.repeat(64),
        },
      ],
    },
    {array: true},
  );
}

// Build a Map<string, Buffer> with valid metadata and matching file content,
// suitable for passing to ElnArchive.parseRaw().
export function validElnEntries(): Map<string, Buffer> {
  const crate = validElnCrate();
  const fileContent = Buffer.from('hello');
  const sha = crypto.createHash('sha256').update(fileContent).digest('hex');
  crate.setProperty('./book/file.txt', 'sha256', sha);
  crate.setProperty('./book/file.txt', 'contentSize', fileContent.length);

  return new Map([
    [
      'root/ro-crate-metadata.json',
      Buffer.from(JSON.stringify(crate.toJSON())),
    ],
    ['root/book/file.txt', fileContent],
  ]);
}

// Write entries to a zip file on disk and return its path. Used to exercise
// ElnArchive.parse(filepath) end-to-end.
export async function buildElnZip(
  entries: Map<string, Buffer>,
): Promise<string> {
  const filepath = path.join(
    os.tmpdir(),
    `test-eln-${crypto.randomUUID()}.eln`,
  );
  const output = fs.createWriteStream(filepath);
  const archive = archiver('zip');
  archive.on('error', err => output.destroy(err));
  archive.pipe(output);
  for (const [name, buf] of entries) {
    archive.append(buf, {name});
  }
  await archive.finalize();
  await finished(output);
  return filepath;
}
