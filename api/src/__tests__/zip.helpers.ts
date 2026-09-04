import yauzl from 'yauzl';

export function listZipEntries(zip: Buffer): Promise<string[]> {
  return new Promise((resolve, reject) => {
    yauzl.fromBuffer(zip, {lazyEntries: true}, (err, zipfile) => {
      if (err) return reject(err);

      const entries: string[] = [];
      zipfile.readEntry();
      zipfile.on('entry', entry => {
        entries.push(entry.fileName);
        zipfile.readEntry();
      });
      zipfile.on('end', () => resolve(entries));
      zipfile.on('error', reject);
    });
  });
}
