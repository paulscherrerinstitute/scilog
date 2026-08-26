import {expect} from '@loopback/testlab';
import {resolveFileReferences} from '../../../services/eln/file-references';

describe('resolveFileReferences', () => {
  const fileMap = new Map([
    ['./book/message/file.txt', {fileHash: 'newhash-1'}],
    ['./book/message/img.png', {fileHash: 'newhash-2'}],
  ]);

  it('rewrites anchor href to file:<newFileHash>', () => {
    const html = '<p>see <a href="./book/message/file.txt">doc</a></p>';
    expect(resolveFileReferences(html, fileMap)).to.equal(
      '<p>see <a href="file:newhash-1">doc</a></p>',
    );
  });

  it('rewrites img title to the new fileHash and leaves src as-is', () => {
    const html = '<p><img src="./book/message/img.png" title="oldhash"></p>';
    expect(resolveFileReferences(html, fileMap)).to.equal(
      '<p><img src="./book/message/img.png" title="newhash-2"></p>',
    );
  });

  it('rewrites multiple refs in one HTML payload', () => {
    const html =
      '<a href="./book/message/file.txt">f</a>' +
      '<img src="./book/message/img.png" title="x">';
    expect(resolveFileReferences(html, fileMap)).to.equal(
      '<a href="file:newhash-1">f</a>' +
        '<img src="./book/message/img.png" title="newhash-2">',
    );
  });

  it('leaves non-ELN refs untouched', () => {
    const html =
      '<a href="https://example.org">ext</a>' +
      '<img src="data:image/png;base64,abc" title="keep">';
    expect(resolveFileReferences(html, fileMap)).to.equal(html);
  });

  it('throws when an ELN ref is missing from the map', () => {
    const html = '<a href="./book/message/missing.txt">x</a>';
    expect(() => resolveFileReferences(html, fileMap)).to.throw(
      /no file map entry for href \.\/book\/message\/missing\.txt/,
    );
  });
});
