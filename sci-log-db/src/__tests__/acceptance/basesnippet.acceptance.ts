import {Client, expect} from '@loopback/testlab';
import _ from 'lodash';
import {Suite} from 'mocha';
import {SciLogDbApplication} from '../..';
import {clearDatabase, createUserToken, setupApplication} from './test-helper';
import {Basesnippet} from '../../models';

describe('Basesnippet', function (this: Suite) {
  this.timeout(5000);
  let app: SciLogDbApplication;
  let client: Client;
  let token: string;
  let baseSnippetId: string;
  const baseSnippet = {
    ownerGroup: 'aOwner',
    accessGroups: ['basesnippetAcceptance'],
    isPrivate: true,
    defaultOrder: 0,
    expiresAt: '2055-10-10T14:04:19.522Z',
    tags: ['aSearchableTag'],
    dashboardName: 'string',
    versionable: true,
    name: 'aSearchableName',
    description: 'aSearchableDescription',
    textcontent: 'aSearchableTextContent',
  };

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
    await clearDatabase(app);
    token = await createUserToken(app, client, ['basesnippetAcceptance']);
  });

  after(async () => {
    await clearDatabase(app);
    if (app != null) await app.stop();
  });

  it('post a basesnippet without token should return 401', async () => {
    await client.post('/basesnippets').send(baseSnippet).expect(401);
  });

  it('post a basesnippet with authentication should return 200 and contain baseSnippet', async () => {
    await client
      .post('/basesnippets')
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send(baseSnippet)
      .expect(200)
      .then(
        result => (
          expect(result.body).to.containEql(baseSnippet),
          expect(result.body.snippetType).to.be.eql('base'),
          (baseSnippetId = result.body.id)
        ),
      )
      .catch(err => {
        throw err;
      });
  });

  it('count snippet without token should return 401', async () => {
    await client
      .get('/basesnippets/count')
      .set('Content-Type', 'application/json')
      .expect(401);
  });

  it('count snippet with token should return body.count=1', async () => {
    await client
      .get('/basesnippets/count')
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
      .get('/basesnippets')
      .set('Content-Type', 'application/json')
      .expect(401);
  });

  it('get snippet with token should be of length one and contain basesnippet', async () => {
    await client
      .get('/basesnippets')
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(200)
      .then(
        result => (
          expect(result.body.length).to.be.eql(1),
          expect(result.body[0]).to.containEql(baseSnippet)
        ),
      )
      .catch(err => {
        throw err;
      });
  });

  it('get snippets with ID without token should return 401', async () => {
    await client
      .get(`/basesnippets/${baseSnippetId}`)
      .set('Content-Type', 'application/json')
      .expect(401);
  });

  it('get snippet with ID with token should return 200 and contain basesnippet', async () => {
    await client
      .get(`/basesnippets/${baseSnippetId}`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(200)
      .then(result => expect(result.body).to.containEql(baseSnippet))
      .catch(err => {
        throw err;
      });
  });

  it('patch snippet without token should return 401', async () => {
    await client
      .patch('/basesnippets/')
      .set('Content-Type', 'application/json')
      .send({dashboardName: 'aNewName'})
      .expect(401);
  });

  it('patch snippet with toke should return 200 and body.count=1', async () => {
    await client
      .patch('/basesnippets')
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send({dashboardName: 'aNewName'})
      .expect(200)
      .then(result => expect(result.body.count).to.be.eql(1))
      .catch(err => {
        throw err;
      });
  });

  it('put snippet without token should return 401', async () => {
    await client
      .put(`/basesnippets/${baseSnippetId}`)
      .send(baseSnippet)
      .set('Content-Type', 'application/json')
      .expect(401);
  });

  it('put snippet with token should return 204', async () => {
    const baseSnippetPut = {
      ..._.omit(baseSnippet, 'dashboardName'),
      dashboardName: 'dashboardNamePut',
    };
    await client
      .put(`/basesnippets/${baseSnippetId}`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send(baseSnippetPut)
      .expect(204);
  });

  it('Get index without token should return 401', async () => {
    await client
      .get(`/basesnippets/index=${baseSnippetId}`)
      .set('Content-Type', 'application/json')
      .expect(401);
  });

  it('Get index with token should return 200 and body=0', async () => {
    await client
      .get(`/basesnippets/index=${baseSnippetId}`)
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
      .get(`/basesnippets/search=descript`)
      .set('Content-Type', 'application/json')
      .expect(401);
  });

  it('Search index with token should return 200 and matching body.description', async () => {
    await client
      .get(`/basesnippets/search=searchabledesc`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(200)
      .then(
        result => (
          expect(result.body.length).to.be.eql(1),
          expect(result.body[0].description).to.be.eql('aSearchableDescription')
        ),
      )
      .catch(err => {
        throw err;
      });
  });

  it('Search index with token should return 200 and matching body.name', async () => {
    await client
      .get(`/basesnippets/search=searchablename`)
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

  it('Search index with token should return 200 and matching body.textcontent', async () => {
    await client
      .get(`/basesnippets/search=aSearchableText`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(200)
      .then(
        result => (
          expect(result.body.length).to.be.eql(1),
          expect(result.body[0].textcontent).to.be.eql('aSearchableTextContent')
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
        `/basesnippets/search=aSearchabletag?filter=${JSON.stringify(
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
      .patch(`/basesnippets/${baseSnippetId}`)
      .send(baseSnippet)
      .set('Content-Type', 'application/json')
      .expect(401);
  });

  // when patching by id, to preserve the history, the original snippet is duplicated, then a history snippet is created and then the original one is updated
  // to keep the linking between the three, the parentId of the duplicated one = id of the history snippet and the parentId of the history snippet = id of the original one
  // to prevent the search to return too many snippets, the fields used in the subsequent search are updated
  it('patch snippet by id with token should return 204', async () => {
    await client
      .patch(`/basesnippets/${baseSnippetId}`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send({
        tags: ['aSearchExcludedTag'],
        name: 'aSearchExcludedName',
        description: 'aSearchExcludedDescription',
        textcontent: 'aSearchExcludedTextContent',
      })
      .expect(204);
  });

  it('Search index with token should return 200 and matching subsnippets', async () => {
    const includeTags = {fields: {tags: true}, include: ['subsnippets']};
    await client
      .get(
        `/basesnippets/search=aSearchabletag?filter=${JSON.stringify(
          includeTags,
        )}`,
      )
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(200)
      .then(
        result => (
          expect(result.body.length).to.be.eql(2),
          result.body.map((res: Basesnippet) => {
            if (res.subsnippets) {
              expect(res.subsnippets[0].tags).to.be.eql(['aSearchableTag']);
              expect(res.snippetType).to.be.eql('history');
            } else expect(res.tags).to.be.eql(['aSearchableTag']);
          })
        ),
      )
      .catch(err => {
        throw err;
      });
  });

  it('delete snippet by id without token should return 401', async () => {
    await client
      .delete(`/basesnippets/${baseSnippetId}`)
      .set('Content-Type', 'application/json')
      .expect(401);
  });

  it('delete snippet by id with token should return 204', async () => {
    await client
      .delete(`/basesnippets/${baseSnippetId}`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(204);
  });

  it('restore snippet by id without token should return 401', async () => {
    await client
      .patch(`/basesnippets/${baseSnippetId}/restore`)
      .set('Content-Type', 'application/json')
      .expect(401);
  });

  it('restore snippet by id with token should return 204', async () => {
    await client
      .patch(`/basesnippets/${baseSnippetId}/restore`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(204);
  });

  it('export snippet without token should return 401', async () => {
    await client
      .get(`/basesnippets/export=zip`)
      .set('Content-Type', 'application/json')
      .expect(401);
  });

  it('export snippet with token should return 200 and exported zip', async () => {
    await client
      .get(`/basesnippets/export=zip`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(200)
      .then(result =>
        expect(result.headers['content-disposition']).to.be.eql(
          'attachment; filename="all.zip"',
        ),
      )
      .catch(err => {
        throw err;
      });
  });
  it('export snippet with token should return 200 and exported pdf', async () => {
    await client
      .get(`/basesnippets/export=pdf`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(200)
      .then(result =>
        expect(result.headers['content-disposition']).to.be.eql(
          'attachment; filename="export.pdf"',
        ),
      )
      .catch(err => {
        throw err;
      });
  });
});
