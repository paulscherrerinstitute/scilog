import {BindingScope, injectable} from '@loopback/core';
import archiver from 'archiver';
import {finished, Readable} from 'node:stream';

export interface AssetDescriptor {
  // A null stream + an archivePath with trailing slash indicates
  // to zipStream to create a directory entry
  // This is NOT required by the zip format, but only a temporary
  // measure until the following
  // TO-DO: Remove once https://github.com/paulscherrerinstitute/scicat-rocrate/issues/338 deployed
  stream: Readable | null;
  archivePath: string;
}

@injectable({scope: BindingScope.SINGLETON})
export class ArchiveService {
  // Zip the given assets and return the archive as a readable stream.
  zipStream(assets: AssetDescriptor[]): Readable {
    const archive = archiver('zip');
    for (const {stream, archivePath} of assets) {
      // TO-DO: Remove this branch
      // once https://github.com/paulscherrerinstitute/scicat-rocrate/issues/338 deployed
      if (stream === null) {
        // archiver reads the trailing slash and writes a directory entry.
        archive.append('', {name: archivePath});
        continue;
      }
      stream.on('error', err => archive.destroy(err));
      archive.append(stream, {name: archivePath});
    }

    finished(archive, () => assets.forEach(({stream}) => stream?.destroy()));

    archive.finalize().catch(err => archive.destroy(err));
    return archive;
  }
}
