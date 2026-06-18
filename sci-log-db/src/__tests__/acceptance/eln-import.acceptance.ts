import {Client, expect} from '@loopback/testlab';
import {Suite} from 'mocha';
import crypto from 'node:crypto';
import path from 'path';
import {SciLogDbApplication} from '../..';
import {Logbook, Paragraph} from '../../models';
import {Filesnippet} from '../../models/file.model';
import {ElnErrorCode} from '../../services/eln-archive';
import {buildElnZip, validElnCrate} from '../eln.helpers';
import {
  clearDatabase,
  createUserToken,
  setupApplication,
  userData,
} from './test-helper';

const SCILOG_ELN_PATH = path.resolve(
  'src',
  '__tests__',
  'test-data',
  'scilog.eln',
);

const OWNER_GROUP = 'elnImportAcceptance';

describe('Logbook .eln import', function (this: Suite) {
  this.timeout(30000);

  let app: SciLogDbApplication;
  let client: Client;
  let token: string;
  let locationId: string;

  before(async () => {
    ({app, client} = await setupApplication());
    await clearDatabase(app);
    token = await createUserToken(app, client, [OWNER_GROUP]);

    const locationResponse = await client
      .post('/locations')
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send({
        ownerGroup: OWNER_GROUP,
        name: 'elnImportLocation',
        location: 'elnImportLocation',
      })
      .expect(200);
    locationId = locationResponse.body.id;
  });

  after(async () => {
    await clearDatabase(app);
    if (app != null) await app.stop();
  });

  describe('authorization', () => {
    it('returns 401 without a token', async () => {
      const r = await client
        .post(`/logbooks/import/eln?location-id=${locationId}`)
        .attach('file', SCILOG_ELN_PATH)
        .expect(401);
      expect(r.body.error).to.deepEqual({
        statusCode: 401,
        name: 'UnauthorizedError',
        message: 'Authorization header not found.',
      });
    });
  });

  describe('input validation', () => {
    it('returns 422 when no file is attached', async () => {
      const r = await client
        .post(`/logbooks/import/eln?location-id=${locationId}`)
        .set('Authorization', 'Bearer ' + token)
        .field('dummy', 'x')
        .expect(422);
      expect(r.body.error).to.deepEqual({
        statusCode: 422,
        name: 'UnprocessableEntityError',
        message: 'A file must be provided',
      });
    });

    it('returns 400 when location-id is missing', async () => {
      const r = await client
        .post('/logbooks/import/eln')
        .set('Authorization', 'Bearer ' + token)
        .attach('file', SCILOG_ELN_PATH)
        .expect(400);
      expect(r.body.error).to.deepEqual({
        statusCode: 400,
        name: 'BadRequestError',
        message: 'Required parameter location-id is missing!',
        code: 'MISSING_REQUIRED_PARAMETER',
      });
    });

    it('returns 404 when location-id does not exist', async () => {
      const r = await client
        .post('/logbooks/import/eln?location-id=000000000000000000000000')
        .set('Authorization', 'Bearer ' + token)
        .attach('file', SCILOG_ELN_PATH)
        .expect(404);
      expect(r.body.error).to.deepEqual({
        statusCode: 404,
        name: 'Error',
        message:
          'Entity not found: Location with id "000000000000000000000000"',
        code: 'ENTITY_NOT_FOUND',
      });
    });

    it('returns 422 when multiple files are attached', async () => {
      const r = await client
        .post(`/logbooks/import/eln?location-id=${locationId}`)
        .set('Authorization', 'Bearer ' + token)
        .attach('file', Buffer.from('a'), 'a.eln')
        .attach('file', Buffer.from('b'), 'b.eln')
        .expect(422);
      expect(r.body.error).to.deepEqual({
        statusCode: 422,
        name: 'UnprocessableEntityError',
        message: 'options.maxFiles (1) exceeded',
      });
    });

    it('returns 413 when the upload exceeds 100 MB', async () => {
      const big = Buffer.alloc(100 * 1024 * 1024 + 1);
      const r = await client
        .post(`/logbooks/import/eln?location-id=${locationId}`)
        .set('Authorization', 'Bearer ' + token)
        .attach('file', big, 'big.eln')
        .expect(413);
      expect(r.body.error).to.deepEqual({
        statusCode: 413,
        name: 'PayloadTooLargeError',
        message:
          'options.maxTotalFileSize (104857600 bytes) exceeded, received 104857601 bytes of file data',
      });
    });
  });

  describe('archive integrity', () => {
    it('returns 422 when the upload is not a zip', async () => {
      const r = await client
        .post(`/logbooks/import/eln?location-id=${locationId}`)
        .set('Authorization', 'Bearer ' + token)
        .attach('file', Buffer.from('not a zip'), 'bad.eln')
        .expect(422);
      expect(r.body.error).to.deepEqual({
        statusCode: 422,
        name: 'UnprocessableEntityError',
        message: 'Archive validation failed',
        details: [
          {
            code: ElnErrorCode.INVALID_ELN_ARCHIVE,
            message:
              'Could not read .eln archive: End of central directory record signature not found. ' +
              'Either not a zip file, or file is truncated.',
          },
        ],
      });
    });

    it('returns 422 when the zip lacks a single root folder', async () => {
      const eln = await buildElnZip(
        new Map([
          [
            'ro-crate-metadata.json',
            Buffer.from(JSON.stringify(validElnCrate().toJSON())),
          ],
        ]),
      );
      const r = await client
        .post(`/logbooks/import/eln?location-id=${locationId}`)
        .set('Authorization', 'Bearer ' + token)
        .attach('file', eln, 'flat.eln')
        .expect(422);
      expect(r.body.error).to.deepEqual({
        statusCode: 422,
        name: 'UnprocessableEntityError',
        message: 'Archive validation failed',
        details: [
          {
            code: ElnErrorCode.INVALID_ELN_STRUCTURE,
            message: 'Archive must contain a single root folder',
          },
        ],
      });
    });

    it('returns 422 when ro-crate-metadata.json is missing', async () => {
      const eln = await buildElnZip(
        new Map([['eln-export/something-else.txt', Buffer.from('hi')]]),
      );
      const r = await client
        .post(`/logbooks/import/eln?location-id=${locationId}`)
        .set('Authorization', 'Bearer ' + token)
        .attach('file', eln, 'no-meta.eln')
        .expect(422);
      expect(r.body.error).to.deepEqual({
        statusCode: 422,
        name: 'UnprocessableEntityError',
        message: 'Archive validation failed',
        details: [
          {
            code: ElnErrorCode.MISSING_ELN_METADATA,
            message: 'Missing ro-crate-metadata.json in archive root folder',
          },
        ],
      });
    });

    it('returns 422 when a referenced file is missing from the zip', async () => {
      const crate = validElnCrate();
      crate.addEntity({
        '@id': './book/missing.jpg',
        '@type': 'File',
        name: 'missing.jpg',
        encodingFormat: 'image/jpeg',
        contentSize: '100',
        sha256: '0'.repeat(64),
      });
      crate.addValues('./book/', 'hasPart', {'@id': './book/missing.jpg'});

      const eln = await buildElnZip(
        new Map([
          [
            'eln-export/ro-crate-metadata.json',
            Buffer.from(JSON.stringify(crate.toJSON())),
          ],
          // the referenced file is deliberately absent from the zip
        ]),
      );
      const r = await client
        .post(`/logbooks/import/eln?location-id=${locationId}`)
        .set('Authorization', 'Bearer ' + token)
        .attach('file', eln, 'missing-file.eln')
        .expect(422);
      // Two errors: the default ./book/file.txt from validElnCrate is also
      // absent from our entries map, plus our intended ./book/missing.jpg.
      expect(r.body.error).to.deepEqual({
        statusCode: 422,
        name: 'UnprocessableEntityError',
        message: 'Archive validation failed',
        details: [
          {
            code: ElnErrorCode.MISSING_ELN_FILE,
            message: 'File ./book/file.txt not found in archive',
          },
          {
            code: ElnErrorCode.MISSING_ELN_FILE,
            message: 'File ./book/missing.jpg not found in archive',
          },
        ],
      });
    });

    it('returns 422 when a file sha256 does not match the metadata', async () => {
      const content = Buffer.from('the actual bytes');
      const wrongSha = '0'.repeat(64);
      const crate = validElnCrate();
      crate.addEntity({
        '@id': './book/data.txt',
        '@type': 'File',
        name: 'data.txt',
        encodingFormat: 'text/plain',
        contentSize: String(content.length),
        sha256: wrongSha,
      });
      crate.addValues('./book/', 'hasPart', {'@id': './book/data.txt'});

      const eln = await buildElnZip(
        new Map([
          [
            'eln-export/ro-crate-metadata.json',
            Buffer.from(JSON.stringify(crate.toJSON())),
          ],
          ['eln-export/book/data.txt', content],
        ]),
      );
      const r = await client
        .post(`/logbooks/import/eln?location-id=${locationId}`)
        .set('Authorization', 'Bearer ' + token)
        .attach('file', eln, 'bad-sha.eln')
        .expect(422);
      // Two errors: the default ./book/file.txt from validElnCrate is also
      // absent, plus the intended checksum mismatch on ./book/data.txt.
      expect(r.body.error).to.deepEqual({
        statusCode: 422,
        name: 'UnprocessableEntityError',
        message: 'Archive validation failed',
        details: [
          {
            code: ElnErrorCode.MISSING_ELN_FILE,
            message: 'File ./book/file.txt not found in archive',
          },
          {
            code: ElnErrorCode.INVALID_ELN_CHECKSUM,
            message:
              'File ./book/data.txt: expected sha256 ' +
              wrongSha +
              ', got 9cc3331eca83404db7aa7398d8a8e122596158c7500bc512fc3835b11ce6ca96',
          },
        ],
      });
    });
  });

  describe('metadata validation', () => {
    it('returns 422 with validation errors for a malformed ro-crate', async () => {
      // well-formed zip, ill-formed RO-Crate (no root Dataset)
      const eln = await buildElnZip(
        new Map([
          [
            'eln-export/ro-crate-metadata.json',
            Buffer.from(
              JSON.stringify({
                '@context': 'https://w3id.org/ro/crate/1.2/context',
                '@graph': [],
              }),
            ),
          ],
        ]),
      );
      const r = await client
        .post(`/logbooks/import/eln?location-id=${locationId}`)
        .set('Authorization', 'Bearer ' + token)
        .attach('file', eln, 'malformed.eln')
        .expect(422);
      expect(r.body.error).to.deepEqual({
        statusCode: 422,
        name: 'UnprocessableEntityError',
        message: 'Archive validation failed',
        details: [
          {
            code: ElnErrorCode.MISSING_ELN_FIELD,
            message: 'Missing sdPublisher',
          },
          {
            code: ElnErrorCode.MISSING_DATASET_FIELD,
            message: 'Dataset ./: missing name',
          },
          {
            code: ElnErrorCode.MISSING_DATASET_FIELD,
            message: 'Dataset ./: missing author',
          },
        ],
      });
    });
  });

  describe('importing scilog.eln', () => {
    const ORIGINAL_ELN_JPEG_PATH =
      /696e3f8bd55e4c64c058ceac\/696e3f8b61107b830b1eff20\.jpeg/;

    let logbook: Logbook;
    let paragraphs: Paragraph[];
    let commentedParagraph: Paragraph;
    let comments: Paragraph[];
    let files: Filesnippet[];

    before(async () => {
      const importResponse = await client
        .post(`/logbooks/import/eln?location-id=${locationId}`)
        .set('Authorization', 'Bearer ' + token)
        .attach('file', SCILOG_ELN_PATH);
      if (importResponse.status !== 201) {
        console.log(
          'scilog.eln import failed:',
          JSON.stringify(importResponse.body, null, 2),
        );
      }
      expect(importResponse.status).to.equal(201);
      logbook = importResponse.body;

      const probeFilter = JSON.stringify({include: ['subsnippets']});
      const probeGetLogbook = await client
        .get(`/logbooks/${logbook.id}?filter=${probeFilter}`)
        .set('Authorization', 'Bearer ' + token);
      console.log('[probe] GET /logbooks/{id} status:', probeGetLogbook.status);
      console.log(
        '[probe] GET /logbooks/{id} subsnippets:',
        probeGetLogbook.body.subsnippets?.length,
      );

      const probeGetBasesnippet = await client
        .get(`/basesnippets/${logbook.id}?filter=${probeFilter}`)
        .set('Authorization', 'Bearer ' + token);
      console.log(
        '[probe] GET /basesnippets/{id} status:',
        probeGetBasesnippet.status,
      );
      console.log(
        '[probe] GET /basesnippets/{id} subsnippets:',
        probeGetBasesnippet.body.subsnippets?.length,
      );

      const probeChildren = await client
        .get(
          `/basesnippets?filter=${JSON.stringify({where: {parentId: logbook.id}})}`,
        )
        .set('Authorization', 'Bearer ' + token);
      console.log(
        '[probe] children with parentId=logbook.id:',
        probeChildren.body.length,
      );
      expect(logbook.subsnippets).to.be.an.Array();
      paragraphs = (logbook.subsnippets ?? []).filter(
        (s): s is Paragraph => (s as Paragraph).linkType === 'paragraph',
      );

      // Comments are paragraphs with linkType=comment parented to one of
      // our paragraphs — fetch them by querying /paragraphs directly
      // (LB4's hasMany include doesn't recurse).
      const paragraphIds = paragraphs.map(p => p.id);
      comments = (
        await client
          .get('/paragraphs')
          .set('Authorization', 'Bearer ' + token)
          .query({
            filter: JSON.stringify({
              where: {
                linkType: 'comment',
                parentId: {inq: paragraphIds},
              },
            }),
          })
          .expect(200)
      ).body;
      commentedParagraph = paragraphs.find(p =>
        comments.some(
          c => (c as Paragraph & {parentId: string}).parentId === p.id,
        ),
      )!;
      expect(commentedParagraph).to.not.be.undefined();

      // Files are free-floating Filesnippets (no parentId in our model);
      // fetch via /filesnippet — the test database starts empty.
      files = (
        await client
          .get('/filesnippet')
          .set('Authorization', 'Bearer ' + token)
          .expect(200)
      ).body;
    });

    describe('logbook', () => {
      it('creates a logbook with metadata from the eln', () => {
        expect(logbook.snippetType).to.equal('logbook');
        expect(logbook.name).to.equal('logbook-001');
        expect(logbook.description).to.equal('test new logbook');
      });

      it('attaches the logbook to the given location', () => {
        expect(logbook.location).to.equal(locationId);
      });

      it('records the importing user as createdBy', () => {
        expect(logbook.createdBy).to.equal(userData.email);
      });

      it('tags the logbook with import provenance', () => {
        expect(logbook.tags).to.containDeep([
          'eln:source:scilog',
          'eln:author:omkar.zade@psi.ch',
          'eln:created:2026-01-19',
        ]);
      });
    });

    describe('paragraphs', () => {
      it('creates one paragraph per top-level Message entity', () => {
        expect(paragraphs).to.have.length(5);
        expect(paragraphs.every(p => p.linkType === 'paragraph')).to.be.true();
      });

      it('preserves the HTML content of each paragraph', () => {
        expect(commentedParagraph.textcontent?.toLowerCase()).to.containEql(
          'hello world',
        );
      });

      it('rewrites img title to the new fileHash', () => {
        const jpegParagraph = paragraphs.find(p =>
          p.textcontent?.includes('<img'),
        )!;
        const filecontainer = jpegParagraph.files?.[0];
        expect(filecontainer).to.not.be.undefined();
        // the rewritten HTML's <img title=...> should match the new fileHash
        // the Filecontainer was created with.
        expect(jpegParagraph.textcontent).to.match(
          new RegExp(`title="${filecontainer!.fileHash}"`),
        );
        // src is left as-is (a SciLog frontend concern, rendered from
        // accessHash at view time), so the original ELN path still
        // appears in src — used to silence the unused-regex import.
        expect(jpegParagraph.textcontent).to.match(ORIGINAL_ELN_JPEG_PATH);
      });

      it('tags paragraphs with original keywords and provenance', () => {
        expect(commentedParagraph.tags).to.containDeep([
          'ctag',
          'dtag',
          'ftag',
          'eln:source:scilog',
          'eln:author:omkar.zade@psi.ch',
          'eln:created:2026-01-26',
        ]);
      });
    });

    describe('comments', () => {
      it('attaches comments to the paragraph referenced by parentItem', () => {
        expect(comments).to.have.length(2);
        expect(
          comments.every(
            c =>
              (c as Paragraph & {parentId?: string}).parentId ===
              commentedParagraph.id,
          ),
        ).to.be.true();
      });

      it('marks comments with linkType=comment', () => {
        expect(comments.every(c => c.linkType === 'comment')).to.be.true();
      });

      it('tags comments with original keywords and provenance', () => {
        const comment = comments.find(c =>
          c.tags?.includes('eln:created:2026-01-28'),
        );
        expect(comment).to.not.be.undefined();
        expect(comment?.tags).to.containDeep([
          'dtag',
          'ftag',
          'eln:source:scilog',
          'eln:author:omkar.zade@psi.ch',
        ]);
      });
    });

    describe('files', () => {
      const JPEG_SIZE = 714202;
      const JPEG_SHA256 =
        '937a895faa7d2096c6ce74f34c22c163836f492628b8d2cf0dc594322b669acb';
      const PDF_SIZE = 165071;
      const PDF_SHA256 =
        '0efd6ae4a4f67f5fd8b3611a5c63f4382c5c91152faa1b2f34aabb5b373ac076';

      it('imports referenced files as filesnippets', () => {
        expect(files).to.have.length(2);
      });

      it('preserves contentSize and sha256 from the metadata', () => {
        const jpeg = files.find(f => f.contentSize === JPEG_SIZE);
        const pdf = files.find(f => f.contentSize === PDF_SIZE);

        expect(jpeg).to.not.be.undefined();
        expect(jpeg?.contentType).to.equal('image/jpeg');
        expect(jpeg?.contentSha256).to.equal(JPEG_SHA256);

        expect(pdf).to.not.be.undefined();
        expect(pdf?.contentType).to.equal('application/pdf');
        expect(pdf?.contentSha256).to.equal(PDF_SHA256);
      });

      it('stores file bytes in GridFS', async () => {
        const jpeg = files.find(f => f.contentSize === JPEG_SIZE)!;
        const response = await client
          .get(`/filesnippet/${jpeg.id}/files`)
          .set('Authorization', 'Bearer ' + token)
          .responseType('blob')
          .expect(200);
        const sha = crypto
          .createHash('sha256')
          .update(response.body)
          .digest('hex');
        expect(sha).to.equal(jpeg.contentSha256);
      });
    });
  });
});
