import {expect} from '@loopback/testlab';
import {
  ElnErrorCode,
  ElnParseFailure,
  ElnArchive,
  validateEln,
  validateIntegrity,
  validateMetadata,
} from '../../services/eln-archive';
import {validElnCrate, validElnEntries} from '../eln.helpers';

describe('validateMetadata', () => {
  it('accepts a minimal valid metadata object', () => {
    expect(validateMetadata(validElnCrate())).to.be.empty();
  });

  it('rejects when sdPublisher is not a supported publisher', () => {
    const crate = validElnCrate();
    crate.setProperty('ro-crate-metadata.json', 'sdPublisher', {
      '@id': 'https://example.org/unknown-eln',
    });
    expect(validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_PUBLISHER},
    ]);
  });

  it('rejects when sdPublisher is missing', () => {
    const crate = validElnCrate();
    crate.deleteProperty('ro-crate-metadata.json', 'sdPublisher');
    expect(validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.MISSING_ELN_FIELD},
    ]);
  });

  it('rejects when sdPublisher entity is not found in crate', () => {
    const crate = validElnCrate();
    const id = 'https://github.com/paulscherrerinstitute/scilog';
    crate.deleteEntity(id);
    expect(validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_PUBLISHER},
    ]);
  });

  it('rejects when sdPublisher entity is not an Organization', () => {
    const crate = validElnCrate();
    const id = 'https://github.com/paulscherrerinstitute/scilog';
    crate.setProperty(id, '@type', 'Person');
    expect(validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_PUBLISHER},
    ]);
  });

  it('rejects when sdPublisher entity is missing name', () => {
    const crate = validElnCrate();
    const id = 'https://github.com/paulscherrerinstitute/scilog';
    crate.deleteProperty(id, 'name');
    expect(validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_PUBLISHER},
    ]);
  });

  it('rejects when sdPublisher entity is missing url', () => {
    const crate = validElnCrate();
    const id = 'https://github.com/paulscherrerinstitute/scilog';
    crate.deleteProperty(id, 'url');
    expect(validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_PUBLISHER},
    ]);
  });

  it('rejects when conformsTo is missing from descriptor', () => {
    const crate = validElnCrate();
    crate.deleteProperty('ro-crate-metadata.json', 'conformsTo');
    expect(validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.MISSING_ELN_FIELD},
    ]);
  });

  it('rejects when conformsTo is below RO-Crate 1.1', () => {
    const crate = validElnCrate();
    crate.setProperty('ro-crate-metadata.json', 'conformsTo', {
      '@id': 'https://w3id.org/ro/crate/1.0',
    });
    expect(validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_CONFORMS_TO},
    ]);
  });

  it('rejects when a File entity is missing name', () => {
    const crate = validElnCrate();
    crate.deleteProperty('./book/file.txt', 'name');
    expect(validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.MISSING_FILE_FIELD},
    ]);
  });

  it('rejects when a File entity is missing encodingFormat', () => {
    const crate = validElnCrate();
    crate.deleteProperty('./book/file.txt', 'encodingFormat');
    expect(validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.MISSING_FILE_FIELD},
    ]);
  });

  it('rejects when a File entity is missing sha256', () => {
    const crate = validElnCrate();
    crate.deleteProperty('./book/file.txt', 'sha256');
    expect(validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.MISSING_FILE_FIELD},
    ]);
  });

  it('rejects when a File entity is missing contentSize', () => {
    const crate = validElnCrate();
    crate.deleteProperty('./book/file.txt', 'contentSize');
    expect(validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.MISSING_FILE_FIELD},
    ]);
  });

  it('rejects when a Dataset entity is missing author', () => {
    const crate = validElnCrate();
    crate.deleteProperty('./book/', 'author');
    expect(validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.MISSING_DATASET_FIELD},
    ]);
  });

  it('rejects when a Dataset entity is missing name', () => {
    const crate = validElnCrate();
    crate.deleteProperty('./book/', 'name');
    expect(validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.MISSING_DATASET_FIELD},
    ]);
  });

  it('rejects when author entity is not found', () => {
    const crate = validElnCrate();
    crate.setProperty('./book/', 'author', {'@id': '#nonexistent'});
    expect(validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_AUTHOR},
    ]);
  });

  it('rejects when author entity is not a Person', () => {
    const crate = validElnCrate();
    crate.setProperty('#author', '@type', 'Organization');
    expect(validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_AUTHOR},
    ]);
  });

  it('rejects when author entity is missing email', () => {
    const crate = validElnCrate();
    crate.deleteProperty('#author', 'email');
    expect(validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_AUTHOR},
    ]);
  });

  it('rejects when hasPart references a non-existent entity', () => {
    const crate = validElnCrate();
    crate.addValues('./book/', 'hasPart', {'@id': './does-not-exist/'});
    expect(validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_HAS_PART},
    ]);
  });

  it('accepts numeric contentSize', () => {
    const crate = validElnCrate();
    crate.setProperty('./book/file.txt', 'contentSize', 123);
    expect(validateMetadata(crate)).to.be.empty();
  });

  it('rejects contentSize with unit suffixes', () => {
    const crate = validElnCrate();
    crate.setProperty('./book/file.txt', 'contentSize', '2.5MB');
    expect(validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_CONTENT_SIZE},
    ]);
  });

  it('rejects contentSize that is non-numeric', () => {
    const crate = validElnCrate();
    crate.setProperty('./book/file.txt', 'contentSize', 'abc');
    expect(validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_CONTENT_SIZE},
    ]);
  });

  it('rejects contentSize that is negative', () => {
    const crate = validElnCrate();
    crate.setProperty('./book/file.txt', 'contentSize', '-5');
    expect(validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_CONTENT_SIZE},
    ]);
  });

  it('rejects contentSize that is empty', () => {
    const crate = validElnCrate();
    crate.setProperty('./book/file.txt', 'contentSize', '');
    expect(validateMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_CONTENT_SIZE},
    ]);
  });
});

describe('ElnArchive.parse', () => {
  it('returns ok for valid entries', () => {
    const result = ElnArchive.parse(validElnEntries());
    expect(result.ok).to.be.true();
  });

  it('rejects when an entry has no folder prefix', () => {
    const entries = new Map([['ro-crate-metadata.json', Buffer.from('{}')]]);
    const result = ElnArchive.parse(entries);
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
    const result = ElnArchive.parse(entries);
    expect(result.ok).to.be.false();
    expect((result as ElnParseFailure).errors).to.containDeep([
      {code: ElnErrorCode.INVALID_ELN_STRUCTURE},
    ]);
  });

  it('rejects when ro-crate-metadata.json is missing', () => {
    const entries = new Map([['root/other.txt', Buffer.from('x')]]);
    const result = ElnArchive.parse(entries);
    expect(result.ok).to.be.false();
    expect((result as ElnParseFailure).errors).to.containDeep([
      {code: ElnErrorCode.MISSING_ELN_METADATA},
    ]);
  });

  it('rejects when metadata contains invalid JSON', () => {
    const entries = new Map([
      ['root/ro-crate-metadata.json', Buffer.from('not json')],
    ]);
    const result = ElnArchive.parse(entries);
    expect(result.ok).to.be.false();
    expect((result as ElnParseFailure).errors).to.containDeep([
      {code: ElnErrorCode.INVALID_ELN_METADATA},
    ]);
  });

  it('accepts nested files under the same root folder', () => {
    const result = ElnArchive.parse(validElnEntries());
    expect(result.ok).to.be.true();
  });

  it('resolves file IDs via getFile()', () => {
    const result = ElnArchive.parse(validElnEntries());
    expect(result.ok).to.be.true();
    const parsed = (result as {ok: true; value: ElnArchive}).value;
    const buf = parsed.getFile('./book/file.txt');
    expect(buf).to.not.be.undefined();
    expect(buf!.toString()).to.equal('hello');
  });

  it('returns undefined from getFile() for missing files', () => {
    const result = ElnArchive.parse(validElnEntries());
    expect(result.ok).to.be.true();
    const parsed = (result as {ok: true; value: ElnArchive}).value;
    expect(parsed.getFile('./nonexistent.txt')).to.be.undefined();
  });

  it('returns correct hasFile() results', () => {
    const result = ElnArchive.parse(validElnEntries());
    expect(result.ok).to.be.true();
    const parsed = (result as {ok: true; value: ElnArchive}).value;
    expect(parsed.hasFile('./book/file.txt')).to.be.true();
    expect(parsed.hasFile('./nonexistent.txt')).to.be.false();
  });
});

describe('validateIntegrity', () => {
  it('accepts when file bytes match the declared sha256', () => {
    const result = ElnArchive.parse(validElnEntries());
    expect(result.ok).to.be.true();
    const parsed = (result as {ok: true; value: ElnArchive}).value;
    expect(validateIntegrity(parsed)).to.be.empty();
  });

  it('rejects when a referenced file is missing from the archive', () => {
    const entries = validElnEntries();
    entries.delete('root/book/file.txt');
    const result = ElnArchive.parse(entries);
    expect(result.ok).to.be.true();
    const parsed = (result as {ok: true; value: ElnArchive}).value;
    expect(validateIntegrity(parsed)).to.containDeep([
      {code: ElnErrorCode.MISSING_ELN_FILE},
    ]);
  });

  it('rejects when file sha256 does not match', () => {
    const entries = validElnEntries();
    entries.set('root/book/file.txt', Buffer.from('wrong content'));
    const result = ElnArchive.parse(entries);
    expect(result.ok).to.be.true();
    const parsed = (result as {ok: true; value: ElnArchive}).value;
    expect(validateIntegrity(parsed)).to.containDeep([
      {code: ElnErrorCode.INVALID_ELN_CHECKSUM},
    ]);
  });
});

describe('validateEln', () => {
  it('returns ok for a fully valid ElnArchive', () => {
    const result = ElnArchive.parse(validElnEntries());
    expect(result.ok).to.be.true();
    const parsed = (result as {ok: true; value: ElnArchive}).value;
    const validated = validateEln(parsed);
    expect(validated.ok).to.be.true();
  });

  it('returns combined metadata and integrity errors', () => {
    const entries = validElnEntries();
    entries.delete('root/book/file.txt');
    const result = ElnArchive.parse(entries);
    expect(result.ok).to.be.true();
    const parsed = (result as {ok: true; value: ElnArchive}).value;
    // Mutate crate to also trigger a metadata error
    parsed.crate.deleteProperty('ro-crate-metadata.json', 'sdPublisher');
    const validated = validateEln(parsed);
    expect(validated.ok).to.be.false();
    if (!validated.ok) {
      const codes = validated.errors.map(e => e.code);
      expect(codes).to.containEql(ElnErrorCode.MISSING_ELN_FIELD);
      expect(codes).to.containEql(ElnErrorCode.MISSING_ELN_FILE);
    }
  });
});
