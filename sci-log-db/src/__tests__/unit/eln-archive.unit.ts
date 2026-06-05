import {expect} from '@loopback/testlab';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  ElnErrorCode,
  ElnParseFailure,
  ElnArchive,
} from '../../services/eln-archive';
import {buildElnZip, validElnCrate, validElnEntries} from '../eln.helpers';

describe('ElnArchive.validateMetadata', () => {
  it('accepts a minimal valid metadata object', () => {
    expect(ElnArchive.validateMetadata(validElnCrate())).to.be.empty();
  });

  it('rejects when sdPublisher is not a supported publisher', () => {
    const crate = validElnCrate();
    crate.setProperty('ro-crate-metadata.json', 'sdPublisher', {
      '@id': 'https://example.org/unknown-eln',
    });
    expect(ElnArchive.validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_PUBLISHER},
    ]);
  });

  it('rejects when sdPublisher is missing', () => {
    const crate = validElnCrate();
    crate.deleteProperty('ro-crate-metadata.json', 'sdPublisher');
    expect(ElnArchive.validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.MISSING_ELN_FIELD},
    ]);
  });

  it('rejects when sdPublisher entity is not found in crate', () => {
    const crate = validElnCrate();
    const id = 'https://github.com/paulscherrerinstitute/scilog';
    crate.deleteEntity(id);
    expect(ElnArchive.validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_PUBLISHER},
    ]);
  });

  it('rejects when sdPublisher entity is not an Organization', () => {
    const crate = validElnCrate();
    const id = 'https://github.com/paulscherrerinstitute/scilog';
    crate.setProperty(id, '@type', 'Person');
    expect(ElnArchive.validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_PUBLISHER},
    ]);
  });

  it('rejects when sdPublisher entity is missing name', () => {
    const crate = validElnCrate();
    const id = 'https://github.com/paulscherrerinstitute/scilog';
    crate.deleteProperty(id, 'name');
    expect(ElnArchive.validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_PUBLISHER},
    ]);
  });

  it('rejects when sdPublisher entity is missing url', () => {
    const crate = validElnCrate();
    const id = 'https://github.com/paulscherrerinstitute/scilog';
    crate.deleteProperty(id, 'url');
    expect(ElnArchive.validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_PUBLISHER},
    ]);
  });

  it('rejects when conformsTo is missing from descriptor', () => {
    const crate = validElnCrate();
    crate.deleteProperty('ro-crate-metadata.json', 'conformsTo');
    expect(ElnArchive.validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.MISSING_ELN_FIELD},
    ]);
  });

  it('rejects when conformsTo is below RO-Crate 1.1', () => {
    const crate = validElnCrate();
    crate.setProperty('ro-crate-metadata.json', 'conformsTo', {
      '@id': 'https://w3id.org/ro/crate/1.0',
    });
    expect(ElnArchive.validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_CONFORMS_TO},
    ]);
  });

  it('rejects when a File entity is missing name', () => {
    const crate = validElnCrate();
    crate.deleteProperty('./book/file.txt', 'name');
    expect(ElnArchive.validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.MISSING_FILE_FIELD},
    ]);
  });

  it('rejects when a File entity is missing encodingFormat', () => {
    const crate = validElnCrate();
    crate.deleteProperty('./book/file.txt', 'encodingFormat');
    expect(ElnArchive.validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.MISSING_FILE_FIELD},
    ]);
  });

  it('rejects when a File entity is missing sha256', () => {
    const crate = validElnCrate();
    crate.deleteProperty('./book/file.txt', 'sha256');
    expect(ElnArchive.validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.MISSING_FILE_FIELD},
    ]);
  });

  it('rejects when a File entity is missing contentSize', () => {
    const crate = validElnCrate();
    crate.deleteProperty('./book/file.txt', 'contentSize');
    expect(ElnArchive.validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.MISSING_FILE_FIELD},
    ]);
  });

  it('rejects when a Dataset entity is missing author', () => {
    const crate = validElnCrate();
    crate.deleteProperty('./book/', 'author');
    expect(ElnArchive.validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.MISSING_DATASET_FIELD},
    ]);
  });

  it('rejects when a Dataset entity is missing name', () => {
    const crate = validElnCrate();
    crate.deleteProperty('./book/', 'name');
    expect(ElnArchive.validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.MISSING_DATASET_FIELD},
    ]);
  });

  it('rejects when author entity is not found', () => {
    const crate = validElnCrate();
    crate.setProperty('./book/', 'author', {'@id': '#nonexistent'});
    expect(ElnArchive.validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_AUTHOR},
    ]);
  });

  it('rejects when author entity is not a Person', () => {
    const crate = validElnCrate();
    crate.setProperty('#author', '@type', 'Organization');
    expect(ElnArchive.validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_AUTHOR},
    ]);
  });

  it('rejects when author entity is missing email', () => {
    const crate = validElnCrate();
    crate.deleteProperty('#author', 'email');
    expect(ElnArchive.validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_AUTHOR},
    ]);
  });

  it('rejects when hasPart references a non-existent entity', () => {
    const crate = validElnCrate();
    crate.addValues('./book/', 'hasPart', {'@id': './does-not-exist/'});
    expect(ElnArchive.validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_HAS_PART},
    ]);
  });

  it('accepts numeric contentSize', () => {
    const crate = validElnCrate();
    crate.setProperty('./book/file.txt', 'contentSize', 123);
    expect(ElnArchive.validateMetadata(crate)).to.be.empty();
  });

  it('rejects contentSize with unit suffixes', () => {
    const crate = validElnCrate();
    crate.setProperty('./book/file.txt', 'contentSize', '2.5MB');
    expect(ElnArchive.validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_CONTENT_SIZE},
    ]);
  });

  it('rejects contentSize that is non-numeric', () => {
    const crate = validElnCrate();
    crate.setProperty('./book/file.txt', 'contentSize', 'abc');
    expect(ElnArchive.validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_CONTENT_SIZE},
    ]);
  });

  it('rejects contentSize that is negative', () => {
    const crate = validElnCrate();
    crate.setProperty('./book/file.txt', 'contentSize', '-5');
    expect(ElnArchive.validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_CONTENT_SIZE},
    ]);
  });

  it('rejects contentSize that is empty', () => {
    const crate = validElnCrate();
    crate.setProperty('./book/file.txt', 'contentSize', '');
    expect(ElnArchive.validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_CONTENT_SIZE},
    ]);
  });
});

describe('ElnArchive.parseRaw', () => {
  it('returns ok for valid entries', () => {
    const result = ElnArchive.parseRaw(validElnEntries());
    expect(result.ok).to.be.true();
  });

  it('rejects when an entry has no folder prefix', () => {
    const entries = new Map([['ro-crate-metadata.json', Buffer.from('{}')]]);
    const result = ElnArchive.parseRaw(entries);
    expect(result.ok).to.be.false();
    expect((result as ElnParseFailure).errors).to.containDeep([
      {code: ElnErrorCode.INVALID_ELN_STRUCTURE},
    ]);
  });

  it('rejects when entries span multiple root folders', () => {
    const entries = new Map([
      ['folder-a/ro-crate-metadata.json', Buffer.from('{}')],
      ['folder-b/other.txt', Buffer.from('x')],
    ]);
    const result = ElnArchive.parseRaw(entries);
    expect(result.ok).to.be.false();
    expect((result as ElnParseFailure).errors).to.containDeep([
      {code: ElnErrorCode.INVALID_ELN_STRUCTURE},
    ]);
  });

  it('rejects when ro-crate-metadata.json is missing', () => {
    const entries = new Map([['root/other.txt', Buffer.from('x')]]);
    const result = ElnArchive.parseRaw(entries);
    expect(result.ok).to.be.false();
    expect((result as ElnParseFailure).errors).to.containDeep([
      {code: ElnErrorCode.MISSING_ELN_METADATA},
    ]);
  });

  it('rejects when metadata contains invalid JSON', () => {
    const entries = new Map([
      ['root/ro-crate-metadata.json', Buffer.from('not json')],
    ]);
    const result = ElnArchive.parseRaw(entries);
    expect(result.ok).to.be.false();
    expect((result as ElnParseFailure).errors).to.containDeep([
      {code: ElnErrorCode.INVALID_ELN_METADATA},
    ]);
  });

  it('accepts nested files under the same root folder', () => {
    const result = ElnArchive.parseRaw(validElnEntries());
    expect(result.ok).to.be.true();
  });

  it('resolves file IDs via getFile()', () => {
    const result = ElnArchive.parseRaw(validElnEntries());
    expect(result.ok).to.be.true();
    const elnArchive = (result as {ok: true; elnArchive: ElnArchive})
      .elnArchive;
    const buf = elnArchive.getFile('./book/file.txt');
    expect(buf).to.not.be.undefined();
    expect(buf!.toString()).to.equal('hello');
  });

  it('returns undefined from getFile() for missing files', () => {
    const result = ElnArchive.parseRaw(validElnEntries());
    expect(result.ok).to.be.true();
    const elnArchive = (result as {ok: true; elnArchive: ElnArchive})
      .elnArchive;
    expect(elnArchive.getFile('./nonexistent.txt')).to.be.undefined();
  });

  it('returns correct hasFile() results', () => {
    const result = ElnArchive.parseRaw(validElnEntries());
    expect(result.ok).to.be.true();
    const elnArchive = (result as {ok: true; elnArchive: ElnArchive})
      .elnArchive;
    expect(elnArchive.hasFile('./book/file.txt')).to.be.true();
    expect(elnArchive.hasFile('./nonexistent.txt')).to.be.false();
  });
});

describe('ElnArchive#validateIntegrity', () => {
  it('accepts when file bytes match the declared sha256', () => {
    const result = ElnArchive.parseRaw(validElnEntries());
    expect(result.ok).to.be.true();
    const elnArchive = (result as {ok: true; elnArchive: ElnArchive})
      .elnArchive;
    expect(elnArchive.validateIntegrity()).to.be.empty();
  });

  it('rejects when a referenced file is missing from the archive', () => {
    const entries = validElnEntries();
    entries.delete('root/book/file.txt');
    const result = ElnArchive.parseRaw(entries);
    expect(result.ok).to.be.true();
    const elnArchive = (result as {ok: true; elnArchive: ElnArchive})
      .elnArchive;
    expect(elnArchive.validateIntegrity()).to.containDeep([
      {code: ElnErrorCode.MISSING_ELN_FILE},
    ]);
  });

  it('rejects when file sha256 does not match', () => {
    const entries = validElnEntries();
    entries.set('root/book/file.txt', Buffer.from('wrong content'));
    const result = ElnArchive.parseRaw(entries);
    expect(result.ok).to.be.true();
    const elnArchive = (result as {ok: true; elnArchive: ElnArchive})
      .elnArchive;
    expect(elnArchive.validateIntegrity()).to.containDeep([
      {code: ElnErrorCode.INVALID_ELN_CHECKSUM},
    ]);
  });
});

describe('ElnArchive.parse', () => {
  const tmpFiles: string[] = [];

  afterEach(async () => {
    await Promise.all(tmpFiles.map(fp => fs.unlink(fp).catch(() => {})));
    tmpFiles.length = 0;
  });

  it('returns INVALID_ELN_ARCHIVE for non-zip bytes', async () => {
    const filepath = path.join(
      os.tmpdir(),
      `test-bad-${crypto.randomUUID()}.eln`,
    );
    await fs.writeFile(filepath, 'not a zip');
    tmpFiles.push(filepath);

    const result = await ElnArchive.parse(filepath);
    expect(result.ok).to.be.false();
    expect((result as ElnParseFailure).errors).to.containDeep([
      {code: ElnErrorCode.INVALID_ELN_ARCHIVE},
    ]);
  });

  it('returns INVALID_ELN_ARCHIVE when the file does not exist', async () => {
    const filepath = path.join(
      os.tmpdir(),
      `does-not-exist-${crypto.randomUUID()}.eln`,
    );

    const result = await ElnArchive.parse(filepath);
    expect(result.ok).to.be.false();
    expect((result as ElnParseFailure).errors).to.containDeep([
      {code: ElnErrorCode.INVALID_ELN_ARCHIVE},
    ]);
  });

  it('returns ok for a valid .eln archive', async () => {
    const filepath = await buildElnZip(validElnEntries());
    tmpFiles.push(filepath);

    const result = await ElnArchive.parse(filepath);
    expect(result.ok).to.be.true();
    const elnArchive = (result as {ok: true; elnArchive: ElnArchive})
      .elnArchive;
    expect(elnArchive.getFile('./book/file.txt')!.toString()).to.equal('hello');
  });

  it('surfaces parseRaw errors through the full pipeline', async () => {
    // Archive with content but no ro-crate-metadata.json → parseRaw fails
    const entries = new Map([['root/other.txt', Buffer.from('x')]]);
    const filepath = await buildElnZip(entries);
    tmpFiles.push(filepath);

    const result = await ElnArchive.parse(filepath);
    expect(result.ok).to.be.false();
    expect((result as ElnParseFailure).errors).to.containDeep([
      {code: ElnErrorCode.MISSING_ELN_METADATA},
    ]);
  });

  it('surfaces integrity errors through the full pipeline', async () => {
    const entries = validElnEntries();
    entries.delete('root/book/file.txt');
    const filepath = await buildElnZip(entries);
    tmpFiles.push(filepath);

    const result = await ElnArchive.parse(filepath);
    expect(result.ok).to.be.false();
    expect((result as ElnParseFailure).errors).to.containDeep([
      {code: ElnErrorCode.MISSING_ELN_FILE},
    ]);
  });
});
