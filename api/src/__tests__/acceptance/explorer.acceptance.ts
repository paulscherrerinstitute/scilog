import {Client} from '@loopback/testlab';
import {SciLogDbApplication} from '../..';
import {setupApplication} from './test-helper';

describe('Explorer', () => {
  let app: SciLogDbApplication;
  let client: Client;

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  it('exposes self-hosted explorer', async () => {
    await client
      .get('/explorer/')
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .expect(/<title>LoopBack API Explorer/);
  });
});
