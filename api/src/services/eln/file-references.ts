import {JSDOM} from 'jsdom';

/**
 * Rewrite in-HTML file references to the file hashes assigned at import.
 *
 * ELN content references embedded files by their archive-relative path; SciLog
 * references them by the hash minted when the file is created. Given a map from
 * archive path to created file, rewrite a paragraph's HTML into SciLog's
 * convention:
 *
 * - `<a href="./<path>">`            → `<a href="file:<fileHash>">`
 * - `<img src="./<path>" title=...>` → `<img title="<fileHash>" ...>`
 *   (src is left as-is; SciLog's frontend re-renders it from the file's
 *   accessHash at view time, using `title` as the discriminator.)
 *
 * Throws if an internal reference is absent from `fileMap` — the caller is
 * contractually required to supply a complete map.
 */
export function resolveFileReferences(
  html: string,
  fileMap: ReadonlyMap<string, {fileHash: string}>,
): string {
  const dom = new JSDOM(html);
  const {document} = dom.window;

  const rewriteRef = (
    el: Element,
    readAttr: string,
    writeAttr: string,
    format: (hash: string) => string,
  ) => {
    const ref = el.getAttribute(readAttr) ?? '';
    if (!ref.startsWith('./')) return;
    const entry = fileMap.get(ref);
    if (!entry) {
      throw new Error(
        `resolveFileReferences: no file map entry for ${readAttr} ${ref}`,
      );
    }
    el.setAttribute(writeAttr, format(entry.fileHash));
  };

  for (const link of document.querySelectorAll('a[href]'))
    rewriteRef(link, 'href', 'href', hash => `file:${hash}`);
  for (const img of document.querySelectorAll('img[src]'))
    rewriteRef(img, 'src', 'title', hash => hash);

  return document.body.innerHTML;
}
