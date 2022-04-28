import { expect, sinon } from "@loopback/testlab";
import { SciLogDbApplication } from "../../application";
import { setupApplication } from "./test-helper";  

describe('SetupApp', () => {
  const sandbox = sinon.createSandbox()
  
  it('Tries to open the datasource file', async () => {
    const spyBind = sandbox.spy(SciLogDbApplication.prototype, 'bind');
    await setupApplication();
    expect(spyBind.args.length).to.be.greaterThan(0)
    expect(spyBind.calledWith('datasources.config.mongo')).to.be.false;
  });
});
