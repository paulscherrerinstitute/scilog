import {Client, expect} from '@loopback/testlab';
import {Suite} from 'mocha';
import {SciLogDbApplication} from '../..';
import {clearDatabase, createUserToken, setupApplication} from './test-helper';
import {DatabaseHelper} from '../database.helpers';
// @ts-ignore
import {ROCrate} from 'ro-crate';

describe('RocrateController', function (this: Suite) {
  this.timeout(5000);
  let app: SciLogDbApplication;
  let client: Client;
  let token: string;
  let databaseHelper: DatabaseHelper;

  const LOGBOOK_OWNER_GROUP = 'roCrateAcceptance';

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

  it('gets rocrate metadata for existing logbook', async () => {
    const logbook = await databaseHelper.givenLogbook(logbookSnippet, {
      currentUser: user,
    });
    await client
      .get(`/rocrates/${logbook.id}`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(200)
      .then(result => {
        // sanity checks that it's a valid ro-crate
        const crate = new ROCrate(result.body);
        expect(crate.rootDataset.name).to.equal(logbookSnippet.name);
        const logbookEntity = crate.getEntity(`./${logbook.id}/`);
        expect(crate.hasType(logbookEntity, 'Book')).to.be.true();
        expect(logbookEntity.description).to.equal(logbookSnippet.description);

        // check author is linked
        const authorEntity = crate.getEntity(logbookEntity.author['@id']);
        expect(crate.hasType(authorEntity, 'Person')).to.be.true();
        expect(authorEntity.email).to.equal(user.email);
      })
      .catch(error => {
        throw error;
      });
  });
});
