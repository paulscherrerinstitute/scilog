import {ZipArchive} from 'archiver';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {finished} from 'node:stream/promises';
import {ROCrate} from 'ro-crate';

// Minimal RO-Crate 1.2 + ELN graph that passes validation.
export function validScilogCrate(): ROCrate {
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
          hasPart: [{'@id': './book/message/'}, {'@id': './book/comment/'}],
        },
        {
          '@id': './book/file.txt',
          '@type': 'File',
          name: 'file.txt',
          encodingFormat: 'text/plain',
          contentSize: '123',
          sha256: '0'.repeat(64),
        },
        {
          '@id': './book/message/',
          '@type': ['Message', 'Dataset'],
          name: 'message',
          text: '<p>hello</p>',
          dateCreated: '2026-01-19T00:00:00.000Z',
          keywords: 'atag,btag',
          encodingFormat: 'text/html',
          author: {'@id': '#author'},
          hasPart: [{'@id': './book/file.txt'}],
          comment: [{'@id': './book/comment/'}],
        },
        {
          '@id': './book/comment/',
          '@type': ['Comment', 'Dataset'],
          name: 'comment',
          text: '<p>a comment</p>',
          dateCreated: '2026-01-19T01:00:00.000Z',
          keywords: 'ctag',
          encodingFormat: 'text/html',
          parentItem: {'@id': './book/message/'},
          author: {'@id': '#author'},
        },
      ],
    },
    {array: true, link: true},
  );
}

// Minimal openBIS RO-Crate 1.1 graph: openBIS-namespaced @context, a BOOK with
// two messages (one carrying a comment and a file), authored by a person.
export function validOpenbisCrate(): ROCrate {
  return new ROCrate(
    {
      '@context': [
        'https://w3id.org/ro/crate/1.1/context',
        {openBIS: 'www.openbis.ch'},
      ],
      '@graph': [
        {
          '@id': 'ro-crate-metadata.json',
          '@type': 'CreativeWork',
          about: {'@id': './'},
          conformsTo: {'@id': 'https://w3id.org/ro/crate/1.1'},
        },
        {'@id': './', '@type': 'Dataset', name: 'name'},
        {
          '@id': '/DEMO/BOOK1',
          '@type': 'BOOK',
          'openBIS:hasNAME': 'Demo Logbook',
          'openBIS:hasBOOK.CREATED_AT': '2026-08-24T09:12:15Z',
          'openBIS:hasBOOK.AUTHOR': {'@id': '/PERSON1'},
          'openBIS:hasBOOK.HASMESSAGE': [
            {'@id': '/DEMO/MESSAGE1'},
            {'@id': '/DEMO/MESSAGE2'},
          ],
        },
        {
          '@id': '/PERSON1',
          '@type': 'PERSON',
          'openBIS:hasNAME': 'John Doe',
          'openBIS:hasPERSON.EMAIL': 'john.doe@example.org',
        },
        {
          '@id': '/DEMO/MESSAGE1',
          '@type': 'MESSAGE',
          'openBIS:hasMESSAGE.TEXT':
            '<html><head></head><body><p>hello</p>' +
            '<figure class="image"><img src="data/a%20b.png"></figure></body></html>',
          'openBIS:hasMESSAGE.CREATED_AT': '2026-08-24T09:18:42Z',
          'openBIS:hasMESSAGE.AUTHOR': {'@id': '/PERSON1'},
          'schema:hasPart': [{'@id': 'data/a%20b.png'}],
          'openBIS:hasMESSAGE.HASCOMMENT': {'@id': '/DEMO/COMMENT1'},
        },
        {
          '@id': '/DEMO/MESSAGE2',
          '@type': 'MESSAGE',
          'openBIS:hasMESSAGE.TEXT':
            '<html><head></head><body><p>second</p></body></html>',
          'openBIS:hasMESSAGE.CREATED_AT': '2026-08-24T09:19:38Z',
          'openBIS:hasMESSAGE.AUTHOR': {'@id': '/PERSON1'},
        },
        {
          '@id': '/DEMO/COMMENT1',
          '@type': 'COMMENT',
          'openBIS:hasCOMMENT.TEXT': 'a comment',
          'openBIS:hasCOMMENT.CREATED_AT': '2026-08-24T09:15:02Z',
          'openBIS:hasCOMMENT.AUTHOR': {'@id': '/PERSON1'},
        },
        {'@id': 'data/a%20b.png', '@type': 'File'},
      ],
    },
    {array: true, link: true},
  );
}

// Build a Map<string, Buffer> with valid metadata and matching file content,
// suitable for passing to ElnArchive.parseRaw().
export function validScilogEntries(
  crate: ROCrate = validScilogCrate(),
): Map<string, Buffer> {
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
  const archive = new ZipArchive();
  archive.on('error', err => output.destroy(err));
  archive.pipe(output);
  for (const [name, buf] of entries) {
    archive.append(buf, {name});
  }
  await archive.finalize();
  await finished(output);
  return filepath;
}
