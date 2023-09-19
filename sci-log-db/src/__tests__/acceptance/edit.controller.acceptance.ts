import {Client, expect} from '@loopback/testlab';
import {Suite} from 'mocha';
import {SciLogDbApplication} from '../..';
import {clearDatabase, createUserToken, setupApplication} from './test-helper';
import _ from 'lodash';
const Mongo = require('mongodb');

describe('Edit', function (this: Suite) {
  this.timeout(5000);
  let app: SciLogDbApplication;
  let client: Client;
  let token: string;
  const parentId = Mongo.ObjectId(123);
  const editSnippet = {
    ownerGroup: 'editAcceptance',
    createACL: ['editAcceptance'],
    readACL: ['editAcceptance'],
    updateACL: ['editAcceptance'],
    deleteACL: ['editAcceptance'],
    adminACL: ['admin'],
    shareACL: ['editAcceptance'],
    parentId: parentId,
    snippetType: 'edit',
  };

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
    await clearDatabase(app);
    token = await createUserToken(app, client, ['editAcceptance']);
  });

  beforeEach('createEdits', async () => {
    await client
      .post('/basesnippets')
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send(editSnippet);
    await client
      .post('/basesnippets')
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send(editSnippet);
  });

  after(async () => {
    await clearDatabase(app);
    if (app != null) await app.stop();
  });

  it('should delete all edit snippets with parentId and keep paragraph', async () => {
    await client
      .post('/paragraphs')
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send(editSnippet);
    await client
      .delete(`/edits/paragraphs-to-delete/${parentId}`)
      .set('Authorization', 'Bearer ' + token)
      .expect(204);

    await client
      .get('/paragraphs')
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(200)
      .then(
        result => (
          expect(result.body.length).to.eql(1),
          expect(result.body[0].snippetType).to.eql('paragraph')
        ),
      )
      .catch(err => {
        throw err;
      });
  });

  it(`should delete all edit snippets with parentId=${parentId}`, async () => {
    const newParentId = Mongo.ObjectId(456);
    await client
      .post('/basesnippets')
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .send({..._.omit(editSnippet, 'parentId'), parentId: newParentId});
    await client
      .delete(`/edits/paragraphs-to-delete/${parentId}`)
      .set('Authorization', 'Bearer ' + token)
      .expect(204);

    await client
      .get(
        `/basesnippets?filter=${JSON.stringify({
          where: {snippetType: 'edit'},
        })}`,
      )
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(200)
      .then(
        result => (
          expect(result.body.length).to.eql(1),
          expect(result.body[0].parentId).to.eql(newParentId.toString()),
          expect(result.body[0].snippetType).to.eql('edit')
        ),
      )
      .catch(err => {
        throw err;
      });
  });
});
