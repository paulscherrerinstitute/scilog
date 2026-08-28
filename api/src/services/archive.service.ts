import {BindingScope, injectable} from '@loopback/core';
import archiver from 'archiver';
import {finished, Readable} from 'node:stream';

export interface AssetDescriptor {
  stream: Readable;
  archivePath: string;
}

@injectable({scope: BindingScope.SINGLETON})
export class ArchiveService {
  // Zip the given assets and return the archive as a readable stream.
  zipStream(assets: AssetDescriptor[]): Readable {
    const archive = archiver('zip');
    for (const {stream, archivePath} of assets) {
      stream.on('error', err => archive.destroy(err));
      archive.append(stream, {name: archivePath});
    }

    finished(archive, () => assets.forEach(({stream}) => stream.destroy()));

    archive.finalize().catch(err => archive.destroy(err));
    return archive;
  }
}
