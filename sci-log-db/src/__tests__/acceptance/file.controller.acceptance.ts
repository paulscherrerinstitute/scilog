import { Client, expect } from '@loopback/testlab';
import { Suite } from 'mocha';
import { SciLogDbApplication } from '../..';
import { User } from '../../models';
import { UserRepository } from '../../repositories';
import { createAUser, setupApplication, userPassword } from './test-helper';


describe('File controller services', function (this: Suite) {
  this.timeout(5000);
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

  it('tries to post a file with incompatible fields', async () => {
    await client.post('/filesnippet/files')
      .set('Authorization', 'Bearer ' + token)
      .type('form')
      .field('fields', '{"something": "a"}')
      .attach('file', __filename)
      .expect(422)
      .then((result) =>
        expect(result.body.error.details.messages).to.be.eql({ something: ['is not defined in the model'] }),
      )
      .catch((err) => {
        throw err;
      });
  });

  it('tries to post without a file', async () => {
    await client.post('/filesnippet/files')
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'multipart/form-data')
      .expect(422)
      .then((result) =>
        expect(result.body.error.message).to.be.eql('A file must be provided')
      )
      .catch((err) => {
        throw err;
      });
  });

  it('tries to post a file with empty fields', async () => {
    await client.post('/filesnippet/files')
      .set('Authorization', 'Bearer ' + token)
      .type('form')
      .attach('file', __filename)
      .expect(200)
      .then()
      .catch((err) => {
        throw err;
      });
  });

  it('tries to post a file with allowed field', async () => {
    await client.post('/filesnippet/files')
      .set('Authorization', 'Bearer ' + token)
      .type('form')
      .field('fields', '{"ownerGroup": "aOwner"}')
      .attach('file', __filename)
      .expect(200)
      .then()
      .catch((err) => {
        throw err;
      });
  });

  it('tries to get a file with matching pgroup after posting', async () => {
    const postResponse = await client.post('/filesnippet/files')
      .set('Authorization', 'Bearer ' + token)
      .type('form')
      .field('fields', '{"ownerGroup": "any-authenticated-user"}')
      .attach('file', __filename)
      .then()
      .catch((err) => {
        throw err;
      });

    await client.get(`/filesnippet/${postResponse.body.id}/files`)
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .then((result) => {
        expect(result.text).to.startWith('"use strict"');
        expect(result.type).to.eql('application/javascript');
      })
      .catch((err) => {
        throw err;
      });
  });

  it('patches a file after having created it', async () => {
    const postResponse = await client.post('/filesnippet/files')
      .set('Authorization', 'Bearer ' + token)
      .type('form')
      .field('fields', '{"ownerGroup": "any-authenticated-user"}')
      .attach('file', __filename)
      .then()
      .catch((err) => {
        throw err;
      });

    await client.patch(`/filesnippet/${postResponse.body.id}/files`)
      .set('Authorization', 'Bearer ' + token)
      .field('fields', '{"description": "something"}')
      .attach('file', __filename)
      .expect(204)
      .then()
      .catch((err) => {
        throw err;
      });
  });

})
