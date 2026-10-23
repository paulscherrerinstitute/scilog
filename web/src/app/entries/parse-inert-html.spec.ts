import { parseInertHtml } from './parse-inert-html';

describe('parseInertHtml', () => {
  it('parses HTML without running event handlers', async () => {
    const container = parseInertHtml(
      '<img src="invalid:" onerror="window.parseInertHtmlRan = true">',
    );
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(container.ownerDocument).not.toBe(document);
    expect(window['parseInertHtmlRan']).toBeUndefined();
  });

  it('keeps leading whitespace and elements that belong in the head', () => {
    const html = '\n<style>p { color: red; }</style><p>text</p>';

    expect(parseInertHtml(html).innerHTML).toEqual(html);
  });

  it('returns an empty container for undefined', () => {
    expect(parseInertHtml(undefined).innerHTML).toEqual('');
  });
});
