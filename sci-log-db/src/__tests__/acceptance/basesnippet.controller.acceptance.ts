import {Client, expect} from '@loopback/testlab';
import {Suite} from 'mocha';
import {SciLogDbApplication} from '../..';
import {
  clearDatabase,
  createAdminToken,
  createUserToken,
  setupApplication,
} from './test-helper';
import _ from 'lodash';
import {Basesnippet} from '../../models';

describe('Basesnippet', function (this: Suite) {
  this.timeout(5000);
  let app: SciLogDbApplication;
  let client: Client;
  let token: string;
  let adminToken: string;
  let baseSnippetId: string;
  let nonVisibleSnippetId: string;
  const baseSnippet = {
    ownerGroup: 'basesnippetAcceptance',
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
    adminToken = await createAdminToken(app, client);
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
          expect(result.body.readACL).to.be.eql(['basesnippetAcceptance']),
          expect(result.body.createACL).to.be.eql(['basesnippetAcceptance']),
          expect(result.body.updateACL).to.be.eql(['basesnippetAcceptance']),
          expect(result.body.deleteACL).to.be.eql(['basesnippetAcceptance']),
          expect(result.body.adminACL).to.be.eql(['admin@loopback.io']),
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

  it('patch snippet ownergroup with token should return 200 and body.count=0', async () => {
    await client
      .patch('/basesnippets/')
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send({ownerGroup: 'aNewName'})
      .expect(200)
      .then(result => expect(result.body.count).to.be.eql(0))
      .catch(err => {
        throw err;
      });
  });

  it('patch snippet by id with ownergroup and token should return 404', async () => {
    await client
      .patch(`/basesnippets/${baseSnippetId}`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send({ownerGroup: 'aNewName'})
      .expect(404);
  });

  it('post a basesnippet with authentication and without ownerGroup should return 200 and contain baseSnippet', async () => {
    await client
      .post('/basesnippets')
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send(_.omit(baseSnippet, 'ownerGroup'))
      .expect(200)
      .then(
        result => (
          expect(result.body).to.containEql(_.omit(baseSnippet, 'ownerGroup')),
          expect(result.body.snippetType).to.be.eql('base'),
          expect(result.body.readACL).to.be.eql(undefined),
          expect(result.body.createACL).to.be.eql(undefined),
          expect(result.body.updateACL).to.be.eql(undefined),
          expect(result.body.deleteACL).to.be.eql(undefined),
          expect(result.body.shareACL).to.be.eql(undefined),
          expect(result.body.adminACL).to.be.eql(['admin@loopback.io'])
        ),
      )
      .catch(err => {
        throw err;
      });
  });

  it('post a basesnippet with authentication and parentId from existing snippet should return 200 and have parent ACLS', async () => {
    await client
      .post('/basesnippets')
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send({..._.omit(baseSnippet, 'ownerGroup'), parentId: baseSnippetId})
      .expect(200)
      .then(
        result => (
          expect(result.body).to.containEql(_.omit(baseSnippet, 'ownerGroup')),
          expect(result.body.snippetType).to.be.eql('base'),
          expect(result.body.readACL).to.be.eql(['basesnippetAcceptance']),
          expect(result.body.createACL).to.be.eql(['basesnippetAcceptance']),
          expect(result.body.updateACL).to.be.eql(['basesnippetAcceptance']),
          expect(result.body.deleteACL).to.be.eql(['basesnippetAcceptance']),
          expect(result.body.shareACL).to.be.eql(['basesnippetAcceptance']),
          expect(result.body.adminACL).to.be.eql(['admin@loopback.io'])
        ),
      )
      .catch(err => {
        throw err;
      });
  });

  it('patch snippet by id with ownergroup and admin token should return 204', async () => {
    await client
      .patch(`/basesnippets/${baseSnippetId}`)
      .set('Authorization', 'Bearer ' + adminToken)
      .set('Content-Type', 'application/json')
      .send({createACL: ['aNewCreateACL']})
      .expect(204);
  });

  it('post a basesnippet with authentication and parentId from existing snippet should return 200 and have parent ACLS with priority on ownergroup', async () => {
    await client
      .post('/basesnippets')
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send({...baseSnippet, parentId: baseSnippetId})
      .expect(200)
      .then(
        result => (
          expect(result.body).to.containEql(baseSnippet),
          expect(result.body.snippetType).to.be.eql('base'),
          expect(result.body.readACL).to.be.eql(['basesnippetAcceptance']),
          expect(result.body.createACL).to.be.eql(['aNewCreateACL']),
          expect(result.body.updateACL).to.be.eql(['basesnippetAcceptance']),
          expect(result.body.deleteACL).to.be.eql(['basesnippetAcceptance']),
          expect(result.body.shareACL).to.be.eql(['basesnippetAcceptance']),
          expect(result.body.adminACL).to.be.eql(['admin@loopback.io'])
        ),
      )
      .catch(err => {
        throw err;
      });
  });

  it('post a basesnippet with authentication and parentId from existing snippet setting explict ACLS should return 200 and have set ACLS with priority on ownergroup and parentACLs', async () => {
    await client
      .post('/basesnippets')
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send({
        ...baseSnippet,
        parentId: baseSnippetId,
        readACL: ['aReadACL'],
        updateACL: ['anUpdateACL'],
      })
      .expect(200)
      .then(
        result => (
          expect(result.body).to.containEql({
            ..._.omit(baseSnippet, 'ownerGroup'),
            ownerGroup: 'aReadACL',
          }),
          expect(result.body.snippetType).to.be.eql('base'),
          expect(result.body.readACL).to.be.eql(['aReadACL']),
          expect(result.body.createACL).to.be.eql(['aNewCreateACL']),
          expect(result.body.updateACL).to.be.eql(['anUpdateACL']),
          expect(result.body.deleteACL).to.be.eql(['basesnippetAcceptance']),
          expect(result.body.shareACL).to.be.eql(['basesnippetAcceptance']),
          expect(result.body.adminACL).to.be.eql(['admin@loopback.io']),
          (nonVisibleSnippetId = result.body.id)
        ),
      )
      .catch(err => {
        throw err;
      });
  });

  it('get snippet with ID with token having changed readACL should return 404', async () => {
    await client
      .get(`/basesnippets/${nonVisibleSnippetId}`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(404);
  });

  it('post a basesnippet with authentication and accessGroups should return 200 and have corresponding ACLs', async () => {
    await client
      .post('/basesnippets')
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send({...baseSnippet, accessGroups: ['anAccessGroup']})
      .expect(200)
      .then(
        result => (
          expect(result.body).to.containEql({
            ..._.omit(baseSnippet, 'accessGroups'),
            accessGroups: ['basesnippetAcceptance', 'anAccessGroup'],
          }),
          expect(result.body.snippetType).to.be.eql('base'),
          expect(result.body.readACL).to.be.eql([
            'basesnippetAcceptance',
            'anAccessGroup',
          ]),
          expect(result.body.createACL).to.be.eql(['basesnippetAcceptance']),
          expect(result.body.updateACL).to.be.eql(['basesnippetAcceptance']),
          expect(result.body.deleteACL).to.be.eql(['basesnippetAcceptance']),
          expect(result.body.shareACL).to.be.eql(['basesnippetAcceptance']),
          expect(result.body.adminACL).to.be.eql(['admin@loopback.io']),
          (nonVisibleSnippetId = result.body.id)
        ),
      )
      .catch(err => {
        throw err;
      });
  });
});
