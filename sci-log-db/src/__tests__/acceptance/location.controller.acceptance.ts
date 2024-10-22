import {User} from '@loopback/authentication-jwt';
import {Client, expect} from '@loopback/testlab';
import {Suite} from 'mocha';
import {SciLogDbApplication} from '../..';
import {
  clearDatabase,
  createAdminUser,
  createUserToken,
  setupApplication,
  userData,
} from './test-helper';
import _ from 'lodash';

describe('Location', function (this: Suite) {
  this.timeout(5000);
  let app: SciLogDbApplication;
  let client: Client;
  let token: string;
  let adminUser: User;
  let locationSnippetId: string;
  const locationSnippet = {
    ownerGroup: 'locationAcceptance',
    createACL: ['locationAcceptance'],
    readACL: ['locationAcceptance'],
    updateACL: ['locationAcceptance'],
    deleteACL: ['locationAcceptance'],
    adminACL: ['admin'],
    shareACL: ['locationAcceptance'],
    isPrivate: true,
    defaultOrder: 0,
    expiresAt: '2055-10-10T14:04:19.522Z',
    tags: ['aSearchableTag'],
    dashboardName: 'string',
    versionable: true,
    name: 'aSearchableName',
    location: 'aLocation',
  };

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
    await clearDatabase(app);
    token = await createUserToken(app, client, ['locationAcceptance']);
    adminUser = await createAdminUser(app);
  });

  after(async () => {
    await clearDatabase(app);
    if (app != null) await app.stop();
  });

  it('post a location without token should return 401', async () => {
    await client.post('/locations').send(locationSnippet).expect(401);
  });

  it('post a location with authentication should return 200 and contain locationSnippet', async () => {
    await client
      .post('/locations')
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send(locationSnippet)
      .expect(200)
      .then(
        result => (
          expect(result.body).to.containEql(
            _.omit(locationSnippet, ['readACL', 'deleteACL']),
          ),
          expect(result.body.readACL).to.be.eql([
            locationSnippet.ownerGroup,
            'any-authenticated-user',
          ]),
          expect(result.body.deleteACL).to.be.eql([
            locationSnippet.ownerGroup,
            'admin',
          ]),
          (locationSnippetId = result.body.id)
        ),
      )
      .catch(err => {
        throw err;
      });
  });

  it('count snippet without token should return 401', async () => {
    await client
      .get('/locations/count')
      .set('Content-Type', 'application/json')
      .expect(401);
  });

  it('count snippet with token should return body.count=1', async () => {
    await client
      .get('/locations/count')
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(200)
      .then(result => expect(result.body.count).to.eql(1))
      .catch(err => {
        throw err;
      });
  });

  it('get snippets without token should return 401', async () => {
    await client
      .get('/locations')
      .set('Content-Type', 'application/json')
      .expect(401);
  });

  it('get snippet with token should be of length one and contain location', async () => {
    await client
      .get('/locations')
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(200)
      .then(
        result => (
          expect(result.body.length).to.be.eql(1),
          expect(result.body[0]).to.containEql(
            _.omit(locationSnippet, ['readACL', 'deleteACL']),
          ),
          expect(result.body[0].readACL).to.be.eql([
            locationSnippet.ownerGroup,
            'any-authenticated-user',
          ]),
          expect(result.body[0].deleteACL).to.be.eql([
            locationSnippet.ownerGroup,
            'admin',
          ])
        ),
      )
      .catch(err => {
        throw err;
      });
  });

  it('get snippets with ID without token should return 401', async () => {
    await client
      .get(`/locations/${locationSnippetId}`)
      .set('Content-Type', 'application/json')
      .expect(401);
  });

  it('get snippet with ID with token should return 200 and contain location', async () => {
    await client
      .get(`/locations/${locationSnippetId}`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(200)
      .then(
        result => (
          expect(result.body).to.containEql(
            _.omit(locationSnippet, ['readACL', 'deleteACL']),
          ),
          expect(result.body.readACL).to.be.eql([
            locationSnippet.ownerGroup,
            'any-authenticated-user',
          ]),
          expect(result.body.deleteACL).to.be.eql([
            locationSnippet.ownerGroup,
            'admin',
          ])
        ),
      )
      .catch(err => {
        throw err;
      });
  });

  it('patch snippet without token should return 401', async () => {
    await client
      .patch('/locations/')
      .set('Content-Type', 'application/json')
      .send({dashboardName: 'aNewName'})
      .expect(401);
  });

  it('patch snippet with toke should return 200 and body.count=1', async () => {
    await client
      .patch('/locations')
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send({dashboardName: 'aNewName'})
      .expect(200)
      .then(result => expect(result.body.count).to.be.eql(1))
      .catch(err => {
        throw err;
      });
  });

  it('Get index without token should return 401', async () => {
    await client
      .get(`/locations/index=${locationSnippetId}`)
      .set('Content-Type', 'application/json')
      .expect(401);
  });

  it('Get index with token should return 200 and body=0', async () => {
    await client
      .get(`/locations/index=${locationSnippetId}`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(200)
      .then(result => expect(result.body).to.be.eql(0))
      .catch(err => {
        throw err;
      });
  });

  it('Search index with token should return 200 and matching body.name', async () => {
    await client
      .get(`/locations/search=searchablename`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(200)
      .then(
        result => (
          expect(result.body.length).to.be.eql(1),
          expect(result.body[0].name).to.be.eql('aSearchableName')
        ),
      )
      .catch(err => {
        throw err;
      });
  });

  it('Search index with token should return 200 and matching body.tags', async () => {
    const includeTags = {fields: {tags: true}, include: ['subsnippets']};
    await client
      .get(
        `/locations/search=${encodeURIComponent(
          '#aSearchableTag',
        )}?filter=${JSON.stringify(includeTags)}`,
      )
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(200)
      .then(
        result => (
          expect(result.body.length).to.be.eql(1),
          expect(result.body[0].tags[0]).to.be.eql('aSearchableTag')
        ),
      )
      .catch(err => {
        throw err;
      });
  });

  it('patch snippet by id without token should return 401', async () => {
    await client
      .patch(`/locations/${locationSnippetId}`)
      .send(locationSnippet)
      .set('Content-Type', 'application/json')
      .expect(401);
  });

  // when patching by id, to preserve the history, the original snippet is duplicated, then a history snippet is created and then the original one is updated
  // to keep the linking between the three, the parentId of the duplicated one = id of the history snippet and the parentId of the history snippet = id of the original one
  // to prevent the search to return too many snippets, the fields used in the subsequent search are updated
  it('patch snippet by id with token should return 204', async () => {
    await client
      .patch(`/locations/${locationSnippetId}`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send({
        tags: ['aSearchExcludedTag'],
        name: 'aSearchExcludedName',
        textcontent: 'aSearchExcludedTextContent',
      })
      .expect(204);
  });

  it('Search index with token should return 200 and zero matching', async () => {
    const includeTags = {fields: {tags: true}};
    await client
      .get(
        `/locations/search=aSearchabletag?filter=${JSON.stringify(
          includeTags,
        )}`,
      )
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(200)
      .then(result => expect(result.body.length).to.be.eql(0))
      .catch(err => {
        throw err;
      });
  });

  it('delete snippet by id without token should return 401', async () => {
    await client
      .delete(`/locations/${locationSnippetId}`)
      .set('Content-Type', 'application/json')
      .expect(401);
  });

  it('delete snippet by id with token should return 204', async () => {
    await client
      .delete(`/locations/${locationSnippetId}`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(204);
  });

  it('restore snippet by id without token should return 401', async () => {
    await client
      .patch(`/locations/${locationSnippetId}/restore`)
      .set('Content-Type', 'application/json')
      .expect(401);
  });

  it('restore snippet by id with token should return 204', async () => {
    await client
      .patch(`/locations/${locationSnippetId}/restore`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(204);
  });

  it('post a location with authentication should return 200 and contain readACL from functional accounts', async () => {
    await client
      .post('/locations')
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send({
        ..._.omit(locationSnippet, [
          'ownerGroup',
          'createACL',
          'deleteACL',
          'readACL',
          'updateACL',
          'shareACL',
          'adminACL',
          'location',
        ]),
        location: 'anExistingLocation',
      })
      .expect(200)
      .then(
        result => (
          expect(result.body).to.containEql({
            ..._.omit(locationSnippet, [
              'ownerGroup',
              'createACL',
              'deleteACL',
              'readACL',
              'updateACL',
              'shareACL',
              'adminACL',
              'location',
            ]),
          }),
          expect(result.body.readACL).to.be.eql(['any-authenticated-user']),
          expect(result.body.deleteACL).to.be.eql(['admin']),
          expect(result.body.adminACL).to.be.eql(['admin']),
          expect(result.body.shareACL).to.be.eql(undefined),
          expect(result.body.createACL).to.be.eql(undefined),
          expect(result.body.updateACL).to.be.eql([
            adminUser.unxGroup,
            adminUser.email,
          ])
        ),
      )
      .catch(err => {
        throw err;
      });
  });

  it('tries to create location and linked logbook', async () => {
    const acls = {
      createACL: ['unx_sf-bernina-bs'],
      readACL: ['p12345', 'unx_sf-bernina-bs'],
      updateACL: ['p12345', 'unx_sf-bernina-bs'],
      deleteACL: ['unx_sf-bernina-bs'],
      shareACL: [userData.email, 'p12345'],
      adminACL: [userData.email, 'unx_sf-bernina-bs'],
    };
    const logbook = {
      snippetType: 'logbook',
      isPrivate: false,
      name: 'My logbook',
      description: 'Logbook description goes here',
      ...acls,
    };

    const postResponse = await client
      .post('/locations')
      .set('Authorization', 'Bearer ' + token)
      .send({name: 'cSAXS', location: 'PSI/SLS/CSAXS', ...acls})
      .expect(200)
      .then()
      .catch(err => {
        throw err;
      });
    let logbookId;
    await client
      .post('/logbooks')
      .set('Authorization', 'Bearer ' + token)
      .send({...logbook, location: `${postResponse.body.id}`})
      .expect(200)
      .then(result => {
        expect(postResponse.body.snippetType).to.be.eql('location');
        logbookId = result.body.id;
        // console.log("Found logbook id:",logbookId)
        expect(result.body.snippetType).to.be.eql('logbook');
      })
      .catch(err => {
        throw err;
      });

    await client
      .get(`/basesnippets/${logbookId}`)
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .then()
      .catch(err => {
        throw err;
      });
  });
});
