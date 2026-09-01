import {expect} from '@loopback/testlab';
import {LinkType} from '../../../../models/paragraph.model';
import {ElnErrorCode} from '../../../../services/eln/errors';
import {ScilogTranslator} from '../../../../services/eln/translators/scilog';
import {validScilogCrate} from '../../../eln.helpers';

const translator = new ScilogTranslator();

describe('ScilogTranslator.toSciLog', () => {
  it('assembles the tree: one paragraph with its file and nested comment', () => {
    const draft = translator.toSciLog(validScilogCrate());
    expect(draft.paragraphs).to.have.length(1);

    const [message] = draft.paragraphs;
    expect(message.fields.linkType).to.equal(LinkType.PARAGRAPH);
    expect(message.files.map(file => file.elnId)).to.deepEqual([
      './book/file.txt',
    ]);

    expect(message.paragraphs).to.have.length(1);
    const [comment] = message.paragraphs;
    expect(comment.fields.linkType).to.equal(LinkType.COMMENT);
    expect(comment.files).to.be.empty();
    expect(comment.paragraphs).to.be.empty();
  });

  describe('logbook', () => {
    it('extracts fields and provenance tags from the Book entity', () => {
      expect(translator.toSciLog(validScilogCrate()).fields).to.deepEqual({
        name: 'book',
        description: 'a book',
        tags: [
          'eln:source:scilog',
          'eln:id:./book/',
          'eln:author:a@example.org',
          'eln:created:2026-01-19',
        ],
      });
    });

    it('omits optional fields and conditional tags when missing', () => {
      const crate = validScilogCrate();
      crate.deleteProperty('./book/', 'description');
      crate.deleteProperty('./book/', 'dateCreated');
      crate.deleteProperty('./book/', 'author');
      expect(translator.toSciLog(crate).fields).to.deepEqual({
        name: 'book',
        description: undefined,
        tags: ['eln:source:scilog', 'eln:id:./book/'],
      });
    });
  });

  describe('paragraphs', () => {
    it('maps Message entity fields, with linkType=paragraph and split keyword tags', () => {
      const [message] = translator.toSciLog(validScilogCrate()).paragraphs;
      expect(message.fields).to.deepEqual({
        linkType: LinkType.PARAGRAPH,
        textcontent: '<p>hello</p>',
        tags: [
          'eln:id:./book/message/',
          'eln:author:a@example.org',
          'eln:created:2026-01-19',
          'atag',
          'btag',
        ],
        defaultOrder: new Date('2026-01-19T00:00:00.000Z').getTime() * 1000,
      });
    });
  });

  describe('files', () => {
    it('embeds File entity fields on the paragraph that references them', () => {
      const [message] = translator.toSciLog(validScilogCrate()).paragraphs;
      expect(message.files).to.deepEqual([
        {
          elnId: './book/file.txt',
          fields: {
            name: 'file.txt',
            filename: 'file.txt',
            contentType: 'text/plain',
            contentSize: 123,
            contentSha256: '0'.repeat(64),
            fileExtension: 'txt',
            tags: ['eln:id:./book/file.txt'],
          },
        },
      ]);
    });

    it('leaves fileExtension undefined when the name has no extension', () => {
      const crate = validScilogCrate();
      crate.setProperty('./book/file.txt', 'name', 'README');
      const [message] = translator.toSciLog(crate).paragraphs;
      expect(message.files[0].fields.fileExtension).to.be.undefined();
    });

    it('embeds files on a comment, not only on a paragraph', () => {
      const crate = validScilogCrate();
      crate.addEntity({
        '@id': './book/comment/img.png',
        '@type': 'File',
        name: 'img.png',
        encodingFormat: 'image/png',
        contentSize: '10',
        sha256: '0'.repeat(64),
      });
      crate.addValues('./book/comment/', 'hasPart', {
        '@id': './book/comment/img.png',
      });
      const [message] = translator.toSciLog(crate).paragraphs;
      const [comment] = message.paragraphs;
      expect(comment.files.map(file => file.elnId)).to.deepEqual([
        './book/comment/img.png',
      ]);
    });
  });

  describe('comments', () => {
    it('nests a message comments as child paragraphs', () => {
      const [message] = translator.toSciLog(validScilogCrate()).paragraphs;
      expect(message.paragraphs).to.have.length(1);
    });

    it('maps Comment entity fields, with linkType=comment', () => {
      const [message] = translator.toSciLog(validScilogCrate()).paragraphs;
      const [comment] = message.paragraphs;
      expect(comment.fields).to.deepEqual({
        linkType: LinkType.COMMENT,
        textcontent: '<p>a comment</p>',
        tags: [
          'eln:id:./book/comment/',
          'eln:author:a@example.org',
          'eln:created:2026-01-19',
          'ctag',
        ],
        defaultOrder: new Date('2026-01-19T01:00:00.000Z').getTime() * 1000,
      });
    });
  });
});

describe('ScilogTranslator.validate', () => {
  it('accepts a valid crate', () => {
    expect(translator.validate(validScilogCrate())).to.be.empty();
  });

  it('rejects when author entity is not found', () => {
    const crate = validScilogCrate();
    crate.setProperty('./book/', 'author', {'@id': '#nonexistent'});
    expect(translator.validate(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_AUTHOR},
    ]);
  });

  it('rejects when author entity is not a Person', () => {
    const crate = validScilogCrate();
    crate.setProperty('#author', '@type', 'Organization');
    expect(translator.validate(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_AUTHOR},
    ]);
  });

  it('rejects when author entity is missing email', () => {
    const crate = validScilogCrate();
    crate.deleteProperty('#author', 'email');
    expect(translator.validate(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_AUTHOR},
    ]);
  });

  it('rejects when a File entity is missing name', () => {
    const crate = validScilogCrate();
    crate.deleteProperty('./book/file.txt', 'name');
    expect(translator.validate(crate)).to.containDeep([
      {code: ElnErrorCode.MISSING_FILE_FIELD},
    ]);
  });

  it('rejects when a File entity is missing encodingFormat', () => {
    const crate = validScilogCrate();
    crate.deleteProperty('./book/file.txt', 'encodingFormat');
    expect(translator.validate(crate)).to.containDeep([
      {code: ElnErrorCode.MISSING_FILE_FIELD},
    ]);
  });

  it('rejects when a File entity is missing sha256', () => {
    const crate = validScilogCrate();
    crate.deleteProperty('./book/file.txt', 'sha256');
    expect(translator.validate(crate)).to.containDeep([
      {code: ElnErrorCode.MISSING_FILE_FIELD},
    ]);
  });

  it('rejects when a File entity is missing contentSize', () => {
    const crate = validScilogCrate();
    crate.deleteProperty('./book/file.txt', 'contentSize');
    expect(translator.validate(crate)).to.containDeep([
      {code: ElnErrorCode.MISSING_FILE_FIELD},
    ]);
  });

  it('accepts numeric contentSize', () => {
    const crate = validScilogCrate();
    crate.setProperty('./book/file.txt', 'contentSize', 123);
    expect(translator.validate(crate)).to.be.empty();
  });

  it('rejects contentSize with unit suffixes', () => {
    const crate = validScilogCrate();
    crate.setProperty('./book/file.txt', 'contentSize', '2.5MB');
    expect(translator.validate(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_CONTENT_SIZE},
    ]);
  });

  it('rejects contentSize that is non-numeric', () => {
    const crate = validScilogCrate();
    crate.setProperty('./book/file.txt', 'contentSize', 'abc');
    expect(translator.validate(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_CONTENT_SIZE},
    ]);
  });

  it('rejects contentSize that is negative', () => {
    const crate = validScilogCrate();
    crate.setProperty('./book/file.txt', 'contentSize', '-5');
    expect(translator.validate(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_CONTENT_SIZE},
    ]);
  });

  it('rejects contentSize that is empty', () => {
    const crate = validScilogCrate();
    crate.setProperty('./book/file.txt', 'contentSize', '');
    expect(translator.validate(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_CONTENT_SIZE},
    ]);
  });

  it('rejects when sdPublisher is missing', () => {
    const crate = validScilogCrate();
    crate.deleteProperty('ro-crate-metadata.json', 'sdPublisher');
    expect(translator.validate(crate)).to.containDeep([
      {code: ElnErrorCode.MISSING_ELN_FIELD},
    ]);
  });

  it('rejects when sdPublisher entity is not found in crate', () => {
    const crate = validScilogCrate();
    const id = 'https://github.com/paulscherrerinstitute/scilog';
    crate.deleteEntity(id);
    expect(translator.validate(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_PUBLISHER},
    ]);
  });

  it('rejects when sdPublisher entity is not an Organization', () => {
    const crate = validScilogCrate();
    const id = 'https://github.com/paulscherrerinstitute/scilog';
    crate.setProperty(id, '@type', 'Person');
    expect(translator.validate(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_PUBLISHER},
    ]);
  });

  it('rejects when sdPublisher entity is missing name', () => {
    const crate = validScilogCrate();
    const id = 'https://github.com/paulscherrerinstitute/scilog';
    crate.deleteProperty(id, 'name');
    expect(translator.validate(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_PUBLISHER},
    ]);
  });

  it('rejects when sdPublisher entity is missing url', () => {
    const crate = validScilogCrate();
    const id = 'https://github.com/paulscherrerinstitute/scilog';
    crate.deleteProperty(id, 'url');
    expect(translator.validate(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_PUBLISHER},
    ]);
  });

  it('rejects when a Dataset entity is missing author', () => {
    const crate = validScilogCrate();
    crate.deleteProperty('./book/', 'author');
    expect(translator.validate(crate)).to.containDeep([
      {code: ElnErrorCode.MISSING_DATASET_FIELD},
    ]);
  });

  it('rejects when a Dataset entity is missing name', () => {
    const crate = validScilogCrate();
    crate.deleteProperty('./book/', 'name');
    expect(translator.validate(crate)).to.containDeep([
      {code: ElnErrorCode.MISSING_DATASET_FIELD},
    ]);
  });
});
