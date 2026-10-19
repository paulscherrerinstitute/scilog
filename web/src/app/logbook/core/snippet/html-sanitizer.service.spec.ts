import { SecurityContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';

import { HtmlSanitizerService } from './html-sanitizer.service';

describe('HtmlSanitizerService', () => {
  let service: HtmlSanitizerService;
  let domSanitizer: DomSanitizer;

  beforeEach(() => {
    service = TestBed.inject(HtmlSanitizerService);
    domSanitizer = TestBed.inject(DomSanitizer);
  });

  const sanitize = (html: string) =>
    domSanitizer.sanitize(SecurityContext.HTML, service.sanitize(html));

  it('keeps the styles CKEditor writes', () => {
    const html =
      '<figure class="image image_resized" style="width:42%;"><img src="a.png"></figure>' +
      '<p><span style="color:hsl(0, 75%, 60%);">red</span></p>';

    expect(sanitize(html)).toEqual(html);
  });

  it('removes scripts and event handlers', () => {
    expect(
      sanitize('<p>text</p><script>alert(1)</script><img src="x" onerror="alert(1)">'),
    ).toEqual('<p>text</p><img src="x">');
  });

  it('removes javascript: URLs', () => {
    expect(sanitize('<a href="javascript:alert(1)">link</a>')).not.toContain('javascript:');
  });

  it('removes style elements', () => {
    expect(sanitize('<p>text</p><style>body{display:none}</style>')).toEqual('<p>text</p>');
  });

  it('removes forms', () => {
    expect(
      sanitize(
        '<form action="https://example.com"><input type="password"><button>Log in</button></form>',
      ),
    ).toEqual('Log in');
  });

  it('removes file: URLs', () => {
    expect(sanitize('<a class="fileLink" href="file:abc">a.pdf</a>')).toEqual(
      '<a class="fileLink">a.pdf</a>',
    );
  });

  it('opens links in a new tab', () => {
    expect(sanitize('<a href="https://example.com">link</a>')).toEqual(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer">link</a>',
    );
  });

  it('keeps links to the same page in the same tab', () => {
    expect(sanitize('<a href="#top">top</a>')).toEqual('<a href="#top">top</a>');
  });
});
