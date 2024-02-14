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
    createACL: ['basesnippetAcceptance'],
    readACL: ['basesnippetAcceptance'],
    updateACL: ['basesnippetAcceptance'],
    deleteACL: ['basesnippetAcceptance'],
    adminACL: ['admin'],
    shareACL: ['basesnippetAcceptance'],
    isPrivate: true,
    defaultOrder: 0,
    expiresAt: '2055-10-10T14:04:19.522Z',
    tags: ['aSearchableTag'],
    dashboardName: 'string',
    versionable: true,
    name: 'aSearchableName',
    description: 'aSearchableDescription',
    textcontent: '<p>aSearchableTextContent</p>',
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
          expect(result.body.adminACL).to.be.eql(['admin']),
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

  it('Search with token should return 200 and matching body.name', async () => {
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

  it('Search with token should return 200 and matching body.textcontent', async () => {
    await client
      .get(`/basesnippets/search=aSearchableText`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(200)
      .then(
        result => (
          expect(result.body.length).to.be.eql(1),
          expect(result.body[0].textcontent).to.be.eql(
            '<p>aSearchableTextContent</p>',
          )
        ),
      )
      .catch(err => {
        throw err;
      });
  });

  it('Search with token should return 200 and matching body.tags', async () => {
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

  it('Search with token should return 200 and matching readACL', async () => {
    await client
      .get(`/basesnippets/search=basesnippetAccept`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(200)
      .then(
        result => (
          expect(result.body.length).to.be.eql(1),
          expect(result.body[0].readACL).to.be.eql(['basesnippetAcceptance'])
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
        textcontent:
          '<p>aSearchExcludedTextContent</p><p>&aSearchableTextContent</p>',
        ownerGroup: 'basesnippetAcceptance',
        accessGroups: ['basesnippetAcceptance'],
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

  it('post a basesnippet with authentication and parentId from existing snippet should return 200 and have parent ACLS', async () => {
    await client
      .post('/basesnippets')
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send({
        ..._.omit(baseSnippet, [
          'ownerGroup',
          'createACL',
          'deleteACL',
          'readACL',
          'updateACL',
          'shareACL',
          'adminACL',
        ]),
        parentId: baseSnippetId,
      })
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
          expect(result.body.adminACL).to.be.eql(['admin'])
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

  it('patch snippet by id with ownergroup and token should return 404', async () => {
    await client
      .patch(`/basesnippets/${baseSnippetId}`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send({createACL: ['aNonAllowedACL']})
      .expect(404);
  });

  it('post a basesnippet with authentication and parentId from existing snippet should return 200 and have ownergroup with priority on parent ACLS', async () => {
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
          expect(result.body.createACL).to.be.eql(['basesnippetAcceptance']),
          expect(result.body.updateACL).to.be.eql(['basesnippetAcceptance']),
          expect(result.body.deleteACL).to.be.eql(['basesnippetAcceptance']),
          expect(result.body.shareACL).to.be.eql(['basesnippetAcceptance']),
          expect(result.body.adminACL).to.be.eql(['admin'])
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
            ..._.omit(baseSnippet, ['ownerGroup', 'readACL', 'updateACL']),
            ownerGroup: 'aReadACL',
          }),
          expect(result.body.snippetType).to.be.eql('base'),
          expect(result.body.readACL).to.be.eql(['aReadACL']),
          expect(result.body.createACL).to.be.eql(['basesnippetAcceptance']),
          expect(result.body.updateACL).to.be.eql(['anUpdateACL']),
          expect(result.body.deleteACL).to.be.eql(['basesnippetAcceptance']),
          expect(result.body.shareACL).to.be.eql(['basesnippetAcceptance']),
          expect(result.body.adminACL).to.be.eql(['admin']),
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

  it('get snippet with token and ownerGroup filter should be greater than one', async () => {
    const ownerGroupFilter = {where: {ownerGroup: baseSnippet.ownerGroup}};
    await client
      .get(`/basesnippets?filter=${JSON.stringify(ownerGroupFilter)}`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(200)
      .then(result => expect(result.body.length).to.be.greaterThan(1))
      .catch(err => {
        throw err;
      });
  });

  it('get snippet with token and ownerGroup and accessGroups filter should be greater than one', async () => {
    const filter = {
      where: {
        ownerGroup: baseSnippet.ownerGroup,
        accessGroups: baseSnippet.ownerGroup,
      },
    };
    await client
      .get(`/basesnippets?filter=${JSON.stringify(filter)}`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(200)
      .then(result => expect(result.body.length).to.be.greaterThan(1))
      .catch(err => {
        throw err;
      });
  });

  it('get snippet with token and accessGroups filter should be greater than one', async () => {
    const filter = {where: {accessGroups: baseSnippet.ownerGroup}};
    await client
      .get(`/basesnippets?filter=${JSON.stringify(filter)}`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(200)
      .then(result => expect(result.body.length).to.be.greaterThan(1))
      .catch(err => {
        throw err;
      });
  });

  it('get snippet with token and non existing ownerGroup filter should be zero', async () => {
    const filter = {where: {ownerGroup: 'aNonExtingOwnerGroup'}};
    await client
      .get(`/basesnippets?filter=${JSON.stringify(filter)}`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(200)
      .then(result => expect(result.body.length).to.be.eql(0))
      .catch(err => {
        throw err;
      });
  });

  it('get snippet with token and non existing accessGroups filter should be zero', async () => {
    const filter = {where: {accessGroups: 'aNonExtingAccessGroup'}};
    await client
      .get(`/basesnippets?filter=${JSON.stringify(filter)}`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(200)
      .then(result => expect(result.body.length).to.be.eql(0))
      .catch(err => {
        throw err;
      });
  });

  it('get snippet with token and ownerGroup and non existing accessGroups filter should be greater than one', async () => {
    const filter = {
      where: {
        ownerGroup: baseSnippet.ownerGroup,
        accessGroups: 'aNonExtingAccessGroup',
      },
    };
    await client
      .get(`/basesnippets?filter=${JSON.stringify(filter)}`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(200)
      .then(result => expect(result.body.length).to.be.eql(0))
      .catch(err => {
        throw err;
      });
  });

  it('export snippet with token and parentId should return 200 and exported pdf', async () => {
    await client
      .post('/basesnippets')
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send({...baseSnippet, parentId: baseSnippetId});

    const whereParentId = {where: {parentId: baseSnippetId}};
    await client
      .get(`/basesnippets/export=pdf?filter=${JSON.stringify(whereParentId)}`)
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

  it('export snippet with token and parentId should return 200 and exported gz', async () => {
    await client
      .post('/basesnippets')
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send({
        ...baseSnippet,
        files: [{accessHash: 'someHash', fileHash: 'file1'}],
        textcontent: "<div class='fileLink' href='file:file1'>someFile</div>",
        parentId: baseSnippetId,
      });

    const whereParentId = {where: {parentId: baseSnippetId}};
    await client
      .get(`/basesnippets/export=pdf?filter=${JSON.stringify(whereParentId)}`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(200)
      .then(result =>
        expect(result.headers['content-disposition'].slice(-4, -1)).to.be.eql(
          '.gz',
        ),
      )
      .catch(err => {
        throw err;
      });
  });

  [
    {
      input: {
        ownerGroup: 'basesnippetAcceptance',
        accessGroups: ['someNew'],
      },
      expected: 204,
    },
    {
      input: {readACL: ['basesnippetAcceptance', 'someNew']},
      expected: 204,
    },
    {
      input: {
        readACL: ['basesnippetAcceptance', 'someNew'],
        accessGroups: ['someAccessGroups'],
        ownerGroup: 'someOwnerGroup',
      },
      expected: 204,
    },
    {
      input: {name: 'aName'},
      expected: 403,
    },
  ].forEach((t, i) => {
    it(`patch accessGroups of snippet by id with token ${i}`, async () => {
      const snippet = await client
        .post('/basesnippets')
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/json')
        .send({
          ..._.omit(baseSnippet, ['expiresAt', 'adminACL']),
          adminACL: ['basesnippetAcceptance'],
          expiresAt: '1970-01-01T00:00:00.000Z',
        });

      await client
        .patch(`/basesnippets/${snippet.body.id}`)
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/json')
        .send(t.input)
        .expect(t.expected);

      if (t.expected === 204)
        await client
          .get(`/basesnippets/${snippet.body.id}`)
          .set('Authorization', 'Bearer ' + token)
          .set('Content-Type', 'application/json')
          .expect(200)
          .then(
            result => (
              expect(result.body.ownerGroup).to.be.eql('basesnippetAcceptance'),
              expect(result.body.accessGroups).to.be.eql([
                'basesnippetAcceptance',
                'someNew',
              ]),
              expect(result.body.readACL).to.be.eql([
                'basesnippetAcceptance',
                'someNew',
              ])
            ),
          )
          .catch(err => {
            throw err;
          });
    });
  });

  [
    {
      input: {
        ownerGroup: 'basesnippetAcceptance',
        accessGroups: ['someNew'],
      },
      expected: 204,
    },
    {
      input: {deleteACL: ['basesnippetAcceptance', 'someNew']},
      expected: 404,
    },
    {
      input: {
        deleteACL: ['restrict', 'someNew'],
        token: 'adminToken',
      },
      expected: 204,
    },
    {
      input: {readACL: ['basesnippetAcceptance', 'someNew']},
      expected: 204,
    },
    {
      input: {
        accessGroups: ['someNew'],
      },
      expected: 403,
    },
  ].forEach((t, i) => {
    it(`patch snippet by id changing ownerGroup should return ${i}`, async () => {
      const blockToken = t.input.token === 'adminToken' ? adminToken : token;
      await client
        .patch(`/basesnippets/${baseSnippetId}`)
        .set('Authorization', 'Bearer ' + blockToken)
        .set('Content-Type', 'application/json')
        .send({
          tags: ['aSearchExcludedTag'],
          name: 'aSearchExcludedName',
          description: 'aSearchExcludedDescription',
          textcontent:
            '<p>aSearchExcludedTextContent</p><p>&aSearchableTextContent</p>',
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

  it(`patch snippet by id with non-authorised user should return 404`, async () => {
    const bs = await client
      .post('/basesnippets')
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send({
        ..._.omit(baseSnippet, 'updateACL'),
        updateACL: ['nonAuthorised'],
      });
    await client
      .patch(`/basesnippets/${bs.body.id}`)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send({name: 'something'})
      .expect(404)
      .catch(err => {
        throw err;
      });
  });

  [404, 204].forEach(t => {
    it(`delete snippet should return ${t}`, async () => {
      await client
        .delete(`/basesnippets/${baseSnippetId}`)
        .set('Authorization', `Bearer ${t === 404 ? token : adminToken}`)
        .set('Content-Type', 'application/json')
        .expect(t);
    });
  });
});
