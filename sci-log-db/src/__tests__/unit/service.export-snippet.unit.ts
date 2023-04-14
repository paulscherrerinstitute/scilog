import {expect} from '@loopback/testlab';
import {Suite} from 'mocha';
import {createSandbox, SinonSandbox} from 'sinon';

import {ExportService} from '../../services/export-snippets.service';
import {LinkType, Paragraph} from '../../models';

describe('Export service unit', function (this: Suite) {
  let tests: string[] | string[][];
  let sandbox: SinonSandbox;
  let textElement: Element;
  let exportService: ExportService;
  const textcontent = '<img src="" title="123"><img src="" title="456">';
  const paragraph = new Paragraph({
    textcontent: textcontent,
    files: [
      {fileHash: '123', accessHash: 'abc'},
      {fileHash: '456', accessHash: 'def'},
    ],
    subsnippets: [
      new Paragraph({
        linkType: LinkType.COMMENT,
        textcontent: '<p>a comment</p>',
        updatedAt: new Date(2023, 3, 13),
        updatedBy: 'test',
      }),
      new Paragraph({
        linkType: LinkType.QUOTE,
        textcontent: '<p>a quote</p>',
        updatedAt: new Date(2023, 3, 13),
        updatedBy: 'test',
      }),
    ],
    tags: ['tag1', 'tag2'],
    updatedAt: new Date(2023, 3, 13),
    updatedBy: 'test',
  });

  function emptyElementTextContent(p: Paragraph) {
    const emptyElement = exportService['createDivEmptyElement']();
    return exportService['textContentToHTML'](p, emptyElement);
  }

  beforeEach(() => {
    exportService = new ExportService();
    textElement = emptyElementTextContent(paragraph);
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('createDivEmptyElement', () => {
    const emptyElement = exportService['createDivEmptyElement']();
    expect(emptyElement.outerHTML).to.be.eql('<div></div>');
  });

  it('textContentToHTML', () => {
    const emptyElement = exportService['createDivEmptyElement']();
    const textContentToHTML = exportService['textContentToHTML'](
      paragraph,
      emptyElement,
    );
    expect(textContentToHTML.innerHTML).to.be.eql(textcontent);
    expect(textContentToHTML.outerHTML).to.be.eql(`<div>${textcontent}</div>`);
  });

  it('figure', () => {
    const figure = exportService['figure'](paragraph, textElement);
    expect(figure.innerHTML).to.be.eql(
      '<div><img src="http://localhost:3000/images/abc" title="123"><img src="http://localhost:3000/images/def" title="456"></div>',
    );
    expect(figure.outerHTML).to.be.eql(
      '<imagesnippet><div><img src="http://localhost:3000/images/abc" title="123"><img src="http://localhost:3000/images/def" title="456"></div></imagesnippet>',
    );
  });

  it('tags', () => {
    const tags = exportService['tags'](paragraph, textElement);
    expect(tags.innerHTML).to.be.eql(
      `${textcontent}<snippet-tag>tag1</snippet-tag><snippet-tag>tag2</snippet-tag>`,
    );
    expect(tags.outerHTML).to.be.eql(
      `<div>${textcontent}<snippet-tag>tag1</snippet-tag><snippet-tag>tag2</snippet-tag></div>`,
    );
  });

  it('dateAndAuthor', () => {
    const dateAndAuthor = exportService['dateAndAuthor'](
      paragraph,
      textElement,
    );
    expect(dateAndAuthor.innerHTML).to.be.eql(
      `<snippet-header>13 Apr 2023 / test</snippet-header>${textcontent}`,
    );
    expect(dateAndAuthor.outerHTML).to.be.eql(
      `<div><snippet-header>13 Apr 2023 / test</snippet-header>${textcontent}</div>`,
    );
  });

  it('comment', () => {
    const subsnippet = (paragraph.subsnippets as Paragraph[])[0];
    const subTextElement = emptyElementTextContent(subsnippet);
    exportService['comment'](subsnippet, subTextElement);
    expect(exportService.body.innerHTML).to.be.eql(
      '<snippetcomment><div><p>a comment</p></div></snippetcomment>',
    );
  });

  it('appendSnippet', () => {
    exportService['appendSnippet'](textElement, {'data-test': 'test'});
    expect(exportService.body.innerHTML).to.be.eql(
      `<snippet data-test="test"><div>${textcontent}</div></snippet>`,
    );
  });

  tests = [
    ['<snippetquote><div><p>a quote</p></div></snippetquote>'],
    [
      `<snippetquote><div><p>a quote</p></div></snippetquote><snippet data-quote="keep"><div>${textcontent}</div></snippet>`,
      'lastElement',
    ],
  ];
  tests.forEach(t => {
    it(`quote ${t[1]}`, () => {
      if (t[1])
        exportService['appendSnippet'](textElement, {
          'data-quote': 'remove-if-last',
        });
      const subsnippet = (paragraph.subsnippets as Paragraph[])[1];
      const subTextElement = emptyElementTextContent(subsnippet);
      exportService['quote'](subsnippet, subTextElement);
      expect(exportService.body.innerHTML).to.be.eql(t[0]);
    });
  });

  it('addTitle', () => {
    sandbox.stub(Date.prototype, 'toLocaleDateString').returns('13 Apr 2023');
    exportService['addTitle']('Some test');
    expect(exportService.body.innerHTML).to.be.eql(
      '<h1>Some test: 13 Apr 2023</h1><hr style="border-top: 5px solid;">',
    );
  });

  it('deep', () => {
    const deep = exportService['deep'](paragraph);
    expect(deep.innerHTML).to.be.eql(
      '<snippet-header>13 Apr 2023 / test</snippet-header><div><img src="http://localhost:3000/images/abc" title="123"><img src="http://localhost:3000/images/def" title="456"></div><snippet-tag>tag1</snippet-tag><snippet-tag>tag2</snippet-tag>',
    );
    expect(deep.outerHTML).to.be.eql(
      '<imagesnippet><snippet-header>13 Apr 2023 / test</snippet-header><div><img src="http://localhost:3000/images/abc" title="123"><img src="http://localhost:3000/images/def" title="456"></div><snippet-tag>tag1</snippet-tag><snippet-tag>tag2</snippet-tag></imagesnippet>',
    );
  });

  tests = [
    '<snippetcomment><div><p>a comment</p></div></snippetcomment>',
    '<snippetquote><div><p>a quote</p></div></snippetquote>',
  ];
  tests.forEach((t, i) => {
    it(`wide ${i}`, () => {
      const subsnippet = (paragraph.subsnippets as Paragraph[])[i];
      const subTextElement = emptyElementTextContent(subsnippet);
      exportService['wide'](subsnippet, subTextElement);
      expect(exportService.body.innerHTML).to.be.eql(t);
    });
  });

  it('paragraphToHTML', () => {
    exportService['paragraphToHTML'](paragraph);
    expect(exportService.body.innerHTML).to.be.eql(
      '<snippet data-quote="keep"><imagesnippet><snippet-header>13 Apr 2023 / test</snippet-header><div><img src="http://localhost:3000/images/abc" title="123"><img src="http://localhost:3000/images/def" title="456"></div><snippet-tag>tag1</snippet-tag><snippet-tag>tag2</snippet-tag></imagesnippet></snippet><snippetcomment><div><snippet-header>13 Apr 2023 / test</snippet-header><p>a comment</p></div></snippetcomment><snippetquote><div><snippet-header>13 Apr 2023 / test</snippet-header><p>a quote</p></div></snippetquote><snippet data-quote="keep"><imagesnippet><snippet-header>13 Apr 2023 / test</snippet-header><div><img src="http://localhost:3000/images/abc" title="123"><img src="http://localhost:3000/images/def" title="456"></div><snippet-tag>tag1</snippet-tag><snippet-tag>tag2</snippet-tag></imagesnippet></snippet>',
    );
  });
});
