/**
 * Parses HTML into a detached element without loading images or running event
 * handlers, so stored HTML can be changed before it is sanitized. Elements
 * created in the page's own document would load images right away, and an
 * `onerror` attribute would run.
 */
export function parseInertHtml(html: string | undefined): HTMLElement {
  // `<remove>` starts the body, so leading whitespace and elements like
  // `<style>` stay in it instead of moving to `<head>`. Angular and DOMPurify
  // parse HTML the same way.
  const body = new DOMParser().parseFromString(
    '<body><remove></remove>' + (html ?? ''),
    'text/html',
  ).body;
  body.firstChild.remove();
  return body;
}
