import {Client, expect} from '@loopback/testlab';
import {Suite} from 'mocha';
import {SciLogDbApplication} from '../..';
import {clearDatabase, createUserToken, setupApplication} from './test-helper';

const group = 'operatorInjection';

const operatorBody = {$set: {dashboardName: 'anInjectedDashboardName'}};

// Controllers exposing a bulk update, which forwards the request body to the
// repository as-is.
const bulkUpdatePaths = [
  '/basesnippets',
  '/paragraphs',
  '/logbooks',
  '/filesnippet',
  '/tasks',
  '/locations',
  '/views',
  '/jobs',
  '/user-preferences',
];

describe('Mongo operator keys in request bodies', function (this: Suite) {
  this.timeout(5000);

  let app: SciLogDbApplication;
  let client: Client;
  let token: string;
  let snippetId: string;

  const paragraphSnippet = {
    ownerGroup: group,
    createACL: [group],
    readACL: [group],
    updateACL: [group],
    deleteACL: [group],
    adminACL: ['admin'],
    shareACL: [group],
    isPrivate: true,
    defaultOrder: 0,
    expiresAt: '2055-10-10T14:04:19.522Z',
    dashboardName: 'anOriginalDashboardName',
    versionable: true,
    textcontent: 'anOriginalTextContent',
  };

  function authHeaders() {
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async function readSnippet() {
    const {body} = await client
      .get(`/paragraphs/${snippetId}`)
      .set(authHeaders())
      .expect(200);
    return body;
  }

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
    await clearDatabase(app);
    token = await createUserToken(app, client, [group]);
  });

  beforeEach('createSnippet', async () => {
    const {body} = await client
      .post('/paragraphs')
      .set(authHeaders())
      .send(paragraphSnippet)
      .expect(200);
    snippetId = body.id;
  });

  after(async () => {
    await clearDatabase(app);
    await app?.stop();
  });

  it('rejects an operator key when patching a snippet by id', async () => {
    await client
      .patch(`/paragraphs/${snippetId}`)
      .set(authHeaders())
      .send(operatorBody)
      .expect(400);
  });

  it('leaves the snippet unchanged when patching by id with an operator key', async () => {
    const before = await readSnippet();
    await client
      .patch(`/paragraphs/${snippetId}`)
      .set(authHeaders())
      .send(operatorBody);
    const after = await readSnippet();
    expect(after.dashboardName).to.eql(before.dashboardName);
  });

  it('does not grant admin rights when patching by id with an operator key', async () => {
    const before = await readSnippet();
    await client
      .patch(`/paragraphs/${snippetId}`)
      .set(authHeaders())
      .send({$set: {adminACL: [group]}});
    const after = await readSnippet();
    expect(after.adminACL).to.eql(before.adminACL);
  });

  bulkUpdatePaths.forEach(path => {
    it(`rejects an operator key when patching ${path}`, async () => {
      await client
        .patch(path)
        .set(authHeaders())
        .send(operatorBody)
        .expect(400);
    });
  });

  it('leaves snippets unchanged when patching in bulk with an operator key', async () => {
    const before = await readSnippet();
    await client.patch('/paragraphs').set(authHeaders()).send(operatorBody);
    const after = await readSnippet();
    expect(after.dashboardName).to.eql(before.dashboardName);
  });

  it('rejects an operator key when posting a snippet', async () => {
    await client
      .post('/paragraphs')
      .set(authHeaders())
      .send({...paragraphSnippet, $set: {snippetType: 'logbook'}})
      .expect(400);
  });
});
