import {juggler} from '@loopback/repository';
import {
  createStubInstance,
  expect,
  StubbedInstanceWithSinonAccessor,
  stubExpressContext,
} from '@loopback/testlab';
import {HealthController} from '../../controllers/health.controller';

describe('HealthController (unit)', () => {
  const pkg = {name: 'api', version: '1.2.3', description: ''};
  let dataSource: StubbedInstanceWithSinonAccessor<juggler.DataSource>;

  beforeEach(() => {
    dataSource = createStubInstance(juggler.DataSource);
  });

  async function givenReadyResponse() {
    const {response, result} = stubExpressContext();
    await new HealthController(dataSource, pkg, response).ready();
    const {statusCode, payload} = await result;
    return {statusCode, body: JSON.parse(payload)};
  }

  it('reports not ready when the MongoDB ping fails', async () => {
    dataSource.stubs.ping.rejects(new Error('connection refused'));

    const {statusCode, body} = await givenReadyResponse();

    expect(statusCode).to.equal(503);
    expect(body).to.containDeep({
      status: 'fail',
      releaseId: '1.2.3',
      checks: {'mongodb:responseTime': [{status: 'fail'}]},
    });
    expect(body.checks['mongodb:responseTime'][0]).to.not.have.property(
      'observedValue',
    );
  });

  it('reports not ready when MongoDB does not answer in time', async () => {
    // Assigned directly: the stub API only accepts the callback form of ping().
    dataSource.ping = () => new Promise<void>(() => {});

    const {statusCode, body} = await givenReadyResponse();

    expect(statusCode).to.equal(503);
    expect(body.status).to.equal('fail');
  }).timeout(5000); // waits for the 2 s ping timeout
});
