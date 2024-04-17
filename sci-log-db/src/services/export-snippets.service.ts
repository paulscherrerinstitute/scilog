import {bind, BindingScope, ContextTags, inject} from '@loopback/core';
import {EXPORT_SERVICE} from '../keys';
import {Filecontainer, LinkType, Paragraph} from '../models';
import {Browser, launch as puppeteerLaunc} from 'puppeteer';
import {JSDOM} from 'jsdom';
import {RestBindings, Server} from '@loopback/rest';
import PDFMerger from 'pdf-merger-js';
import Prism from 'prismjs';
import LoadLanguages from 'prismjs/components/';
import {omit} from 'lodash';
import {writeFile} from 'fs/promises';
import {create as tarCreate} from 'tar';
import {mkdirSync, existsSync} from 'fs';
import {basename} from 'path';

@bind({
  scope: BindingScope.TRANSIENT,
  tags: {[ContextTags.KEY]: EXPORT_SERVICE},
})
export class ExportService {
  document: Document;
  body: HTMLBodyElement;
  dateOptions = {
    locales: 'en-GB',
    options: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    } as const,
  };
  batchSize = 2000;
  paragraphCounter: number;
  subsnippetCounter: number;
  attachments: string[][] = [];
  attachmentsFolder = 'attachments';

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
      this.table,
      this.figure,
      this.attachment,
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
      omit(this.dateOptions.options, 'hour', 'minute', 'second'),
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

  private table = (snippet: Paragraph, element: Element) => {
    const tableElements = element.querySelectorAll('table');
    if (tableElements.length === 0) return element;
    tableElements.forEach(tableElement => {
      let maxWidth = 0;
      tableElement.querySelectorAll('tr').forEach(row => {
        let totalWidth = 0;
        row
          .querySelectorAll('td')
          .forEach(column => (totalWidth += column.innerHTML.length));
        maxWidth = totalWidth > maxWidth ? totalWidth : maxWidth;
      });
      if (maxWidth < 500 / 10) return tableElement;
      tableElement.className = 'table-landscape';
      const parentElement = tableElement.parentElement;
      if (parentElement?.nextElementSibling?.innerHTML !== '&nbsp;')
        parentElement?.classList?.add('table-with-space');
      return tableElement;
    });
    return element;
  };

  private attachment = (snippet: Paragraph, element: Element) => {
    snippet.files?.map(fileSnippet => {
      const fileLinkElement = element.querySelector(
        `.fileLink[href='file:${fileSnippet.fileHash}']`,
      );
      if (!fileLinkElement) return;
      const attachment = fileLinkElement.textContent ?? '';
      const attachmentElement = this.document.createElement('fileLink');
      attachmentElement.innerHTML = `${this.attachmentsFolder}/${fileLinkElement.innerHTML}`;
      fileLinkElement.replaceWith(attachmentElement);
      this.attachments.push([attachment, fileSnippet.accessHash as string]);
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

  async exportToPdf(
    snippets: Paragraph[],
    exportPath: {exportFile: string; exportDir: string},
    title?: string,
  ) {
    const browser = await puppeteerLaunc({
      executablePath: process.env.CHROME_BIN,
      args: ['--no-sandbox'],
    });
    const exportFile = exportPath.exportFile;
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
    return this.zipAttachments(exportPath);
  }

  private async mergePDFs(chunks: number, exportFile: string) {
    const merger = new PDFMerger();
    for (let c = 0; c < chunks; c++) await merger.add(`${exportFile}.${c}`);
    await merger.save(exportFile);
  }

  private async zipAttachments(exportPath: {
    exportFile: string;
    exportDir: string;
  }) {
    if (this.attachments.length === 0) return exportPath.exportFile;
    const attachmentDir = `${exportPath.exportDir}/${this.attachmentsFolder}`;
    if (!existsSync(attachmentDir)) mkdirSync(attachmentDir);
    const downloadAttachmentDestinationBinding = this.downloadAttachment.bind(
      this,
      attachmentDir,
    );
    await Promise.all(
      this.attachments.map(downloadAttachmentDestinationBinding),
    );
    const exportZip = `${exportPath.exportDir}.gz`;
    await tarCreate({gzip: true, file: exportZip, C: exportPath.exportDir}, [
      this.attachmentsFolder,
      basename(exportPath.exportFile),
    ]);
    return exportZip;
  }

  private async downloadAttachment(
    attachmentDir: string,
    attachment: string[],
  ) {
    const response = await fetch(`${this.server.url}/images/${attachment[1]}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    const destinationFile = `${attachmentDir}/${attachment[0]}`;
    await writeFile(destinationFile, buffer);
  }

  private async htmlToPDF(
    browser: Browser,
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
