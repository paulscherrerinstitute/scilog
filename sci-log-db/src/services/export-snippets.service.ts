import {bind, BindingScope, ContextTags, inject} from '@loopback/core';
import {EXPORT_SERVICE} from '../keys';
import {Filecontainer, Paragraph} from '../models';
import * as puppeteer from 'puppeteer';
import {JSDOM} from 'jsdom';
import {RestBindings, Server} from '@loopback/rest';

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

  constructor(
    @inject(RestBindings.SERVER)
    private server: Server,
  ) {
    const dom = new JSDOM('<!DOCTYPE html>');
    this.document = dom.window.document;
    this.body = this.document.body as HTMLBodyElement;
  }

  private comment = (snippet: Paragraph, element: Element) => {
    if (snippet.linkType !== 'comment') return;
    const snippetCommentElement = this.document.createElement('snippetComment');
    snippetCommentElement.append(element);
    this.body.append(snippetCommentElement);
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
    tagElement.innerHTML = `${snippet.updatedAt.toLocaleDateString(
      this.dateOptions.locales,
      this.dateOptions.options,
    )} / ${snippet.updatedBy}`;
    element.insertAdjacentElement('afterbegin', tagElement);
    return element;
  };

  private deep = (snippet: Paragraph): Element => {
    return [
      this.textContentToHTML,
      this.figure,
      this.tags,
      this.dateAndAuthor,
    ].reduce(
      (result, currentFunction) => currentFunction(snippet, result),
      this.createDivEmptyElement(),
    );
  };

  private wide = (snippet: Paragraph, element: Element) => {
    return [this.quote, this.comment].map(f => f(snippet, element));
  };

  private paragraphToHTML = (snippet: Paragraph) => {
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

  async exportToPdf(snippets: Paragraph[], exportFile: string, title?: string) {
    this.addTitle(title);
    snippets.map((s: Paragraph) => this.paragraphToHTML(s));
    const browser = await puppeteer.launch({
      executablePath: process.env.CHROME_BIN,
      args: ['--no-sandbox', '--disable-gpu', '--single-process'],
    });
    const page = await browser.newPage();
    await page.setContent(this.body.outerHTML);
    await page.addStyleTag({path: 'src/services/pdf.css'});
    await page.emulateMediaType('screen');
    await page.pdf({
      path: exportFile,
      margin: {top: '100px', right: '50px', bottom: '100px', left: '50px'},
      printBackground: true,
      format: 'A4',
      timeout: 0,
    });
    await browser.close();
  }
}
