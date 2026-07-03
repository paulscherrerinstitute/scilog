import {expect} from '@loopback/testlab';
import {LinkType} from '../../models/paragraph.model';
import {ElnTranslator} from '../../services/eln-translator';
import {validElnCrate} from '../eln.helpers';

describe('ElnTranslator.toSciLog', () => {
  it('assembles the tree: one paragraph with its file and nested comment', () => {
    const draft = ElnTranslator.toSciLog(validElnCrate());
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
      expect(ElnTranslator.toSciLog(validElnCrate()).fields).to.deepEqual({
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
      const crate = validElnCrate();
      crate.deleteProperty('./book/', 'description');
      crate.deleteProperty('./book/', 'dateCreated');
      crate.deleteProperty('./book/', 'author');
      expect(ElnTranslator.toSciLog(crate).fields).to.deepEqual({
        name: 'book',
        description: undefined,
        tags: ['eln:source:scilog', 'eln:id:./book/'],
      });
    });
  });

  describe('paragraphs', () => {
    it('maps Message entity fields, with linkType=paragraph and split keyword tags', () => {
      const [message] = ElnTranslator.toSciLog(validElnCrate()).paragraphs;
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
      const [message] = ElnTranslator.toSciLog(validElnCrate()).paragraphs;
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
      const crate = validElnCrate();
      crate.setProperty('./book/file.txt', 'name', 'README');
      const [message] = ElnTranslator.toSciLog(crate).paragraphs;
      expect(message.files[0].fields.fileExtension).to.be.undefined();
    });

    it('embeds files on a comment, not only on a paragraph', () => {
      const crate = validElnCrate();
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
      const [message] = ElnTranslator.toSciLog(crate).paragraphs;
      const [comment] = message.paragraphs;
      expect(comment.files.map(file => file.elnId)).to.deepEqual([
        './book/comment/img.png',
      ]);
    });
  });

  describe('comments', () => {
    it('nests a message comments as child paragraphs', () => {
      const [message] = ElnTranslator.toSciLog(validElnCrate()).paragraphs;
      expect(message.paragraphs).to.have.length(1);
    });

    it('maps Comment entity fields, with linkType=comment', () => {
      const [message] = ElnTranslator.toSciLog(validElnCrate()).paragraphs;
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

describe('ElnTranslator.decodeFileReferences', () => {
  const fileMap = new Map([
    ['./book/message/file.txt', {fileHash: 'newhash-1'}],
    ['./book/message/img.png', {fileHash: 'newhash-2'}],
  ]);

  it('rewrites anchor href to file:<newFileHash>', () => {
    const html = '<p>see <a href="./book/message/file.txt">doc</a></p>';
    expect(ElnTranslator.decodeFileReferences(html, fileMap)).to.equal(
      '<p>see <a href="file:newhash-1">doc</a></p>',
    );
  });

  it('rewrites img title to the new fileHash and leaves src as-is', () => {
    const html = '<p><img src="./book/message/img.png" title="oldhash"></p>';
    expect(ElnTranslator.decodeFileReferences(html, fileMap)).to.equal(
      '<p><img src="./book/message/img.png" title="newhash-2"></p>',
    );
  });

  it('rewrites multiple refs in one HTML payload', () => {
    const html =
      '<a href="./book/message/file.txt">f</a>' +
      '<img src="./book/message/img.png" title="x">';
    expect(ElnTranslator.decodeFileReferences(html, fileMap)).to.equal(
      '<a href="file:newhash-1">f</a>' +
        '<img src="./book/message/img.png" title="newhash-2">',
    );
  });

  it('leaves non-ELN refs untouched', () => {
    const html =
      '<a href="https://example.org">ext</a>' +
      '<img src="data:image/png;base64,abc" title="keep">';
    expect(ElnTranslator.decodeFileReferences(html, fileMap)).to.equal(html);
  });

  it('throws when an ELN ref is missing from the map', () => {
    const html = '<a href="./book/message/missing.txt">x</a>';
    expect(() => ElnTranslator.decodeFileReferences(html, fileMap)).to.throw(
      /no file map entry for href \.\/book\/message\/missing\.txt/,
    );
  });
});
