import yauzl from 'yauzl';

export async function listZipEntries(zip: Buffer): Promise<string[]> {
  const zipfile = await yauzl.fromBufferPromise(zip, {lazyEntries: true});
  const entries: string[] = [];
  for await (const entry of zipfile.eachEntry()) entries.push(entry.fileName);
  return entries;
}
