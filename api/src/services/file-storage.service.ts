import {BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {GridFSBucket, GridFSBucketReadStream, ObjectId} from 'mongodb';
import {Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {FileRepository} from '../repositories/file.repository';

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

  /** Pipe bytes into GridFS. Returns the new GridFS file id. */
  async upload(source: Readable, filename: string): Promise<string> {
    const uploadStream = this.bucket.openUploadStream(filename);
    await pipeline(source, uploadStream);
    return uploadStream.id.toString();
  }

  /** Open a read stream for a GridFS file id (caller pipes it where needed). */
  downloadStream(fileId: string | ObjectId): GridFSBucketReadStream {
    const id = typeof fileId === 'string' ? new ObjectId(fileId) : fileId;
    return this.bucket.openDownloadStream(id);
  }
}
