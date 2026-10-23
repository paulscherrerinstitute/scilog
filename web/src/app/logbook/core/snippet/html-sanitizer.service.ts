import { Injectable, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import DOMPurify from 'dompurify';

const purify = DOMPurify(window);

// DOMPurify removes `target`. Put it back so links open in a new tab, as
// the editor's link settings do. `rel` follows the OWASP advice for such
// links.
purify.addHook('afterSanitizeAttributes', (node) => {
  if (
    node instanceof HTMLAnchorElement &&
    node.hasAttribute('href') &&
    !node.getAttribute('href').startsWith('#')
  ) {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

// The editor never writes these elements. `style` elements would restyle the
// whole app, and form elements could ask for passwords inside an entry.
const FORBID_TAGS = ['style', 'form', 'input', 'button', 'select', 'textarea'];

@Injectable({ providedIn: 'root' })
export class HtmlSanitizerService {
  private domSanitizer = inject(DomSanitizer);

  /**
   * Cleans HTML with DOMPurify and marks it as safe for Angular. Unlike
   * Angular's own sanitizer, DOMPurify keeps `style` attributes, which
   * CKEditor uses for image widths, table sizes and colors. Links open in a
   * new tab.
   *
   * This is the only place that may bypass Angular's sanitizer for HTML. If a
   * Content Security Policy ever enforces Trusted Types, it must allow the
   * `angular#unsafe-bypass` and `dompurify` policies.
   */
  sanitize(html: string): SafeHtml {
    return this.domSanitizer.bypassSecurityTrustHtml(purify.sanitize(html, { FORBID_TAGS }));
  }
}
