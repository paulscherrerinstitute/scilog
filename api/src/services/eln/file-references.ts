import {JSDOM} from 'jsdom';

/**
 * Rewrite in-HTML file references to the file hashes assigned at import.
 *
 * ELN content references an embedded file by its archive path (the file's
 * RO-Crate `@id`); SciLog references it by the hash minted when the file is
 * created. Given a map from archive path to created file, rewrite every
 * reference that resolves to an imported file into SciLog's convention:
 *
 * - `<a href="<path>">`            → `<a href="file:<fileHash>">`
 * - `<img src="<path>" title=...>` → `<img title="<fileHash>" ...>`
 *   (src is left as-is; SciLog's frontend re-renders it from the file's
 *   accessHash at view time, using `title` as the discriminator.)
 *
 * A reference is recognised by its presence in `fileMap`, not by any path
 * syntax, so this is independent of which publisher produced the archive.
 * References that resolve to no imported file — external URLs, fragments, or
 * any path absent from `fileMap` — are left untouched.
 */
export function resolveFileReferences(
  html: string,
  fileMap: ReadonlyMap<string, {fileHash: string}>,
): string {
  const {document} = new JSDOM(html).window;

  for (const link of document.querySelectorAll('a[href]')) {
    const entry = fileMap.get(link.getAttribute('href') ?? '');
    if (entry) link.setAttribute('href', `file:${entry.fileHash}`);
  }
  for (const img of document.querySelectorAll('img[src]')) {
    const entry = fileMap.get(img.getAttribute('src') ?? '');
    if (entry) img.setAttribute('title', entry.fileHash);
  }

  return document.body.innerHTML;
}
