import {BindingScope, injectable} from '@loopback/core';
import {ZipArchive} from 'archiver';
import {pipeline, Readable, Writable} from 'node:stream';

export interface AssetDescriptor {
  stream: Readable;
  archivePath: string;
}

@injectable({scope: BindingScope.TRANSIENT})
export class ArchiveService {
  constructor() {}

  async streamZipToResponse(
    assets: AssetDescriptor[],
    res: Writable,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const archive = new ZipArchive();

      for (const asset of assets) {
        archive.append(asset.stream, {name: asset.archivePath});
      }

      pipeline(archive, res, err => {
        if (err) {
          console.error('Error in archive/response pipeline', err);
          reject(err);
        } else {
          resolve();
        }
      });
      // eslint-disable-next-line no-void
      void archive.finalize();
    });
  }
}
