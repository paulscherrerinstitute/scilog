import {Client, expect} from '@loopback/testlab';
import {Suite} from 'mocha';
import {SciLogDbApplication} from '../..';
import {
  adminUser,
  clearDatabase,
  createAdminToken,
  createUserToken,
  setupApplication,
} from './test-helper';
import _ from 'lodash';

describe('Logbook', function (this: Suite) {
  this.timeout(5000);
  let app: SciLogDbApplication;
  let client: Client;
  let token: string;
  let adminToken: string;
  let logbookSnippetId: string;
  const logbookSnippet = {
    ownerGroup: 'logbookAcceptance',
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
    adminToken = await createAdminToken(app, client);
    token = await createUserToken(app, client, ['logbookAcceptance']);
  });

  after(async () => {
    await clearDatabase(app);
    if (app != null) await app.stop();
  });

  it('post a logbook without token should return 401', async () => {
    await client.post('/logbooks').send(logbookSnippet).expect(401);
  });

  it('post a logbook with authentication should return 200 and contain logbookSnippet', async () => {
    await client
      .post('/logbooks')
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send(logbookSnippet)
      .expect(200)
      .then(
        result => (
          expect(result.body).to.containEql(logbookSnippet),
          expect(result.body.snippetType).to.be.eql('logbook'),
          (logbookSnippetId = result.body.id)
        ),
      )
      .catch(err => {
        throw err;
      });
  });

  it('count snippet without token should return 401', async () => {
    await client
      .get('/logbooks/count')
      .set('Content-Type', 'application/json')
      .expect(401);
  });

  it('count snippet with token should return body.count=1', async () => {
    await client
      .get('/logbooks/count')
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
      .get('/logbooks')
      .set('Content-Type', 'application/json')
      .expect(401);
  });

  it('get snippet with token should be of length one and contain logbook', async () => {
    await client
      .get('/logbooks')
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(200)
      .then(
        result => (
          expect(result.body.length).to.be.eql(1),
          expect(result.body[0]).to.containEql(logbookSnippet)
        ),
      )
      .catch(err => {
        throw err;
      });
  });

  it('get snippets with ID without token should return 401', async () => {
    await client
      .get(`/logbooks/${logbookSnippetId}`)
      .set('Content-Type', 'application/json')
      .expect(401);
  });

  it('get snippet with ID with token should return 200 and contain logbook', async () => {
    await client
      .get(`/logbooks/${logbookSnippetId}`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(200)
      .then(result => expect(result.body).to.containEql(logbookSnippet))
      .catch(err => {
        throw err;
      });
  });

  it('patch snippet without token should return 401', async () => {
    await client
      .patch('/logbooks/')
      .set('Content-Type', 'application/json')
      .send({dashboardName: 'aNewName'})
      .expect(401);
  });

  it('patch snippet with toke should return 200 and body.count=1', async () => {
    await client
      .patch('/logbooks')
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
      .get(`/logbooks/index=${logbookSnippetId}`)
      .set('Content-Type', 'application/json')
      .expect(401);
  });

  it('Get index with token should return 200 and body=0', async () => {
    await client
      .get(`/logbooks/index=${logbookSnippetId}`)
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
      .get(`/logbooks/search=searchablename`)
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
        `/logbooks/search=aSearchabletag?filter=${JSON.stringify(includeTags)}`,
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
      .patch(`/logbooks/${logbookSnippetId}`)
      .send(logbookSnippet)
      .set('Content-Type', 'application/json')
      .expect(401);
  });

  // when patching by id, to preserve the history, the original snippet is duplicated, then a history snippet is created and then the original one is updated
  // to keep the linking between the three, the parentId of the duplicated one = id of the history snippet and the parentId of the history snippet = id of the original one
  // to prevent the search to return too many snippets, the fields used in the subsequent search are updated
  it('patch snippet by id with token should return 204', async () => {
    await client
      .patch(`/logbooks/${logbookSnippetId}`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send({
        tags: ['aSearchExcludedTag'],
        name: 'aSearchExcludedName',
        textcontent: 'aSearchExcludedTextContent',
      })
      .expect(204);
  });

  it('Search index with token should return 200 and zero matches', async () => {
    const includeTags = {fields: {tags: true}};
    await client
      .get(
        `/logbooks/search=aSearchabletag?filter=${JSON.stringify(includeTags)}`,
      )
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(200)
      .then(result => expect(result.body.length).to.be.eql(0))
      .catch(err => {
        throw err;
      });
  });

  [
    {
      input: {
        readACL: ['logbookAcceptance', 'toPropagate'],
      },
      output: [
        ['logbookAcceptance', 'toPropagate'],
        ['logbookAcceptance', 'toPropagate'],
      ],
    },
    {
      input: {
        ownerGroup: 'logbookAcceptance',
        accessGroups: ['accessGroupPropagated'],
      },
      output: [
        ['logbookAcceptance', 'accessGroupPropagated'],
        ['logbookAcceptance', 'accessGroupPropagated', 'toPropagate'],
      ],
    },
  ].forEach(t =>
    it(`patch logbook with children and grand children by id should modify all with ${t.output[1]}`, async () => {
      const child = await client
        .post(`/paragraphs`)
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/json')
        .send({
          ..._.omit(logbookSnippet, 'location'),
          parentId: logbookSnippetId,
        });

      const grandChild = await client
        .post(`/paragraphs`)
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/json')
        .send({
          ..._.omit(logbookSnippet, 'location'),
          parentId: child.body.id,
        });

      await client
        .patch(`/logbooks/${logbookSnippetId}`)
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/json')
        .send(t.input)
        .expect(204);

      const filter = {
        where: {
          id: {inq: [logbookSnippetId, child.body.id, grandChild.body.id]},
        },
      };
      await client
        .get(`/basesnippets?filter=${JSON.stringify(filter)}`)
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/json')
        .then(result =>
          result.body.map((r: {readACL: string[]}, i: number) => {
            if (i === 0) expect(r.readACL).to.be.eql(t.output[0]);
            else expect(r.readACL).to.be.eql(t.output[1]);
          }),
        );
    }),
  );

  [
    {
      input: {
        ownerGroup: 'logbookAcceptance',
        accessGroups: ['someNew'],
      },
      expected: 204,
    },
    {
      input: {
        ownerGroup: 'notAllowedForNonAdmin',
        accessGroups: ['someNew'],
      },
      expected: 404,
    },
    {
      input: {readACL: ['logbookAcceptance', 'someNew1']},
      expected: 204,
    },
    {
      input: {
        ownerGroup: 'notAllowedForNonAdmin',
        accessGroups: ['someNew', 'logbookAcceptance'],
        token: 'adminToken',
      },
      expected: 204,
    },
    {
      input: {
        ownerGroup: 'logbookAcceptance',
        accessGroups: ['someNew', 'logbookAcceptance'],
        token: 'adminToken',
      },
      expected: 204,
    },
    {
      input: {
        deleteACL: ['notAllowedForNonAdmin', 'someNew'],
        token: 'adminToken',
      },
      expected: 204,
    },
    {
      input: {deleteACL: ['someOtherNotAllowedForNonAdmin', 'someNew']},
      expected: 404,
    },
    {
      input: {
        accessGroups: ['someNew'],
      },
      expected: 403,
    },
  ].forEach((t, i) => {
    it(`patch logbook by id changing ownerGroup should return ${i}`, async () => {
      const blockToken = t.input.token === 'adminToken' ? adminToken : token;
      await client
        .patch(`/logbooks/${logbookSnippetId}`)
        .set('Authorization', 'Bearer ' + blockToken)
        .set('Content-Type', 'application/json')
        .send({
          ...t.input,
        })
        .expect(t.expected)
        .then(result => {
          if (t.expected === 403)
            expect(result.body.error.message).to.be.eql(
              'Cannot modify data snippet. Please provide both ownerGroup and accessGroup',
            );
        })
        .catch(err => {
          throw err;
        });
    });
  });

  it('delete snippet by id without token should return 401', async () => {
    await client
      .delete(`/logbooks/${logbookSnippetId}`)
      .set('Content-Type', 'application/json')
      .expect(401);
  });

  it('delete snippet by id with token should return 404', async () => {
    await client
      .delete(`/logbooks/${logbookSnippetId}`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(404);
  });

  it('restore snippet by id without token should return 401', async () => {
    await client
      .patch(`/logbooks/${logbookSnippetId}/restore`)
      .set('Content-Type', 'application/json')
      .expect(401);
  });

  it('restore snippet by id with token should return 204', async () => {
    await client
      .patch(`/logbooks/${logbookSnippetId}/restore`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(204);
  });

  it('post a logbook with authentication and should create default ACLS from parent', async () => {
    const locationSnippet = {
      isPrivate: true,
      defaultOrder: 0,
      expiresAt: '2055-10-10T14:04:19.522Z',
      tags: ['aSearchableTag'],
      dashboardName: 'string',
      versionable: true,
      name: 'aSearchableName',
      location: 'anExistingLocation',
    };

    const locationResponse = await client
      .post('/locations')
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send(locationSnippet);

    await client
      .post('/logbooks')
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send({
        ..._.omit(logbookSnippet, 'location'),
        accessGroups: ['anAccessGroups'],
        location: locationResponse.body.id,
      })
      .expect(200)
      .then(
        result => (
          expect(result.body).to.containEql({
            ..._.omit(logbookSnippet, 'location'),
            location: locationResponse.body.id,
          }),
          expect(result.body.snippetType).to.be.eql('logbook'),
          expect(result.body.readACL).to.be.eql([
            'logbookAcceptance',
            'anAccessGroups',
            adminUser.email,
            adminUser.unxGroup,
          ]),
          expect(result.body.createACL).to.be.eql([
            'logbookAcceptance',
            adminUser.email,
            adminUser.unxGroup,
          ]),
          expect(result.body.updateACL).to.be.eql([
            'logbookAcceptance',
            adminUser.email,
            adminUser.unxGroup,
          ]),
          expect(result.body.deleteACL).to.be.eql([
            'admin',
            'logbookAcceptance',
            adminUser.unxGroup,
          ]),
          expect(result.body.shareACL).to.be.eql([
            adminUser.email,
            adminUser.unxGroup,
          ]),
          expect(result.body.adminACL).to.be.eql(['admin', adminUser.unxGroup])
        ),
      )
      .catch(err => {
        throw err;
      });
  });

  it('post a logbook with any-authenticated-user should return 422', async () => {
    await client
      .post('/logbooks')
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send({
        ..._.omit(logbookSnippet, 'readACL'),
        readACL: ['any-authenticated-user'],
      })
      .expect(422)
      .catch(err => {
        throw err;
      });
  });
});
