import {expect} from '@loopback/testlab';
import {validElnCrate} from '../eln.helpers';
import {ElnErrorCode, validateElnMetadata} from '../../services/eln-validator';

describe('eln-validator', () => {
  it('accepts a minimal valid metadata object', () => {
    expect(validateElnMetadata(validElnCrate())).to.be.empty();
  });

  it('rejects when sdPublisher is not a supported publisher', () => {
    const crate = validElnCrate();
    crate.setProperty('ro-crate-metadata.json', 'sdPublisher', {
      '@id': 'https://example.org/unknown-eln',
    });
    expect(validateElnMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_PUBLISHER},
    ]);
  });

  it('rejects when sdPublisher is missing', () => {
    const crate = validElnCrate();
    crate.deleteProperty('ro-crate-metadata.json', 'sdPublisher');
    expect(validateElnMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.MISSING_ELN_FIELD},
    ]);
  });

  it('rejects when sdPublisher entity is not found in crate', () => {
    const crate = validElnCrate();
    const id = 'https://github.com/paulscherrerinstitute/scilog';
    crate.deleteEntity(id);
    expect(validateElnMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_PUBLISHER},
    ]);
  });

  it('rejects when sdPublisher entity is not an Organization', () => {
    const crate = validElnCrate();
    const id = 'https://github.com/paulscherrerinstitute/scilog';
    crate.setProperty(id, '@type', 'Person');
    expect(validateElnMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_PUBLISHER},
    ]);
  });

  it('rejects when sdPublisher entity is missing name', () => {
    const crate = validElnCrate();
    const id = 'https://github.com/paulscherrerinstitute/scilog';
    crate.deleteProperty(id, 'name');
    expect(validateElnMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_PUBLISHER},
    ]);
  });

  it('rejects when sdPublisher entity is missing url', () => {
    const crate = validElnCrate();
    const id = 'https://github.com/paulscherrerinstitute/scilog';
    crate.deleteProperty(id, 'url');
    expect(validateElnMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_PUBLISHER},
    ]);
  });

  it('rejects when conformsTo is missing from descriptor', () => {
    const crate = validElnCrate();
    crate.deleteProperty('ro-crate-metadata.json', 'conformsTo');
    expect(validateElnMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.MISSING_ELN_FIELD},
    ]);
  });

  it('rejects when conformsTo is below RO-Crate 1.1', () => {
    const crate = validElnCrate();
    crate.setProperty('ro-crate-metadata.json', 'conformsTo', {
      '@id': 'https://w3id.org/ro/crate/1.0',
    });
    expect(validateElnMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_CONFORMS_TO},
    ]);
  });

  it('rejects when a File entity is missing name', () => {
    const crate = validElnCrate();
    crate.addEntity({
      '@id': './book/img.jpg',
      '@type': 'File',
      encodingFormat: 'image/jpeg',
      contentSize: '123',
      sha256: '0'.repeat(64),
    });
    crate.addValues('./book/', 'hasPart', {'@id': './book/img.jpg'});
    expect(validateElnMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.MISSING_FILE_FIELD},
    ]);
  });

  it('rejects when a File entity is missing encodingFormat', () => {
    const crate = validElnCrate();
    crate.addEntity({
      '@id': './book/img.jpg',
      '@type': 'File',
      name: 'img.jpg',
      contentSize: '123',
      sha256: '0'.repeat(64),
    });
    crate.addValues('./book/', 'hasPart', {'@id': './book/img.jpg'});
    expect(validateElnMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.MISSING_FILE_FIELD},
    ]);
  });

  it('rejects when a File entity is missing sha256', () => {
    const crate = validElnCrate();
    crate.addEntity({
      '@id': './book/img.jpg',
      '@type': 'File',
      name: 'img.jpg',
      encodingFormat: 'image/jpeg',
      contentSize: '123',
    });
    crate.addValues('./book/', 'hasPart', {'@id': './book/img.jpg'});
    expect(validateElnMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.MISSING_FILE_FIELD},
    ]);
  });

  it('rejects when a File entity is missing contentSize', () => {
    const crate = validElnCrate();
    crate.addEntity({
      '@id': './book/img.jpg',
      '@type': 'File',
      name: 'img.jpg',
      encodingFormat: 'image/jpeg',
      sha256: '0'.repeat(64),
    });
    crate.addValues('./book/', 'hasPart', {'@id': './book/img.jpg'});
    expect(validateElnMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.MISSING_FILE_FIELD},
    ]);
  });

  it('rejects when a Dataset entity is missing author', () => {
    const crate = validElnCrate();
    crate.deleteProperty('./book/', 'author');
    expect(validateElnMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.MISSING_DATASET_FIELD},
    ]);
  });

  it('rejects when a Dataset entity is missing name', () => {
    const crate = validElnCrate();
    crate.deleteProperty('./book/', 'name');
    expect(validateElnMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.MISSING_DATASET_FIELD},
    ]);
  });

  it('rejects when author entity is not found', () => {
    const crate = validElnCrate();
    crate.setProperty('./book/', 'author', {'@id': '#nonexistent'});
    expect(validateElnMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_AUTHOR},
    ]);
  });

  it('rejects when author entity is not a Person', () => {
    const crate = validElnCrate();
    crate.setProperty('#author', '@type', 'Organization');
    expect(validateElnMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_AUTHOR},
    ]);
  });

  it('rejects when author entity is missing email', () => {
    const crate = validElnCrate();
    crate.deleteProperty('#author', 'email');
    expect(validateElnMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_AUTHOR},
    ]);
  });

  it('rejects when hasPart references a non-existent entity', () => {
    const crate = validElnCrate();
    crate.addValues('./book/', 'hasPart', {'@id': './does-not-exist/'});
    expect(validateElnMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_HAS_PART},
    ]);
  });

  it('accepts numeric contentSize', () => {
    const crate = validElnCrate();
    crate.addEntity({
      '@id': './book/img.jpg',
      '@type': 'File',
      name: 'img.jpg',
      encodingFormat: 'image/jpeg',
      contentSize: 123,
      sha256: '0'.repeat(64),
    });
    crate.addValues('./book/', 'hasPart', {'@id': './book/img.jpg'});
    expect(validateElnMetadata(crate)).to.be.empty();
  });

  it('rejects contentSize with unit suffixes', () => {
    const crate = validElnCrate();
    crate.addEntity({
      '@id': './book/img.jpg',
      '@type': 'File',
      name: 'img.jpg',
      encodingFormat: 'image/jpeg',
      contentSize: '2.5MB',
    });
    crate.addValues('./book/', 'hasPart', {'@id': './book/img.jpg'});
    expect(validateElnMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_CONTENT_SIZE},
    ]);
  });

  it('rejects contentSize that is non-numeric', () => {
    const crate = validElnCrate();
    crate.addEntity({
      '@id': './book/img.jpg',
      '@type': 'File',
      name: 'img.jpg',
      encodingFormat: 'image/jpeg',
      contentSize: 'abc',
    });
    crate.addValues('./book/', 'hasPart', {'@id': './book/img.jpg'});
    expect(validateElnMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_CONTENT_SIZE},
    ]);
  });

  it('rejects contentSize that is negative', () => {
    const crate = validElnCrate();
    crate.addEntity({
      '@id': './book/img.jpg',
      '@type': 'File',
      name: 'img.jpg',
      encodingFormat: 'image/jpeg',
      contentSize: '-5',
    });
    crate.addValues('./book/', 'hasPart', {'@id': './book/img.jpg'});
    expect(validateElnMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_CONTENT_SIZE},
    ]);
  });

  it('rejects contentSize that is empty', () => {
    const crate = validElnCrate();
    crate.addEntity({
      '@id': './book/img.jpg',
      '@type': 'File',
      name: 'img.jpg',
      encodingFormat: 'image/jpeg',
      contentSize: '',
    });
    crate.addValues('./book/', 'hasPart', {'@id': './book/img.jpg'});
    expect(validateElnMetadata(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_CONTENT_SIZE},
    ]);
  });
});
