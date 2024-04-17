import {expect} from '@loopback/testlab';
import {Suite} from 'mocha';
import {createSandbox, SinonSandbox, match} from 'sinon';

import {ExportService} from '../../services/export-snippets.service';
import {LinkType, Paragraph} from '../../models';
import {Server} from '@loopback/rest';
import PDFMerger from 'pdf-merger-js';
import puppeteer from 'puppeteer';
import fspromise from 'fs/promises';
import fs from 'fs';
import tar from 'tar';

describe('Export service unit', function (this: Suite) {
  let tests: string[] | string[][];
  let sandbox: SinonSandbox;
  let textElement: Element;
  let exportService: ExportService;
  const textcontent = '<img src="" title="123"><img src="" title="456">';
  const date = new Date(2023, 3, 13, 11, 13, 15);
  const subsnippets = [
    new Paragraph({
      linkType: LinkType.COMMENT,
      textcontent: '<p>a comment</p>',
      updatedAt: date,
      updatedBy: 'test',
    }),
    new Paragraph({
      linkType: LinkType.QUOTE,
      textcontent: '<p>a quote</p>',
      updatedAt: date,
      updatedBy: 'test',
    }),
    new Paragraph({
      linkType: LinkType.PARAGRAPH,
      textcontent: '<p>a paragraph sub</p>',
      updatedAt: date,
      updatedBy: 'test',
    }),
  ];
  const paragraph = new Paragraph({
    textcontent: textcontent,
    files: [
      {fileHash: '123', accessHash: 'abc'},
      {fileHash: '456', accessHash: 'def'},
      {fileHash: '789', accessHash: 'ghi'},
    ],
    tags: ['tag1', 'tag2'],
    updatedAt: date,
    updatedBy: 'test',
    linkType: LinkType.PARAGRAPH,
  });

  function textContentToHTML(p: Paragraph) {
    const emptyElement = exportService['createDivEmptyElement']();
    return exportService['textContentToHTML'](p, emptyElement);
  }

  beforeEach(() => {
    exportService = new ExportService({url: 'http://localhost:3000'} as Server);
    textElement = textContentToHTML(paragraph);
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
    const element = exportService['textContentToHTML'](paragraph, emptyElement);
    expect(element.innerHTML).to.be.eql(textcontent);
    expect(element.outerHTML).to.be.eql(`<div>${textcontent}</div>`);
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
      `<snippet-header>1 / 13 Apr 2023, 11:13:15 / test</snippet-header>${textcontent}`,
    );
    expect(dateAndAuthor.outerHTML).to.be.eql(
      `<div><snippet-header>1 / 13 Apr 2023, 11:13:15 / test</snippet-header>${textcontent}</div>`,
    );
  });

  it('comment', () => {
    const subsnippet = subsnippets[0];
    const subTextElement = textContentToHTML(subsnippet);
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
      const subsnippet = subsnippets[1];
      const subTextElement = textContentToHTML(subsnippet);
      exportService['quote'](subsnippet, subTextElement);
      expect(exportService.body.innerHTML).to.be.eql(t[0]);
    });
  });

  it('otherSubsnippet', () => {
    const subsnippet = subsnippets[2];
    const subTextElement = textContentToHTML(subsnippet);
    exportService['otherSubsnippet'](subsnippet, subTextElement);
    expect(exportService.body.innerHTML).to.be.eql(
      '<snippet><div><p>a paragraph sub</p></div></snippet>',
    );
  });

  it('addTitle', () => {
    sandbox
      .stub(Date.prototype, 'toLocaleDateString')
      .returns('13 Apr 2023, 11:13:15');
    exportService['addTitle']('Some test');
    expect(exportService.body.innerHTML).to.be.eql(
      '<h1>Some test: 13 Apr 2023, 11:13:15</h1><hr style="border-top: 5px solid;">',
    );
  });

  it('deep', () => {
    const deep = exportService['deep'](paragraph);
    expect(deep.innerHTML).to.be.eql(
      '<snippet-header>1 / 13 Apr 2023, 11:13:15 / test</snippet-header><div><img src="http://localhost:3000/images/abc" title="123"><img src="http://localhost:3000/images/def" title="456"></div><snippet-tag>tag1</snippet-tag><snippet-tag>tag2</snippet-tag>',
    );
    expect(deep.outerHTML).to.be.eql(
      '<imagesnippet><snippet-header>1 / 13 Apr 2023, 11:13:15 / test</snippet-header><div><img src="http://localhost:3000/images/abc" title="123"><img src="http://localhost:3000/images/def" title="456"></div><snippet-tag>tag1</snippet-tag><snippet-tag>tag2</snippet-tag></imagesnippet>',
    );
  });

  tests = [
    '<snippetcomment><div><p>a comment</p></div></snippetcomment>',
    '<snippetquote><div><p>a quote</p></div></snippetquote>',
    '<snippet><div><p>a paragraph sub</p></div></snippet>',
  ];
  tests.forEach((t, i) => {
    it(`wide ${i}`, () => {
      const subsnippet = subsnippets[i];
      const subTextElement = textContentToHTML(subsnippet);
      exportService['wide'](subsnippet, subTextElement);
      expect(exportService.body.innerHTML).to.be.eql(t);
    });
  });

  const subsnippetTest = [
    '<snippet data-quote="remove-if-last"><imagesnippet><snippet-header>1 / 13 Apr 2023, 11:13:15 / test</snippet-header><div><img src="http://localhost:3000/images/abc" title="123"><img src="http://localhost:3000/images/def" title="456"></div><snippet-tag>tag1</snippet-tag><snippet-tag>tag2</snippet-tag></imagesnippet></snippet><snippetcomment><div><snippet-header>1.1 / 13 Apr 2023, 11:13:15 / test</snippet-header><p>a comment</p></div></snippetcomment><snippet><div><snippet-header>1.2 /  13 Apr 2023, 11:13:15 / test</snippet-header><p>a paragraph sub</p></div></snippet>',
    '<snippetquote><div><snippet-header>1 / 13 Apr 2023, 11:13:15 / test</snippet-header><p>a quote</p></div></snippetquote><snippet data-quote="keep"><imagesnippet><div><img src="http://localhost:3000/images/abc" title="123"><img src="http://localhost:3000/images/def" title="456"></div><snippet-tag>tag1</snippet-tag><snippet-tag>tag2</snippet-tag></imagesnippet></snippet>',
  ];
  subsnippetTest.forEach((t, i) => {
    it(`paragraphToHTML ${i}`, () => {
      const paragraphCopy = Object.assign({}, paragraph);
      paragraphCopy.subsnippets = [subsnippets[i]];
      if (i === 0) paragraphCopy.subsnippets.push(subsnippets[2]);
      exportService['paragraphToHTML'](paragraphCopy);
      expect(exportService.body.innerHTML).to.be.eql(t);
    });
  });

  it('mergePDFs', async () => {
    const pdfAdd = sandbox.stub(PDFMerger.prototype, 'add').resolves();
    const pdfSave = sandbox.stub(PDFMerger.prototype, 'save');
    await exportService['mergePDFs'](5, 'aFile');
    expect(pdfAdd.callCount).to.be.eql(5);
    expect(pdfAdd.args.map(a => a[0])).to.be.eql([
      'aFile.0',
      'aFile.1',
      'aFile.2',
      'aFile.3',
      'aFile.4',
    ]);
    expect(pdfSave.args[0]).to.be.eql(['aFile']);
  });

  const testsExport = [
    [5, 4],
    [20, 1],
  ];
  testsExport.forEach(([i, o]) => {
    it(`exportToPdf ${i}`, async () => {
      exportService.batchSize = i;
      const paragraphs = Array.from({length: 18}, () => paragraph).flat();
      sandbox.stub(puppeteer, 'launch');
      const htmlToPDF = sandbox.stub(
        exportService,
        <keyof ExportService>'htmlToPDF',
      );
      const addTitle = sandbox.spy(
        exportService,
        <keyof ExportService>'addTitle',
      );
      sandbox.stub(exportService, <keyof ExportService>'mergePDFs');
      const exportFile = await exportService['exportToPdf'](
        paragraphs,
        {exportFile: 'dir/file.pdf', exportDir: 'dir'},
        'aTitle',
      );
      expect(addTitle.callCount).to.be.eql(1);
      expect(htmlToPDF.callCount).to.be.eql(o);
      expect(exportFile).to.be.eql('dir/file.pdf');
    });
  });

  const countTest = [
    [LinkType.PARAGRAPH, 1],
    [LinkType.QUOTE, 0],
    [LinkType.COMMENT, '0.1'],
  ];
  countTest.forEach(([t, c]) => {
    it(`countSnippets ${t}`, () => {
      const count = exportService['countSnippets'](t as LinkType);
      expect(count).to.be.eql(c);
    });
  });

  it('code', () => {
    textElement = textContentToHTML({
      textcontent: `<pre><code class="language-python">def foo():
    return 1</code></pre>`,
    } as Paragraph);
    const code = exportService['code'](paragraph, textElement);
    expect(code.innerHTML).to.be
      .eql(`<pre class="language-python" tabindex="0"><code class="language-python"><span class="token keyword">def</span> <span class="token function">foo</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">:</span>
    <span class="token keyword">return</span> <span class="token number">1</span></code></pre>`);
    expect(code.outerHTML).to.be
      .eql(`<div><pre class="language-python" tabindex="0"><code class="language-python"><span class="token keyword">def</span> <span class="token function">foo</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">:</span>
    <span class="token keyword">return</span> <span class="token number">1</span></code></pre></div>`);
  });

  tests = [
    ['<p>not a table</p>', '<p>not a table</p>'],
    [
      '<figure class="table"><table><tbody><tr><td>a</td></tr></tbody></table></figure><p>&nbsp;</p>',
      '<figure class="table"><table><tbody><tr><td>a</td></tr></tbody></table></figure><p>&nbsp;</p>',
    ],
    [
      '<figure class="table"><table><tbody><tr><td>a</td></tr></tbody></table></figure>',
      '<figure class="table"><table><tbody><tr><td>a</td></tr></tbody></table></figure>',
    ],
    [
      '<figure class="table"><table><tbody><tr><td>someLongsomeLongsomeLongsomeLongsomeLongsomeLong</td><td>someLongsomeLongsomeLongsomeLongsomeLongsomeLongsomeLongsomeLong</td></tr><tr><td>1</td><td>1</td></tr></tbody></table></figure>',
      '<figure class="table table-with-space"><table class="table-landscape"><tbody><tr><td>someLongsomeLongsomeLongsomeLongsomeLongsomeLong</td><td>someLongsomeLongsomeLongsomeLongsomeLongsomeLongsomeLongsomeLong</td></tr><tr><td>1</td><td>1</td></tr></tbody></table></figure>',
    ],
    [
      '<figure class="table"><table><tbody><tr><td>someLongsomeLongsomeLongsomeLongsomeLongsomeLong</td><td>someLongsomeLongsomeLongsomeLongsomeLongsomeLongsomeLongsomeLong</td></tr><tr><td>1</td><td>1</td></tr></tbody></table></figure><p>&nbsp;</p>',
      '<figure class="table"><table class="table-landscape"><tbody><tr><td>someLongsomeLongsomeLongsomeLongsomeLongsomeLong</td><td>someLongsomeLongsomeLongsomeLongsomeLongsomeLongsomeLongsomeLong</td></tr><tr><td>1</td><td>1</td></tr></tbody></table></figure><p>&nbsp;</p>',
    ],
  ];
  tests.forEach((t, i) => {
    it(`table ${i}`, () => {
      const element = textContentToHTML({textcontent: t[0]} as Paragraph);
      expect(
        exportService['table']({} as Paragraph, element).innerHTML,
      ).to.be.eql(t[1]);
    });
  });

  [
    {input: [{files: []}], expected: ['', []]},
    {
      input: [
        {files: [{fileHash: 'hash123', accessHash: 'accessHash1'}]},
        '<div class="notFileLink" href="hash456">notFileLink</div>',
      ],
      expected: [
        '<div class="notFileLink" href="hash456">notFileLink</div>',
        [],
      ],
    },
    {
      input: [
        {files: [{fileHash: 'hash123', accessHash: 'accessHash1'}]},
        '<div class="fileLink" href="hash456">anotherHref</div>',
      ],
      expected: ['<div class="fileLink" href="hash456">anotherHref</div>', []],
    },
    {
      input: [
        {files: [{fileHash: 'hash123', accessHash: 'accessHash2'}]},
        '<div class="fileLink" href="file:hash123">someFile.pdf</div>',
      ],
      expected: [
        '<filelink>attachments/someFile.pdf</filelink>',
        [['someFile.pdf', 'accessHash2']],
      ],
    },
    {
      input: [
        {files: [{fileHash: 'hash123', accessHash: 'accessHash2'}]},
        '<div class="fileLink" href="file:hash123">someFile_>_.pdf</div>',
      ],
      expected: [
        '<filelink>attachments/someFile_&gt;_.pdf</filelink>',
        [['someFile_>_.pdf', 'accessHash2']],
      ],
    },
  ].forEach((t, i) => {
    it(`attachment ${i}`, async () => {
      const element = textContentToHTML({textcontent: t.input[1]} as Paragraph);
      expect(
        exportService['attachment'](t.input[0] as Paragraph, element).innerHTML,
      ).to.be.eql(t.expected[0]);
      expect(exportService.attachments).to.be.eql(t.expected[1]);
    });
  });

  it('downloadAttachment', async () => {
    const responseSpy = sandbox
      .stub(global, 'fetch')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .resolves({arrayBuffer: async () => '' as any} as Response);
    sandbox.stub(Buffer, 'from');
    const writeFileSpy = sandbox.stub(fspromise, 'writeFile');
    await exportService['downloadAttachment']('someDir', ['a', 'b']);
    expect(writeFileSpy.calledWith('someDir/a', match.any)).to.be.eql(true);
    expect(responseSpy.calledWith('http://localhost:3000/images/b')).to.be.eql(
      true,
    );
  });

  [
    {input: [], expected: ['dir/file.pdf', 0, false]},
    {input: ['a', 'b'], expected: ['dir.gz', 2, true]},
  ].forEach((t, i) => {
    it(`zipAttachments ${i}`, async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      exportService.attachments = t.input as any;
      const tarSpy = sandbox.stub(tar, 'create');
      sandbox.stub(fs, 'mkdirSync');

      const downloadAttachmentSpy = sandbox.stub(
        exportService,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <any>'downloadAttachment',
      );
      const zip = await exportService['zipAttachments']({
        exportFile: 'dir/file.pdf',
        exportDir: 'dir',
      });
      expect(zip).to.be.eql(t.expected[0]);
      expect(downloadAttachmentSpy.callCount).to.be.eql(t.expected[1]);
      expect(
        tarSpy.calledWith({gzip: true, file: 'dir.gz', C: 'dir'}, [
          'attachments',
          'file.pdf',
        ]),
      ).to.eql(t.expected[2]);
    });
  });
});
