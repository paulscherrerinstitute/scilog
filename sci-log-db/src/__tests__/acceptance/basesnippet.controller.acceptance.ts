import { Client, expect } from '@loopback/testlab';
import { Suite } from 'mocha';
import { SciLogDbApplication } from '../..';
import { User } from '../../models';
import { UserRepository } from '../../repositories';
import { createAUser, setupApplication, userPassword } from './test-helper';


describe('Base snippet controller services', function (this: Suite) {
  this.timeout(1000);
  let app: SciLogDbApplication;
  let client: Client;
  let user: User;
  let token: string;

  async function clearDatabase() {
    const userRepo: UserRepository = await app.get('repositories.UserRepository')
    await userRepo.deleteAll()
  }

  before('setupApplication', async () => {
    ({ app, client } = await setupApplication());
  });
  before(clearDatabase);
  before('login', async () => {
    user = await createAUser(app)
    const loginResponse = await client.post('/users/login').send({ principal: user.email, password: userPassword})
    token = loginResponse.body.token
  })
  after(clearDatabase);

  after(async () => {
    if (app != null) await app.stop();
  });

  it('tries to create location and linked logbook', async () => {
    let acls = {
      createACL: ['unx_sf-bernina-bs'],
      readACL: ['p12345','unx_sf-bernina-bs'],
      updateACL: ['p12345','unx_sf-bernina-bs'],
      deleteACL: ['unx_sf-bernina-bs'],
      shareACL: [user.email,'p12345'],
      adminACL: [user.email,'unx_sf-bernina-bs'],
    }
    let logbook = {
      snippetType: 'logbook',
      isPrivate: false,
      name: 'My logbook',
      description: 'Logbook description goes here',
       ...acls
    }

    const postResponse = await client.post('/locations')
      .set('Authorization', 'Bearer ' + token)
      .send({ name:'cSAXS', location: 'PSI/SLS/CSAXS', ...acls })
      .expect(200)
      .then()
      .catch((err) => {
        throw err;
      });
    var logbookId;
    await client.post('/logbooks')
      .set('Authorization', 'Bearer ' + token)
      .send({ ...logbook, location: `${postResponse.body.id}` })
      .expect(200)
      .then((result) => {
        expect(postResponse.body.snippetType).to.be.eql("location")
        logbookId = result.body.id
        // console.log("Found logbook id:",logbookId)
        expect(result.body.snippetType).to.be.eql("logbook")
        }
      )
      .catch((err) => {
        throw err;
      });

    const logbookResponse=await client.get(`/basesnippets/${logbookId}`)
    .set('Authorization', 'Bearer ' + token)
    .expect(200)
    .then( )
    .catch((err) => {
      throw err;
    });

    // console.log("Logbook response:", logbookResponse.body)
  });
})
