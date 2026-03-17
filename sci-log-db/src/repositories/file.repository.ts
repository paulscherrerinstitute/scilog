import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {SnippetRepositoryMixin} from '../mixins';
import {FileRelations, Filesnippet} from '../models/file.model';
import {AutoAddRepository} from './autoadd.repository.base';
import crypto from 'crypto';
import {Db, GridFSBucket, ObjectId} from 'mongodb';
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
  }

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
    const db: Db = this.dataSource.connector.db;
    const cursor = db
      .collection('Basesnippet')
      .find(query)
      .project<FileDoc>({_id: 1, _fileId: 1});

    const count = await db.collection('Basesnippet').countDocuments(query);
    console.log(`Found ${count} files with missing metadata`);
    try {
      for await (const fileDoc of cursor) {
        await this.updateFileMetadata(fileDoc);
      }
    } catch (err) {
      console.error('Error occurred while migrating file metadata:', err);
    } finally {
      await cursor.close();
    }
  }

  private async updateFileMetadata(file: FileDoc): Promise<void> {
    const db: Db = this.dataSource.connector.db;
    const bucket: GridFSBucket = new mongodb.GridFSBucket(db);
    let contentSize = 0;
    const sha256 = crypto.createHash('sha256');
    try {
      const downloadStream = bucket.openDownloadStream(file._fileId);
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
      await db.collection('Basesnippet').updateOne(
        {_id: file._id},
        {
          $set: {
            contentSize,
            contentSha256,
          },
        },
      );
      console.log(
        `Updated file ${file._id} with contentSize=${contentSize} and contentSha256=${contentSha256}`,
      );
    } catch (err) {
      console.error(`Error processing file with id ${file._id}:`, err);
    }
  }
}
