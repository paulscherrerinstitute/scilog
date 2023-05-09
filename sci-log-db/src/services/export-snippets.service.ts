import {bind, BindingScope, ContextTags, inject} from '@loopback/core';
import {EXPORT_SERVICE} from '../keys';
import {Filecontainer, LinkType, Paragraph} from '../models';
import * as puppeteer from 'puppeteer';
import {JSDOM} from 'jsdom';
import {RestBindings, Server} from '@loopback/rest';
import PDFMerger from 'pdf-merger-js';
import Prism from 'prismjs';
import LoadLanguages from 'prismjs/components/';

@bind({
  scope: BindingScope.TRANSIENT,
  tags: {[ContextTags.KEY]: EXPORT_SERVICE},
})
export class ExportService {
  document: Document;
  body: HTMLBodyElement;
  dateOptions = {
    locales: 'en-GB',
    options: {year: 'numeric', month: 'short', day: 'numeric'} as const,
  };
  batchSize = 2000;
  paragraphCounter: number;
  subsnippetCounter: number;

  constructor(
    @inject(RestBindings.SERVER)
    private server: Server,
  ) {
    this.createDocumentBody();
    this.paragraphCounter = 0;
    this.subsnippetCounter = 0;
  }

  private comment = (snippet: Paragraph, element: Element) => {
    if (snippet.linkType !== 'comment') return;
    const snippetCommentElement = this.document.createElement('snippetComment');
    snippetCommentElement.append(element);
    this.body.append(snippetCommentElement);
  };

  private otherSubsnippet = (snippet: Paragraph, element: Element) => {
    if (['comment', 'quote'].includes(snippet.linkType ?? '')) return;
    const otherSnippet = this.document.createElement('snippet');
    otherSnippet.append(element);
    if (snippet.linkType === 'paragraph') {
      this.paragraphCounter -= 1;
      this.subsnippetCounter += 1;
      const header = element.querySelector('snippet-header');
      if (header)
        header.innerHTML = `${this.paragraphCounter}.${
          this.subsnippetCounter
        } / ${header.innerHTML.slice(header.innerHTML.indexOf('/') + 1)}`;
    }
    this.body.append(otherSnippet);
  };

  private appendSnippet = (
    element: Element,
    dataAttributes: {[key: string]: string} = {},
  ) => {
    const snippetElement = this.document.createElement('snippet');
    Object.entries(dataAttributes).map(([k, v]) =>
      snippetElement.setAttribute(k, v),
    );
    snippetElement.append(element);
    this.body.append(snippetElement);
  };

  private quote = (snippet: Paragraph, element: Element) => {
    if (snippet.linkType !== 'quote') return;
    const snippetCommentElement = this.document.createElement('snippetQuote');
    snippetCommentElement.append(element);
    const snippets = this.body.querySelectorAll('snippet');
    const lastSnippet = snippets[snippets.length - 1];
    if (
      lastSnippet?.getAttribute('data-quote') === 'remove-if-last' &&
      (this.body?.lastChild as Element)?.tagName === 'SNIPPET'
    )
      lastSnippet.remove();
    this.body.append(snippetCommentElement);
    if (lastSnippet) {
      lastSnippet.setAttribute('data-quote', 'keep');
      lastSnippet.querySelector('snippet-header')?.remove();
      this.body.append(lastSnippet.cloneNode(true));
    }
  };

  private figure = (snippet: Paragraph, element: Element): Element => {
    if (!snippet.textcontent?.includes('<img')) return element;
    const imageElement = this.document.createElement('imageSnippet');
    imageElement.append(element);
    snippet.files?.map(file => {
      const image = imageElement.querySelector(
        `[title="${file.fileHash}"]`,
      ) as HTMLImageElement;
      if (image)
        image.src = `${this.server.url}/images/${
          (file as Filecontainer & {accessHash: string}).accessHash
        }`;
    });
    return imageElement;
  };

  private textContentToHTML = (
    snippet: Paragraph,
    element: Element,
  ): Element => {
    element.innerHTML = snippet.textcontent ?? '';
    return element;
  };

  private createDivEmptyElement = (): Element => {
    return this.document.createElement('div');
  };

  private tags = (snippet: Paragraph, element: Element): Element => {
    snippet.tags?.map(t => {
      const tagElement = this.document.createElement('snippet-tag');
      tagElement.innerHTML = t;
      element.insertAdjacentElement('beforeend', tagElement);
    });
    return element;
  };

  private dateAndAuthor = (snippet: Paragraph, element: Element): Element => {
    const tagElement = this.document.createElement('snippet-header');
    const counter: number | string = this.countSnippets(snippet.linkType);
    tagElement.innerHTML = `${counter} / ${snippet.updatedAt.toLocaleDateString(
      this.dateOptions.locales,
      this.dateOptions.options,
    )} / ${snippet.updatedBy}`;
    element.insertAdjacentElement('afterbegin', tagElement);
    return element;
  };

  private deep = (snippet: Paragraph): Element => {
    return [
      this.textContentToHTML,
      this.code,
      this.figure,
      this.tags,
      this.dateAndAuthor,
    ].reduce(
      (result, currentFunction) => currentFunction(snippet, result),
      this.createDivEmptyElement(),
    );
  };

  private wide = (snippet: Paragraph, element: Element) => {
    return [this.quote, this.comment, this.otherSubsnippet].map(f =>
      f(snippet, element),
    );
  };

  private paragraphToHTML = (snippet: Paragraph) => {
    this.subsnippetCounter = 0;
    const element = this.deep(snippet);
    this.appendSnippet(element, {'data-quote': 'remove-if-last'});
    if (snippet.subsnippets?.length && snippet.subsnippets?.length > 0) {
      snippet.subsnippets.map(s => {
        const subElement = this.deep(s);
        this.wide(s, subElement);
      });
    }
  };

  private addTitle = (titleName?: string) => {
    const title = this.document.createElement('h1');
    title.innerHTML = `${
      titleName ?? 'Scilog'
    }: ${new Date().toLocaleDateString(
      this.dateOptions.locales,
      this.dateOptions.options,
    )}`;
    this.body.append(title);
    const hr = this.document.createElement('hr');
    hr.setAttribute('style', 'border-top: 5px solid;');
    this.body.append(hr);
  };

  private code = (snippet: Paragraph, element: Element) => {
    const codeElements = element.querySelectorAll('[class^=language-]');
    if (codeElements.length === 0) return element;
    codeElements.forEach(codeElement => {
      LoadLanguages(codeElement?.className.replace('language-', ''));
      Prism.highlightElement(codeElement);
    });
    return element;
  };

  private countSnippets(linkType?: LinkType) {
    let counter: number | string = '';
    if (linkType === 'paragraph') {
      this.paragraphCounter += 1;
      counter = this.paragraphCounter;
    } else if (linkType === 'quote') counter = this.paragraphCounter;
    else {
      this.subsnippetCounter += 1;
      counter = `${this.paragraphCounter}.${this.subsnippetCounter}`;
    }
    return counter;
  }

  private createDocumentBody() {
    const dom = new JSDOM('<!DOCTYPE html>');
    this.document = dom.window.document;
    this.body = dom.window.document.body as HTMLBodyElement;
  }

  async exportToPdf(snippets: Paragraph[], exportFile: string, title?: string) {
    const browser = await puppeteer.launch({
      executablePath: process.env.CHROME_BIN,
      args: ['--no-sandbox'],
    });
    const chunks = Math.ceil(snippets.length / this.batchSize);
    const pdfs = [...Array(chunks).keys()].map(async c => {
      this.createDocumentBody();
      const snippetChunk = snippets.slice(
        c * this.batchSize,
        (c + 1) * this.batchSize,
      );
      if (c === 0) this.addTitle(title);
      snippetChunk.map((s: Paragraph) => this.paragraphToHTML(s));
      await this.htmlToPDF(browser, `${exportFile}.${c}`, this.body.outerHTML);
    });
    await Promise.all(pdfs);
    await browser.close();
    await this.mergePDFs(chunks, exportFile);
  }

  private async mergePDFs(chunks: number, exportFile: string) {
    const merger = new PDFMerger();
    for (let c = 0; c < chunks; c++) await merger.add(`${exportFile}.${c}`);
    await merger.save(`${exportFile}`);
  }

  private async htmlToPDF(
    browser: puppeteer.Browser,
    exportFile: string,
    htmlString: string,
  ) {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);
    await page.setContent(htmlString);
    await page.addStyleTag({path: 'src/services/pdf.css'});
    await page.addStyleTag({
      path: `${
        process.env.NODE_PATH ?? 'node_modules'
      }/prismjs/themes/prism.css`,
    });
    await page.emulateMediaType('print');
    await page.pdf({
      path: exportFile,
      margin: {top: '100px', right: '50px', bottom: '100px', left: '50px'},
      printBackground: true,
      format: 'A4',
      timeout: 0,
    });
  }
}
