// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Client, expect, sinon} from '@loopback/testlab';
import {Suite} from 'mocha';
import {SciLogDbApplication} from '../..';
import {clearDatabase, createUserToken, setupApplication} from './test-helper';
import {BasesnippetRepository} from '../../repositories';
import fs from 'fs';
import {Basesnippet, Location, Logbook, Paragraph} from '../../models';

class TestFunctionalAccountsApp extends SciLogDbApplication {
  locations = ['location1', 'location2'];
  idsLocation: Record<string, string>;

  constructor() {
    super(SciLogDbApplication);
    this.idsLocation = {};
  }

  async createLocationSnippets(location: string) {
    const locationId = await this.createLogbook(location, {
      snippetType: 'location',
      location: location,
    });
    const acls = await this.computeAcls();
    const snippetId = await this.createLogbook(location, {
      snippetType: 'logbook',
      location: locationId,
      ...acls,
    });
    await this.createLogbook(location, {
      snippetType: 'paragraph',
      parentId: snippetId,
      ...acls,
    });
  }

  private async computeAcls() {
    const basesnippetRepo = await this.getRepository(BasesnippetRepository);
    const acls = basesnippetRepo.acls.reduce(
      (currentValue: Record<string, ['acl']>, previousValue: string) => (
        (currentValue[previousValue] = ['acl']), currentValue
      ),
      {},
    );
    return acls;
  }

  private async createLogbook(
    location: string,
    snippetArgs: Partial<Location | Logbook | Paragraph>,
  ) {
    const basesnippetRepo = await this.getRepository(BasesnippetRepository);

    const snippet = await basesnippetRepo.create(snippetArgs, {
      currentUser: {roles: ['admin']},
    });
    this.idsLocation[snippet.id] = location;
    return snippet.id;
  }

  async migrateSchema() {
    for (const location of this.locations) {
      await this.createLocationSnippets(location);
    }
  }
}

describe('CreateFunctionalAccountsObserver', function (this: Suite) {
  this.timeout(5000);
  let app: TestFunctionalAccountsApp;
  let client: Client;
  const filePath = './functionalAccounts.json';
  const bkFilePath = `${filePath}.bk`;
  let token: string;
  const sandbox = sinon.createSandbox();

  function backupFunctionalAccountsFile() {
    if (!fs.existsSync(filePath)) return;
    const functionalAccounts = fs.readFileSync(filePath, 'utf8');
    fs.writeFileSync(
      bkFilePath,
      JSON.stringify(JSON.parse(functionalAccounts), null, 2),
      'utf8',
    );
  }

  function restoreFunctionalAccounts() {
    if (!fs.existsSync(bkFilePath)) return;
    fs.copyFileSync(bkFilePath, filePath);
    fs.unlinkSync(bkFilePath);
  }

  function createFunctionalAccountsFile() {
    backupFunctionalAccountsFile();
    const functionalAccounts = [
      {
        username: 'account1',
        firstName: 'account1',
        lastName: 'account1',
        password: 'account1@account1',
        email: 'account1@account1',
        roles: ['admin', 'any-authenticated-user'],
        location: 'location1',
      },
      {
        username: 'account2',
        firstName: 'account2',
        lastName: 'account2',
        password: 'account2@account2',
        email: 'account2@account2',
        roles: ['p123', 'any-authenticated-user'],
        unxGroup: 'unxGroup2',
        location: 'location2',
      },
    ];
    fs.writeFileSync(
      filePath,
      JSON.stringify(functionalAccounts, null, 2),
      'utf8',
    );
  }

  before('setupApplication', async () => {
    createFunctionalAccountsFile();
    ({app, client} = await setupApplication<TestFunctionalAccountsApp>(
      {databaseSeeding: true},
      TestFunctionalAccountsApp,
    ));
    restoreFunctionalAccounts();
    token = await createUserToken(app, client, ['admin']);
  });

  after(async () => {
    await clearDatabase(app);
    if (app != null) await app.stop();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('addAclsToExistingSnippetsFromAccount', async () => {
    await client
      .get('/basesnippets')
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .then(result => {
        result.body.forEach((snippet: Basesnippet) => {
          if (
            snippet.snippetType === 'location' &&
            app.idsLocation[snippet.id] === 'location1'
          )
            expect(snippet.updateACL).to.eql(undefined);
          else if (
            snippet.snippetType === 'location' &&
            app.idsLocation[snippet.id] === 'location2'
          )
            expect(snippet.updateACL).to.eql(['unxGroup2']);
          else if (app.idsLocation[snippet.id] === 'location1') {
            expect(snippet.createACL).to.eql(['acl']);
            expect(snippet.readACL).to.eql(['acl']);
            expect(snippet.shareACL).to.eql(['acl']);
            expect(snippet.updateACL).to.eql(['acl']);
            expect(snippet.deleteACL).to.eql(['acl']);
            expect(snippet.adminACL).to.eql(['acl']);
          } else if (app.idsLocation[snippet.id] === 'location2') {
            expect(snippet.createACL).to.eql(['acl', 'unxGroup2']);
            expect(snippet.readACL).to.eql(['acl', 'unxGroup2']);
            expect(snippet.shareACL).to.eql(['acl', 'unxGroup2']);
            expect(snippet.updateACL).to.eql(['acl', 'unxGroup2']);
            expect(snippet.deleteACL).to.eql(['acl', 'unxGroup2']);
            expect(snippet.adminACL).to.eql(['acl', 'unxGroup2']);
          }
        });
      });
  });

  it('migrateUnxGroup', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createFunctionalAccountsObserver: any = await app.get(
      'lifeCycleObservers.CreateFunctionalAccountsObserver',
    );
    const addAclsToExistingSnippetsFromAccountSpy = sandbox.spy(
      createFunctionalAccountsObserver,
      'addAclsToExistingSnippetsFromAccount',
    );
    await createFunctionalAccountsObserver.migrateUnxGroup();
    expect(addAclsToExistingSnippetsFromAccountSpy.callCount).to.eql(1);
    expect(addAclsToExistingSnippetsFromAccountSpy.args[0][0]).to.match({
      username: 'account2',
      firstName: 'account2',
      lastName: 'account2',
      email: 'account2@account2',
      unxGroup: 'unxGroup2',
      location: 'location2',
    });
    const updateAllSpy = sandbox.spy(
      createFunctionalAccountsObserver.basesnippetRepository,
      'updateAll',
    );
    const updateDescendantsAclsSpy = sandbox.spy(
      createFunctionalAccountsObserver,
      'updateDescendantsAcls',
    );
    await createFunctionalAccountsObserver.migrateUnxGroup();
    expect(updateDescendantsAclsSpy.callCount).to.eql(1);
    expect(updateAllSpy.callCount).to.eql(0);
  });
});
