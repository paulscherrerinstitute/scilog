import { bind, BindingScope, ContextTags } from '@loopback/core';
import { EXPORT_SERVICE } from '../keys';
import { Filecontainer, Paragraph } from '../models';
import * as puppeteer from 'puppeteer';
import { JSDOM } from 'jsdom'

@bind({
  scope: BindingScope.TRANSIENT,
  tags: { [ContextTags.KEY]: EXPORT_SERVICE },
})
export class ExportService {
  document: Document;
  body: HTMLBodyElement;

  constructor() { 
    const dom = new JSDOM('<!DOCTYPE html>');
    this.document = dom.window.document;
    this.body = this.document.querySelector('body') as HTMLBodyElement;
  }

  private comment = (snippet: Paragraph, element: Element, parentElement: Element) => {
    if (snippet.linkType === 'comment') {
      const snippetCommentElement = this.document.createElement('snippetComment');
      snippetCommentElement.append(element);
      this.appendSnippet(parentElement);
      this.body.append(snippetCommentElement)
    }
  }

  private appendSnippet = (element: Element) => {
    const snippetElement = this.document.createElement('snippet');
    snippetElement.append(element);
    this.body.append(snippetElement);
  }

  private quote = (snippet: Paragraph, element: Element, parentElement: Element) => {
    if (snippet.linkType === 'quote') {
      const snippetCommentElement = this.document.createElement('snippetQuote');
      snippetCommentElement.append(element);
      this.body.append(snippetCommentElement);
      this.appendSnippet(parentElement);
    }
  }

  private otherSubnippet = (snippet: Paragraph, element: Element, parentElement: Element) => {
    if (!['quote', 'comment'].includes(snippet.linkType ?? '')) {
      this.appendSnippet(parentElement);
    }
  }

  private figure = (snippet: Paragraph, element: Element): Element => {
    if (snippet.textcontent?.includes('<img')) {
      const imageElement = this.document.createElement('imageSnippet')
      imageElement.append(element)
      snippet.files?.map(file => {
        const image = imageElement.querySelector(`[title="${file.fileHash}"]`) as HTMLImageElement;
        image.src = `http://localhost:3000/images/${(file as Filecontainer & {accessHash: string}).accessHash}`;
      })
      return imageElement;
    }
    return element;
  }

  private textContentToHTML = (snippet: Paragraph, element: Element): Element => {
    element.innerHTML = snippet.textcontent ?? '';
    return element
  }

  private createDivEmptyElement = (): Element => {
    return this.document.createElement('div')
  }

  private deep = (snippet: Paragraph): Element => {
    return [this.textContentToHTML, this.figure].reduce(
      (result, currentFunction) => currentFunction(snippet, result), 
      this.createDivEmptyElement())
  }

  private wide = (snippet: Paragraph, element: Element, parentElement: Element) =>  {
    return [this.otherSubnippet, this.quote, this.comment].map(f => f(snippet, element, parentElement))
  }

  private paragraphToHTML = (snippet: Paragraph) => {
    const element = this.deep(snippet);
    if (snippet.subsnippets?.length && snippet.subsnippets?.length > 0){
      snippet.subsnippets.map(s => {
        const subElement = this.deep(s);
        this.wide(s, subElement, element);
      })
    } else {
      this.appendSnippet(element);
    }
  }

  async exportToPdf(
    snippets: Paragraph[],
    exportFile: string,
  ) {
    snippets.map((s: Paragraph) => this.paragraphToHTML(s))
    const browser = await puppeteer.launch({
      executablePath: process.env.CHROME_BIN,
      args: [
        '--no-sandbox',
        '--disable-gpu',
        '--single-process'
      ],
    });
    const page = await browser.newPage();
    await page.setContent(this.body.outerHTML);
    await page.addStyleTag({path: 'src/services/pdf.css'})
    await page.emulateMediaType('screen');
    await page.pdf({
      path: exportFile,
      margin: { top: '100px', right: '50px', bottom: '100px', left: '50px' },
      printBackground: true,
      format: 'A4',
    });
    await browser.close();
  }

}
