import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {SnippetRepositoryMixin} from '../mixins';
import {FileRelations, Filesnippet} from '../models/file.model';
import {AutoAddRepository} from './autoadd.repository.base';
import crypto from 'crypto';
import {AnyBulkWriteOperation, Db, GridFSBucket, ObjectId} from 'mongodb';
const mongodb = require('mongodb');

type FileDoc = {_id: string; _fileId: ObjectId};

export class FileRepository extends SnippetRepositoryMixin<
  Filesnippet,
  typeof Filesnippet.prototype.id,
  FileRelations,
  Constructor<
    DefaultCrudRepository<
      Filesnippet,
      typeof Filesnippet.prototype.id,
      FileRelations
    >
  >
>(AutoAddRepository) {
  constructor(@inject('datasources.mongo') dataSource: MongoDataSource) {
    super(Filesnippet, dataSource);
    this.db = this.dataSource.connector.db;
    this.bucket = new mongodb.GridFSBucket(this.db);
  }
  private db: Db;
  private bucket: GridFSBucket;

  public async migrateFileMetadata(): Promise<void> {
    const query = {
      $and: [
        {snippetType: 'image'},
        {
          $or: [
            {contentSize: {$exists: false}},
            {contentSha256: {$exists: false}},
          ],
        },
      ],
    };
    const count = await this.db.collection('Basesnippet').countDocuments(query);
    console.log(`Found ${count} files with missing metadata`);
    if (count === 0) {
      return;
    }
    const cursor = this.db
      .collection('Basesnippet')
      .find(query)
      .project<FileDoc>({_id: 1, _fileId: 1});

    const BATCH_SIZE = 1000;
    let bulkOps: AnyBulkWriteOperation[] = [];
    let processedCount = 0;
    try {
      for await (const fileDoc of cursor) {
        const data = await this.getFileMetadata(fileDoc);
        if (data) {
          bulkOps.push({
            updateOne: {
              filter: {_id: fileDoc._id},
              update: {
                $set: {
                  contentSize: data.contentSize,
                  contentSha256: data.contentSha256,
                },
              },
            },
          });
        }
        if (bulkOps.length >= BATCH_SIZE) {
          const bulkWriteResult = await this.db
            .collection('Basesnippet')
            .bulkWrite(bulkOps);
          processedCount += bulkWriteResult.modifiedCount;
          console.log(`Migrated ${processedCount}/${count} files...`);
          bulkOps = [];
        }
      }
      if (bulkOps.length > 0) {
        const bulkWriteResult = await this.db
          .collection('Basesnippet')
          .bulkWrite(bulkOps);
        processedCount += bulkWriteResult.modifiedCount;
        console.log(`Successfully migrated ${processedCount}/${count} files.`);
      }
    } catch (err) {
      console.error('Error occurred while migrating file metadata:', err);
    } finally {
      await cursor.close();
    }
  }

  private async getFileMetadata(
    file: FileDoc,
  ): Promise<{contentSize: number; contentSha256: string} | null> {
    let contentSize = 0;
    const sha256 = crypto.createHash('sha256');
    try {
      const downloadStream = this.bucket.openDownloadStream(file._fileId);
      await new Promise((resolve, reject) => {
        downloadStream.on('data', (chunk: Buffer) => {
          contentSize += chunk.length;
          sha256.update(chunk);
        });
        downloadStream.on('error', (err: unknown) => {
          console.error(`Error downloading file with id ${file._id}:`, err);
          reject(err);
        });
        downloadStream.on('end', () => {
          resolve(undefined);
        });
      });
      const contentSha256 = sha256.digest('hex');
      return {contentSize, contentSha256};
    } catch (err) {
      console.error(`Error processing file with id ${file._id}:`, err);
      return null;
    }
  }
}
