import {injectable, BindingScope} from '@loopback/core';
import archiver from 'archiver';
import {Response} from '@loopback/rest';
import {pipeline, Readable} from 'stream';

export interface AssetDescriptor {
  stream: Readable;
  archivePath: string;
}

@injectable({scope: BindingScope.TRANSIENT})
export class ArchiveService {
  constructor() {}

  async streamZipToResponse(
    assets: AssetDescriptor[],
    res: Response,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const archive = archiver('zip');

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
