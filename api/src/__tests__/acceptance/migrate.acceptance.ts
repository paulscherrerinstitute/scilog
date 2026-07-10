import {expect} from '@loopback/testlab';
import {Suite} from 'mocha';
import {SciLogDbApplication} from '../..';
import {clearDatabase, setupApplication} from './test-helper';
import {createSandbox} from 'sinon';
import {FileRepository, ParagraphRepository} from '../../repositories';
import * as util from '../../utils/misc';
import {Db, GridFSBucket} from 'mongodb';
const mongodb = require('mongodb');
import fs from 'fs';
import {testdb} from '../testdb.datasource';
import path from 'path';

describe('Migrate', function (this: Suite) {
  this.timeout(5000);
  let app: SciLogDbApplication;
  const sandbox = createSandbox();

  before('setupApplication', async () => {
    app = (await setupApplication()).app;
    await clearDatabase(app);
  });

  afterEach(done => {
    sandbox.restore();
    done();
  });

  it('test migrateHtmlTexcontent', async () => {
    const paragraph = await app.getRepository(ParagraphRepository);
    await paragraph.execute('Paragraph', 'insertOne', {
      id: '123',
      ownerGroup: 'paragraphAcceptance',
      textcontent: '<p></p>',
    });
    await paragraph.execute('Paragraph', 'insertOne', {
      id: '456',
      ownerGroup: 'paragraphAcceptance',
      textcontent: '<p>h &hearts;</p>',
    });
    const sanitizeTextContentStub = sandbox
      .stub(util, 'sanitizeTextContent')
      .callThrough();
    await paragraph.migrateHtmlTexcontent();
    expect(sanitizeTextContentStub.callCount).to.be.eql(2);
    expect(sanitizeTextContentStub.args[0][0]).to.be.eql('<p></p>');
    expect(
      (
        await paragraph.execute('Paragraph', 'findOne', {
          id: '123',
        })
      ).htmlTextcontent,
    ).to.be.eql(undefined);
    expect(sanitizeTextContentStub.args[1][0]).to.be.eql('<p>h &hearts;</p>');
    expect(
      (
        await paragraph.execute('Paragraph', 'findOne', {
          id: '456',
        })
      ).htmlTextcontent,
    ).to.be.eql('h ♥');
  });

  it('test migrateFileMetadata', async () => {
    const fileRepo = await app.getRepository(FileRepository);
    const id = await givenFileSnippet();
    await fileRepo.migrateFileMetadata();
    const db: Db = testdb?.connector?.db;
    const updatedDoc = await db.collection('Basesnippet').findOne({_id: id});
    expect(updatedDoc).to.have.property('contentSize', 14);
    expect(updatedDoc).to.have.property(
      'contentSha256',
      'c98c24b677eff44860afea6f493bbaec5bb1c4cbb209c6fc2bbb47f66ff2ad31',
    );
  });

  async function givenFileSnippet() {
    const db: Db = testdb?.connector?.db;
    const bucket: GridFSBucket = new mongodb.GridFSBucket(db);
    const uploadStream = bucket.openUploadStream('hello.txt');
    fs.createReadStream(
      path.resolve('src', '__tests__', 'test-data', 'hello.txt'),
    ).pipe(uploadStream);
    await new Promise((resolve, reject) => {
      uploadStream.on('error', (err: unknown) => {
        console.error('Error uploading file:', err);
        reject(err);
      });
      uploadStream.on('finish', () => {
        console.log('File uploaded successfully with id:', uploadStream.id);
        resolve(undefined);
      });
    });
    try {
      const doc = await db.collection('Basesnippet').insertOne({
        snippetType: 'image',
        _fileId: uploadStream.id,
      });
      console.log('File snippet inserted into Basesnippet collection');
      return doc.insertedId;
    } catch (error) {
      console.error('Error inserting file snippet:', error);
      throw error;
    }
  }
});
