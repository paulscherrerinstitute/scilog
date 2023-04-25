import {expect, sinon} from '@loopback/testlab';
import {SciLogDbApplication} from '../../application';
import {oidcOptions, setupApplication} from './test-helper';
import MongoStore from 'connect-mongo';

describe('SetupApp', () => {
  const sandbox = sinon.createSandbox();
  let app: SciLogDbApplication;
  const env = Object.assign({}, process.env);

  afterEach(done => {
    sandbox.restore();
    process.env = env;
    done();
  });

  afterEach(async () => {
    if (app != null) await app.stop();
  });

  it('Tries to open the datasource file', async () => {
    const spyBind = sandbox.spy(SciLogDbApplication.prototype, 'bind');
    app = (await setupApplication()).app;
    expect(spyBind.args.length).to.be.greaterThan(0);
    // eslint-disable-next-line no-unused-expressions
    expect(spyBind.calledWith('datasources.config.mongo')).to.be.false;
  });

  it('Tries to set oidc strategy', async () => {
    const spyBind = sandbox.spy(SciLogDbApplication.prototype, 'bind');
    app = (await setupApplication()).app;
    expect(spyBind.args.length).to.be.greaterThan(0);
    // eslint-disable-next-line no-unused-expressions
    expect(spyBind.calledWith('oidcOptions')).to.be.false;
  });

  it('Tries to set oidc from config strategy', async () => {
    const spyBind = sandbox.spy(SciLogDbApplication.prototype, 'bind');

    app = (await setupApplication({oidcOptions: oidcOptions})).app;
    expect(spyBind.args.length).to.be.greaterThan(0);
    // eslint-disable-next-line no-unused-expressions
    expect(spyBind.calledWith('oidcOptions')).to.be.true;
  });

  const tests = ['', 'true'];
  tests.forEach((t, i) => {
    it(`Sets session store to ${t}`, async () => {
      const client = (await setupApplication({oidcOptions: oidcOptions}))
        .client;
      const mongoStub = sandbox.stub(MongoStore, 'create');
      process.env.SESSION_STORE_BUILDER = t;
      await client
        .get('/')
        .expect(200)
        .expect('Content-Type', /text\/html/);
      expect(mongoStub.callCount).to.eql(i);
      if (t)
        expect(mongoStub.args[0]).to.eql([
          {mongoUrl: 'mongodb://mongodb:27017/testdb'},
        ]);
    });
  });
});
