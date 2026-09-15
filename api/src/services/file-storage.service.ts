import {BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {GridFSBucket, GridFSBucketReadStream, ObjectId} from 'mongodb';
import crypto from 'node:crypto';
import {Readable, Transform} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {FileRepository} from '../repositories/file.repository';

/** Byte-derived metadata produced while streaming a file into storage. */
export type StoredFile = {
  fileId: string;
  contentSize: number;
  contentSha256: string;
};

/**
 * Bridge to GridFS for file byte storage.
 *
 * Owns the GridFSBucket so callers (controllers, import services) don't have
 * to know about the underlying mongo connection. Exposes only the operations
 * SciLog actually performs against the bucket.
 */
@injectable({scope: BindingScope.SINGLETON})
export class FileStorageService {
  private readonly bucket: GridFSBucket;

  constructor(@repository(FileRepository) fileRepository: FileRepository) {
    this.bucket = new GridFSBucket(fileRepository.dataSource.connector?.db);
  }

  /**
   * Pipe bytes into GridFS, deriving their size and sha256 in the same pass so
   * callers don't have to trust (or separately recompute) a client-supplied
   * size or hash.
   */
  async upload(source: Readable, filename: string): Promise<StoredFile> {
    const hash = crypto.createHash('sha256');
    let contentSize = 0;
    const meter = new Transform({
      transform(chunk: Buffer, _encoding, callback) {
        contentSize += chunk.length;
        hash.update(chunk);
        callback(null, chunk);
      },
    });

    const uploadStream = this.bucket.openUploadStream(filename);
    await pipeline(source, meter, uploadStream);

    return {
      fileId: uploadStream.id.toString(),
      contentSize,
      contentSha256: hash.digest('hex'),
    };
  }

  /** Open a read stream for a GridFS file id (caller pipes it where needed). */
  downloadStream(fileId: string | ObjectId): GridFSBucketReadStream {
    const id = typeof fileId === 'string' ? new ObjectId(fileId) : fileId;
    return this.bucket.openDownloadStream(id);
  }
}
