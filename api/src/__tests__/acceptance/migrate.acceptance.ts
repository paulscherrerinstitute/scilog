import {expect} from '@loopback/testlab';
import {Suite} from 'mocha';
import {SciLogDbApplication} from '../..';
import {clearDatabase, setupApplication} from './test-helper';
import {
  BasesnippetRepository,
  FileRepository,
  ParagraphRepository,
} from '../../repositories';
import {Db, GridFSBucket} from 'mongodb';
import fs from 'fs';
import {testdb} from '../testdb.datasource';
import path from 'path';

describe('Migrate', function (this: Suite) {
  this.timeout(5000);
  let app: SciLogDbApplication;

  before('setupApplication', async () => {
    app = (await setupApplication()).app;
    await clearDatabase(app);
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
    await paragraph.migrateHtmlTexcontent();
    expect(
      (
        await paragraph.execute('Paragraph', 'findOne', {
          id: '123',
        })
      ).htmlTextcontent,
    ).to.be.eql(undefined);
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

  describe('migrateImageSizes', () => {
    const figure = (img = '<img src="" title="h1">') =>
      `<figure class="image image_resized">${img}</figure>`;

    it('moves a px or % width to the figure', async () => {
      const px = await givenMigratedSnippet(figure(), {width: '302px'});
      expect(px.textcontent).to.equal(
        '<figure class="image image_resized" style="width: 302px;"><img src="" title="h1"></figure>',
      );
      expect(px.files).to.eql([
        {fileHash: 'h1', legacyStyle: {width: '302px', height: ''}},
      ]);

      const percent = await givenMigratedSnippet(
        '<figure class="image"><img src="" title="h1"></figure>',
        {width: '71.57%'},
      );
      expect(percent.textcontent).to.equal(
        '<figure class="image image_resized" style="width: 71.57%;"><img src="" title="h1"></figure>',
      );
    });

    it('keeps the natural size of the image', async () => {
      const img =
        '<img style="aspect-ratio:1546/480;" src="" width="1546" height="480" title="h1">';
      const doc = await givenMigratedSnippet(figure(img), {width: '76.86%'});
      expect(doc.textcontent).to.equal(
        `<figure class="image image_resized" style="width: 76.86%;">${img}</figure>`,
      );
    });

    it('removes a % width attribute from the image', async () => {
      const img = (width: string) =>
        `<img style="aspect-ratio:${width}/220;" src="" width="${width}" height="220" title="h1">`;
      const defaultWidth = await givenMigratedSnippet(figure(img('85%')), {
        width: '85%',
      });
      expect(defaultWidth.textcontent).to.equal(
        '<figure class="image"><img src="" title="h1"></figure>',
      );
      expect(defaultWidth.files[0]).to.not.have.property('style');

      const resized = await givenMigratedSnippet(figure(img('65.16%')), {
        width: '65.16%',
      });
      expect(resized.textcontent).to.equal(
        '<figure class="image image_resized" style="width: 65.16%;"><img src="" title="h1"></figure>',
      );
    });

    it('keeps other styles of the image and the figure', async () => {
      const doc = await givenMigratedSnippet(
        '<figure class="image image-style-side" style="float:left"><img style="aspect-ratio:85%/220;color:red" src="" width="85%" title="h1"></figure>',
        {width: '302px'},
      );
      expect(doc.textcontent).to.equal(
        '<figure class="image image-style-side image_resized" style="float: left; width: 302px;"><img style="color: red;" src="" title="h1"></figure>',
      );
    });

    it('drops a default or empty width', async () => {
      for (const width of ['82.25%', '85%', '']) {
        const doc = await givenMigratedSnippet(figure(), {width});
        expect(doc.textcontent).to.equal(
          '<figure class="image"><img src="" title="h1"></figure>',
        );
        expect(doc.files).to.eql([
          {fileHash: 'h1', legacyStyle: {width, height: ''}},
        ]);

        const inline = '<p>a <img src="" title="h1"></p>';
        const inlineDoc = await givenMigratedSnippet(inline, {width});
        expect(inlineDoc.textcontent).to.equal(inline);
        expect(inlineDoc.files).to.eql([
          {fileHash: 'h1', legacyStyle: {width, height: ''}},
        ]);
      }
      const natural =
        '<figure class="image"><img style="aspect-ratio:812/463;" src="" width="812" height="463" title="h1"></figure>';
      const doc = await givenMigratedSnippet(natural, {width: ''});
      expect(doc.textcontent).to.equal(natural);
    });

    it('keeps a width the HTML already has', async () => {
      const html =
        '<figure class="image image_resized" style="width:300px"><img src="" title="h1"></figure>';
      for (const width of ['600px', 'auto']) {
        const doc = await givenMigratedSnippet(html, {width});
        expect(doc.textcontent).to.equal(html);
        expect(doc.files).to.eql([
          {fileHash: 'h1', legacyStyle: {width, height: ''}},
        ]);
      }

      const inline =
        '<p><img class="image_resized" style="width:20px;" src="" title="h1"></p>';
      const doc = await givenMigratedSnippet(inline, {width: '85%'});
      expect(doc.textcontent).to.equal(inline);
    });

    it('moves a width to an image outside a figure', async () => {
      for (const width of ['13px', '50%']) {
        const doc = await givenMigratedSnippet(
          '<p>a <img src="" title="h1"></p>',
          {width},
        );
        expect(doc.textcontent).to.equal(
          `<p>a <img src="" title="h1" style="width: ${width};" class="image_resized"></p>`,
        );
      }
    });

    it('removes a % width attribute from an image outside a figure', async () => {
      const doc = await givenMigratedSnippet(
        '<p><img style="aspect-ratio:85%/220;" src="" width="85%" height="220" title="h1"></p>',
        {width: '85%'},
      );
      expect(doc.textcontent).to.equal('<p><img src="" title="h1"></p>');
    });

    it('removes image_resized from a target without a width', async () => {
      const inline = await givenMigratedSnippet(
        '<p><img class="image_resized" src="" title="h1"></p>',
        {width: ''},
      );
      expect(inline.textcontent).to.equal('<p><img src="" title="h1"></p>');

      const block = await givenMigratedSnippet(
        '<figure class="image image-style-side image_resized"><img src="" title="h1"></figure>',
        {width: '82.25%'},
      );
      expect(block.textcontent).to.equal(
        '<figure class="image image-style-side"><img src="" title="h1"></figure>',
      );
    });

    it('moves a bare number as a px width', async () => {
      const block = await givenMigratedSnippet(figure(), {width: '584'});
      expect(block.textcontent).to.equal(
        '<figure class="image image_resized" style="width: 584px;"><img src="" title="h1"></figure>',
      );

      const inline = await givenMigratedSnippet(
        '<p><img src="" title="h1" width="584" height="409"></p>',
        {width: '584'},
      );
      expect(inline.textcontent).to.equal(
        '<p><img src="" title="h1" width="584" height="409" style="width: 584px;" class="image_resized"></p>',
      );
    });

    it('migrates older versions of a snippet', async () => {
      const doc = await givenMigratedSnippet(
        figure(),
        {width: '302px'},
        'updated',
      );
      expect(doc.textcontent).to.equal(
        '<figure class="image image_resized" style="width: 302px;"><img src="" title="h1"></figure>',
      );
    });

    it('keeps the style of files no case covers', async () => {
      const cases: [string, string][] = [
        ['<p><img src="" title="h1"></p>', 'auto'],
        [figure(), 'auto'],
        ['<p><a class="fileLink" href="file:h1">a.ps</a></p>', '226px'],
      ];
      for (const [html, width] of cases) {
        const doc = await givenMigratedSnippet(html, {width});
        expect(doc.textcontent).to.equal(html);
        expect(doc.files).to.eql([
          {fileHash: 'h1', style: {width, height: ''}},
        ]);
      }
    });

    it('migrates every image of a file, or none', async () => {
      const both = await givenMigratedSnippet(figure() + figure(), {
        width: '302px',
      });
      const migrated =
        '<figure class="image image_resized" style="width: 302px;"><img src="" title="h1"></figure>';
      expect(both.textcontent).to.equal(migrated + migrated);
      expect(both.files[0]).to.have.property('legacyStyle');

      // `auto` is kept for a figure with a width, but not for one without.
      const partly =
        '<figure class="image" style="width:300px"><img src="" title="h1"></figure>' +
        figure();
      const doc = await givenMigratedSnippet(partly, {width: 'auto'});
      expect(doc.textcontent).to.equal(partly);
      expect(doc.files).to.eql([
        {fileHash: 'h1', style: {width: 'auto', height: ''}},
      ]);
    });

    it('keeps the other files and fields of the snippet', async () => {
      const updatedAt = new Date('2024-01-02T03:04:05Z');
      const attachment = {fileHash: 'a1', fileExtension: 'file/pdf'};
      const doc = await givenMigratedDoc({
        snippetType: 'paragraph',
        textcontent: figure(),
        updatedAt,
        updatedBy: 'someone@example.com',
        files: [
          attachment,
          {fileHash: 'h1', fileId: 'f1', style: {width: '302px', height: ''}},
        ],
      });
      expect(doc.updatedAt).to.eql(updatedAt);
      expect(doc.updatedBy).to.equal('someone@example.com');
      expect(doc.files).to.eql([
        attachment,
        {
          fileHash: 'h1',
          fileId: 'f1',
          legacyStyle: {width: '302px', height: ''},
        },
      ]);
    });

    it('changes nothing when it runs again', async () => {
      const first = await givenMigratedSnippet(figure(), {width: '302px'});
      const repository = await app.getRepository(BasesnippetRepository);
      await repository.migrateImageSizes();
      const db: Db = testdb?.connector?.db;
      const second = await db
        .collection('Basesnippet')
        .findOne({_id: first._id});
      expect(second).to.eql(first);
    });

    async function givenMigratedSnippet(
      textcontent: string,
      style: {width: string},
      snippetType = 'paragraph',
    ) {
      return givenMigratedDoc({
        snippetType,
        textcontent,
        files: [{fileHash: 'h1', style: {...style, height: ''}}],
      });
    }

    async function givenMigratedDoc(snippet: object) {
      const db: Db = testdb?.connector?.db;
      const {insertedId} = await db
        .collection('Basesnippet')
        .insertOne(snippet);
      const repository = await app.getRepository(BasesnippetRepository);
      await repository.migrateImageSizes();
      const doc = await db.collection('Basesnippet').findOne({_id: insertedId});
      return doc!;
    }
  });

  async function givenFileSnippet() {
    const db: Db = testdb?.connector?.db;
    const bucket: GridFSBucket = new GridFSBucket(db);
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
