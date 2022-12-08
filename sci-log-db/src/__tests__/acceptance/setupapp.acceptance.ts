import {expect, sinon} from '@loopback/testlab';
import {SciLogDbApplication} from '../../application';
import {oidcOptions, setupApplication} from './test-helper';

describe('SetupApp', () => {
  const sandbox = sinon.createSandbox();
  let app: SciLogDbApplication;

  afterEach(done => {
    sandbox.restore();
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
});
