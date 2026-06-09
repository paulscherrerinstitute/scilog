import {expect} from '@loopback/testlab';
import {LinkType} from '../../models/paragraph.model';
import {ElnTranslator} from '../../services/eln-translator';
import {validElnCrate} from '../eln.helpers';

describe('ElnTranslator.toSciLog', () => {
  describe('logbook', () => {
    it('extracts fields, hasPart, and provenance tags from the Book entity', () => {
      expect(ElnTranslator.toSciLog(validElnCrate()).logbook).to.deepEqual({
        fields: {
          name: 'book',
          description: 'a book',
          tags: [
            'eln:source:scilog',
            'eln:id:./book/',
            'eln:author:a@example.org',
            'eln:created:2026-01-19',
          ],
        },
        hasPart: ['./book/file.txt', './book/message/', './book/comment/'],
        comment: [],
      });
    });

    it('omits optional fields and conditional tags when missing', () => {
      const crate = validElnCrate();
      crate.deleteProperty('./book/', 'description');
      crate.deleteProperty('./book/', 'dateCreated');
      crate.deleteProperty('./book/', 'author');
      expect(ElnTranslator.toSciLog(crate).logbook.fields).to.deepEqual({
        name: 'book',
        description: undefined,
        tags: ['eln:source:scilog', 'eln:id:./book/'],
      });
    });
  });

  describe('files', () => {
    it('maps File entity fields, keyed by @id', () => {
      expect(
        ElnTranslator.toSciLog(validElnCrate()).files.get('./book/file.txt'),
      ).to.deepEqual({
        fields: {
          name: 'file.txt',
          filename: 'file.txt',
          contentType: 'text/plain',
          contentSize: 123,
          contentSha256: '0'.repeat(64),
          fileExtension: 'txt',
          tags: ['eln:id:./book/file.txt'],
        },
        hasPart: [],
        comment: [],
      });
    });

    it('leaves fileExtension undefined when the name has no extension', () => {
      const crate = validElnCrate();
      crate.setProperty('./book/file.txt', 'name', 'README');
      expect(
        ElnTranslator.toSciLog(crate).files.get('./book/file.txt')?.fields
          .fileExtension,
      ).to.be.undefined();
    });
  });

  describe('paragraphs', () => {
    it('maps Message entity fields, with linkType=paragraph and split keyword tags', () => {
      expect(
        ElnTranslator.toSciLog(validElnCrate()).paragraphs.get(
          './book/message/',
        ),
      ).to.deepEqual({
        fields: {
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
        },
        hasPart: ['./book/file.txt'],
        comment: ['./book/comment/'],
      });
    });
  });

  describe('comments', () => {
    it('maps Comment entity fields, with linkType=comment', () => {
      expect(
        ElnTranslator.toSciLog(validElnCrate()).comments.get('./book/comment/'),
      ).to.deepEqual({
        fields: {
          linkType: LinkType.COMMENT,
          textcontent: '<p>a comment</p>',
          tags: [
            'eln:id:./book/comment/',
            'eln:author:a@example.org',
            'eln:created:2026-01-19',
            'ctag',
          ],
          defaultOrder: new Date('2026-01-19T01:00:00.000Z').getTime() * 1000,
        },
        hasPart: [],
        comment: [],
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
