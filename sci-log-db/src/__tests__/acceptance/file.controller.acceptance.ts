import {Client, expect} from '@loopback/testlab';
import {Suite} from 'mocha';
import {SciLogDbApplication} from '../..';
import {clearDatabase, createUserToken, setupApplication} from './test-helper';

describe('File controller services', function (this: Suite) {
  this.timeout(1000);
  let app: SciLogDbApplication;
  let client: Client;
  let token: string;
  let fileSnippetId: string;
  const fileSnippet = {
    ownerGroup: 'filesnippetAcceptance',
    createACL: ['filesnippetAcceptance'],
    readACL: ['filesnippetAcceptance'],
    updateACL: ['filesnippetAcceptance'],
    deleteACL: ['filesnippetAcceptance'],
    adminACL: ['admin'],
    shareACL: ['filesnippetAcceptance'],
    isPrivate: true,
    defaultOrder: 0,
    expiresAt: '2055-10-10T14:04:19.522Z',
    tags: ['aSearchableTag'],
    dashboardName: 'string',
    versionable: true,
    name: 'aSearchableName',
  };

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
    await clearDatabase(app);
    token = await createUserToken(app, client, ['filesnippetAcceptance']);
  });

  after(async () => {
    await clearDatabase(app);
    if (app != null) await app.stop();
  });

  it('post a file without token should return 401', async () => {
    await client.post('/filesnippet').send(fileSnippet).expect(401);
  });

  it('post a file with authentication should return 200 and contain file', async () => {
    await client
      .post('/filesnippet')
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send(fileSnippet)
      .expect(200)
      .then(
        result => (
          expect(result.body).to.containEql(fileSnippet),
          expect(result.body.snippetType).to.be.eql('image'),
          (fileSnippetId = result.body.id)
        ),
      )
      .catch(err => {
        throw err;
      });
  });

  it('count snippet without token should return 401', async () => {
    await client
      .get('/filesnippet/count')
      .set('Content-Type', 'application/json')
      .expect(401);
  });

  it('count snippet with token should return body.count=1', async () => {
    await client
      .get('/filesnippet/count')
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
      .get('/filesnippet')
      .set('Content-Type', 'application/json')
      .expect(401);
  });

  it('get snippet with token should be of length one and contain file', async () => {
    await client
      .get('/filesnippet')
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(200)
      .then(
        result => (
          expect(result.body.length).to.be.eql(1),
          expect(result.body[0]).to.containEql(fileSnippet)
        ),
      )
      .catch(err => {
        throw err;
      });
  });

  it('get snippets with ID without token should return 401', async () => {
    await client
      .get(`/filesnippet/${fileSnippetId}`)
      .set('Content-Type', 'application/json')
      .expect(401);
  });

  it('get snippet with ID with token should return 200 and contain file', async () => {
    await client
      .get(`/filesnippet/${fileSnippetId}`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(200)
      .then(result => expect(result.body).to.containEql(fileSnippet))
      .catch(err => {
        throw err;
      });
  });

  it('patch snippet without token should return 401', async () => {
    await client
      .patch('/filesnippet/')
      .set('Content-Type', 'application/json')
      .send({dashboardName: 'aNewName'})
      .expect(401);
  });

  it('patch snippet with toke should return 200 and body.count=1', async () => {
    await client
      .patch('/filesnippet')
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
      .get(`/filesnippet/index=${fileSnippetId}`)
      .set('Content-Type', 'application/json')
      .expect(401);
  });

  it('Get index with token should return 200 and body=0', async () => {
    await client
      .get(`/filesnippet/index=${fileSnippetId}`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(200)
      .then(result => expect(result.body).to.be.eql(0))
      .catch(err => {
        throw err;
      });
  });

  it('Search without token should return 401', async () => {
    await client
      .get(`/filesnippet/search=descript`)
      .set('Content-Type', 'application/json')
      .expect(401);
  });

  it('Search index with token should return 200 and matching body.name', async () => {
    await client
      .get(`/filesnippet/search=searchablename`)
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
        `/filesnippet/search=aSearchabletag?filter=${JSON.stringify(
          includeTags,
        )}`,
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
      .patch(`/filesnippet/${fileSnippetId}`)
      .send(fileSnippet)
      .set('Content-Type', 'application/json')
      .expect(401);
  });

  // when patching by id, to preserve the history, the original snippet is duplicated, then a history snippet is created and then the original one is updated
  // to keep the linking between the three, the parentId of the duplicated one = id of the history snippet and the parentId of the history snippet = id of the original one
  // to prevent the search to return too many snippets, the fields used in the subsequent search are updated
  it('patch snippet by id with token should return 204', async () => {
    await client
      .patch(`/filesnippet/${fileSnippetId}`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send({
        tags: ['aSearchExcludedTag'],
        name: 'aSearchExcludedName',
      })
      .expect(204);
  });

  it('Search index with token should return 200 and zero matching', async () => {
    const includeTags = {fields: {tags: true}};
    await client
      .get(
        `/filesnippet/search=aSearchabletag?filter=${JSON.stringify(
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
      .delete(`/filesnippet/${fileSnippetId}`)
      .set('Content-Type', 'application/json')
      .expect(401);
  });

  it('delete snippet by id with token should return 204', async () => {
    await client
      .delete(`/filesnippet/${fileSnippetId}`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(204);
  });

  it('restore snippet by id without token should return 401', async () => {
    await client
      .patch(`/filesnippet/${fileSnippetId}/restore`)
      .set('Content-Type', 'application/json')
      .expect(401);
  });

  it('restore snippet by id with token should return 204', async () => {
    await client
      .patch(`/filesnippet/${fileSnippetId}/restore`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(204);
  });

  it('tries to post a file with incompatible fields', async () => {
    await client
      .post('/filesnippet/files')
      .set('Authorization', 'Bearer ' + token)
      .type('form')
      .field('fields', '{"something": "a"}')
      .attach('file', __filename)
      .expect(422)
      .then(result =>
        expect(result.body.error.details.messages).to.be.eql({
          something: ['is not defined in the model'],
        }),
      )
      .catch(err => {
        throw err;
      });
  });

  it('tries to post without a file', async () => {
    await client
      .post('/filesnippet/files')
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'multipart/form-data')
      .expect(422)
      .then(result =>
        expect(result.body.error.message).to.be.eql('A file must be provided'),
      )
      .catch(err => {
        throw err;
      });
  });

  it('tries to post a file with empty fields', async () => {
    await client
      .post('/filesnippet/files')
      .set('Authorization', 'Bearer ' + token)
      .type('form')
      .attach('file', __filename)
      .expect(200)
      .then()
      .catch(err => {
        throw err;
      });
  });

  it('tries to post a file with allowed field', async () => {
    await client
      .post('/filesnippet/files')
      .set('Authorization', 'Bearer ' + token)
      .type('form')
      .field('fields', '{"readACL": ["aOwner"]}')
      .attach('file', __filename)
      .expect(200)
      .then()
      .catch(err => {
        throw err;
      });
  });

  it('tries to get a file with matching pgroup after posting', async () => {
    const postResponse = await client
      .post('/filesnippet/files')
      .set('Authorization', 'Bearer ' + token)
      .type('form')
      .field('fields', '{"readACL": ["any-authenticated-user"]}')
      .attach('file', __filename)
      .then()
      .catch(err => {
        throw err;
      });

    await client
      .get(`/filesnippet/${postResponse.body.id}/files`)
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .then(result => {
        expect(result.text).to.startWith('"use strict"');
        expect(result.type).to.eql('application/javascript');
      })
      .catch(err => {
        throw err;
      });
  });

  it('patches a file after having created it', async () => {
    const postResponse = await client
      .post('/filesnippet/files')
      .set('Authorization', 'Bearer ' + token)
      .type('form')
      .field('fields', '{"readACL": ["any-authenticated-user"]}')
      .attach('file', __filename)
      .then()
      .catch(err => {
        throw err;
      });

    await client
      .patch(`/filesnippet/${postResponse.body.id}/files`)
      .set('Authorization', 'Bearer ' + token)
      .field('fields', '{"description": "something"}')
      .attach('file', __filename)
      .expect(204)
      .then()
      .catch(err => {
        throw err;
      });
  });

  it('tries to post a file with accessGroups should add to readACL', async () => {
    await client
      .post('/filesnippet/files')
      .set('Authorization', 'Bearer ' + token)
      .type('form')
      .field('fields', '{"accessGroups": ["anAccessGroup"]}')
      .attach('file', __filename)
      .expect(200)
      .then(result => {
        expect(result.body.accessGroups).to.be.eql(['anAccessGroup']);
        expect(result.body.readACL).to.be.eql(['anAccessGroup']);
      })
      .catch(err => {
        throw err;
      });
  });
});
