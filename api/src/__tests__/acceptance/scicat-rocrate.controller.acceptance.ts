import {Client, expect, sinon} from '@loopback/testlab';
import {Suite} from 'mocha';
import {Readable} from 'node:stream';
import {SciLogDbApplication} from '../..';
import {clearDatabase, createUserToken, setupApplication} from './test-helper';
import {DatabaseHelper} from '../database.helpers';
import {listZipEntries} from '../zip.helpers';
import {LogbookPdfService} from '../../services/logbook-pdf.service';

describe('ScicatRoCrateController', function (this: Suite) {
  this.timeout(5000);
  let app: SciLogDbApplication;
  let client: Client;
  let token: string;
  let databaseHelper: DatabaseHelper;
  const sandbox = sinon.createSandbox();

  const LOGBOOK_OWNER_GROUP = 'scicatRoCrateAcceptance';

  const user = {
    email: 'test@loopback.io',
    firstName: 'Example',
    lastName: 'User',
    roles: [LOGBOOK_OWNER_GROUP, 'any-authenticated-user'],
  };

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
    await clearDatabase(app);
    databaseHelper = new DatabaseHelper(app);
    token = await createUserToken(app, client, undefined, user);
  });

  beforeEach(() => {
    // The real PDF export launches headless Chrome via puppeteer; stub it so the
    // test exercises the controller's assembly (metadata + eln + pdf -> zip)
    // without needing a browser.
    sandbox
      .stub(LogbookPdfService.prototype, 'exportPdf')
      .callsFake(async (id: string) => ({
        stream: Readable.from(['fake pdf bytes']),
        pdfName: `${id}.pdf`,
      }));
  });

  afterEach(() => sandbox.restore());

  after(async () => {
    await clearDatabase(app);
    if (app != null) await app.stop();
  });

  const logbookSnippet = {
    ownerGroup: LOGBOOK_OWNER_GROUP,
    isPrivate: true,
    tags: ['tag1'],
    description: 'test description',
    name: 'aSearchableName',
    location: 'aLocation',
  };

  // HTTP smoke test: confirms the controller wiring (status, headers, piping)
  // The detailed zip assembly and metadata contents are covered by
  // the ScicatCrateService unit tests.
  it('exports a logbook as a scicat-rocrate dataset zip', async () => {
    const logbook = await databaseHelper.givenLogbook(logbookSnippet, {
      currentUser: user,
    });
    await client
      .get(`/logbooks/export/${logbook.id}/scicat-rocrate`)
      .set('Authorization', 'Bearer ' + token)
      .responseType('blob')
      .expect(200)
      .expect('Content-Type', 'application/zip')
      .expect(
        'Content-Disposition',
        `attachment; filename="logbook-${logbook.id}-as-dataset.zip"`,
      )
      .then(async response => {
        const files = await listZipEntries(response.body);
        expect(files).to.containEql('ro-crate-metadata.json');
      })
      .catch(error => {
        throw error;
      });
  });

  it('returns 404 when exporting a logbook the user cannot read', async () => {
    const logbook = await databaseHelper.givenLogbook(logbookSnippet, {
      currentUser: user,
    });

    // a second user who is not a member of the logbook's owner group
    const otherUser = {
      email: 'other@loopback.io',
      firstName: 'No',
      lastName: 'Access',
      roles: ['any-authenticated-user'],
    };
    const otherToken = await createUserToken(app, client, undefined, otherUser);

    // the read ACL filters the logbook out for this user, so it looks absent
    // as the created logbook's readACL is:	['scicatRoCrateAcceptance']
    await client
      .get(`/logbooks/export/${logbook.id}/scicat-rocrate`)
      .set('Authorization', 'Bearer ' + otherToken)
      .set('Content-Type', 'application/json')
      .expect(404);
  });

  it('throws 404 for non-existing logbook', async () => {
    await client
      .get('/logbooks/export/nosuchlogbook/scicat-rocrate')
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(404);
  });
});
