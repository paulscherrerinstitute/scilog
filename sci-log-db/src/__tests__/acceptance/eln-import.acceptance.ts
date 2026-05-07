import {Client} from '@loopback/testlab';
import path from 'path';
import {Suite} from 'mocha';
import {SciLogDbApplication} from '../..';
import {clearDatabase, createUserToken, setupApplication} from './test-helper';

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
      await client
        .post(`/logbooks/import/eln?location-id=${locationId}`)
        .attach('file', SCILOG_ELN_PATH)
        .expect(401);
    });
  });

  describe('input validation', () => {
    it('returns 422 when no file is attached', async () => {
      await client
        .post(`/logbooks/import/eln?location-id=${locationId}`)
        .set('Authorization', 'Bearer ' + token)
        .field('dummy', 'x')
        .expect(422);
    });

    it('returns 400 when location-id is missing', async () => {
      await client
        .post('/logbooks/import/eln')
        .set('Authorization', 'Bearer ' + token)
        .attach('file', SCILOG_ELN_PATH)
        .expect(400);
    });

    it('returns 404 when location-id does not exist', async () => {
      await client
        .post('/logbooks/import/eln?location-id=000000000000000000000000')
        .set('Authorization', 'Bearer ' + token)
        .attach('file', SCILOG_ELN_PATH)
        .expect(404);
    });

    it('returns 422 when multiple files are attached', async () => {
      await client
        .post(`/logbooks/import/eln?location-id=${locationId}`)
        .set('Authorization', 'Bearer ' + token)
        .attach('file', Buffer.from('a'), 'a.eln')
        .attach('file', Buffer.from('b'), 'b.eln')
        .expect(422);
    });

    it('returns 413 when the upload exceeds 100 MB', async () => {
      const big = Buffer.alloc(100 * 1024 * 1024 + 1);
      await client
        .post(`/logbooks/import/eln?location-id=${locationId}`)
        .set('Authorization', 'Bearer ' + token)
        .attach('file', big, 'big.eln')
        .expect(413);
    });
  });
});
