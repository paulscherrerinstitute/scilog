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
    const loginResponse = await client.post('/users/login').send({ principal: user.email, password: userPassword })
    token = loginResponse.body.token
  })
  after(clearDatabase);

  after(async () => {
    if (app != null) await app.stop();
  });

  it('tries to create location', async () => {
    let acls={
      createACL:['unx_sf-bernina-bs'],
      readACL:['any-authenticated-user'],
      updateACL:['unx_sf-bernina-bs'],
      deleteACL:['unx_sf-bernina-bs'],
      shareACL:[''],
      adminACL:['unx_sf-bernina-bs'],
    }
    await client.post('/basesnippets')
      .set('Authorization', 'Bearer ' + token)
      .send({snippetType: 'paragraph', title:'location', ...acls})
      .expect(200)
      .then((result) =>
        expect(result.body.title).to.be.eql("location"),
      )
      .catch((err) => {
        throw err;
      });
  });


})
