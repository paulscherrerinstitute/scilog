import yauzl from 'yauzl';
import {buffer} from 'node:stream/consumers';

export async function listZipEntries(zip: Buffer): Promise<string[]> {
  const zipfile = await yauzl.fromBufferPromise(zip, {lazyEntries: true});
  const entries: string[] = [];
  for await (const entry of zipfile.eachEntry()) entries.push(entry.fileName);
  return entries;
}

// Walk the zip and collect into a map of filename -> file-contents.
// Directory entries are skipped.
export async function readZipEntries(
  zip: Buffer,
): Promise<Map<string, Buffer>> {
  const zipfile = await yauzl.fromBufferPromise(zip, {lazyEntries: true});
  const entries = new Map<string, Buffer>();
  for await (const entry of zipfile.eachEntry()) {
    if (entry.fileName.endsWith('/')) continue;
    const readStream = await zipfile.openReadStreamPromise(entry);
    entries.set(entry.fileName, await buffer(readStream));
  }
  return entries;
}
