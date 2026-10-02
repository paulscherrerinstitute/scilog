import {Client, expect} from '@loopback/testlab';
import {PackageKey, SciLogDbApplication} from '../..';
import {setupApplication} from './test-helper';

describe('HealthController (acceptance)', () => {
  let app: SciLogDbApplication;
  let client: Client;
  let version: string;

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
    ({version} = await app.get(PackageKey));
  });

  after(async () => {
    await app.stop();
  });

  it('reports the process as live', async () => {
    const res = await client
      .get('/health/live')
      .expect(200)
      .expect('Content-Type', /application\/health\+json/)
      .expect('Cache-Control', 'no-cache');

    expect(res.body).to.eql({status: 'pass', releaseId: version});
  });

  it('reports ready when MongoDB answers', async () => {
    const res = await client
      .get('/health')
      .expect(200)
      .expect('Content-Type', /application\/health\+json/)
      .expect('Cache-Control', 'no-cache');

    expect(res.body).to.containDeep({
      status: 'pass',
      releaseId: version,
      checks: {
        'mongodb:responseTime': [
          {componentType: 'datastore', status: 'pass', observedUnit: 'ms'},
        ],
      },
    });
    const [mongo] = res.body.checks['mongodb:responseTime'];
    expect(mongo.observedValue).to.be.a.Number();
    expect(mongo.time).to.be.a.String();
  });
});
