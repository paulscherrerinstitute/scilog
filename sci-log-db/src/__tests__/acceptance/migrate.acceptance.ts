import {expect} from '@loopback/testlab';
import {Suite} from 'mocha';
import {SciLogDbApplication} from '../..';
import {clearDatabase, setupApplication} from './test-helper';
import {createSandbox} from 'sinon';
import {ParagraphRepository} from '../../repositories';
import * as util from '../../utils/misc';

describe('Migrate', function (this: Suite) {
  this.timeout(5000);
  let app: SciLogDbApplication;
  const sandbox = createSandbox();

  before('setupApplication', async () => {
    app = (await setupApplication()).app;
    await clearDatabase(app);
  });

  afterEach(done => {
    sandbox.restore();
    done();
  });

  it('test migrateHtmlTexcontent', async () => {
    const paragraph = await app.getRepository(ParagraphRepository);
    await paragraph.execute('Paragraph', 'insertOne', {
      id: '123',
      ownerGroup: 'paragraphAcceptance',
      textcontent: '<p>h &hearts;</p>',
    });
    const sanitizeTextContentStub = sandbox
      .stub(util, 'sanitizeTextContent')
      .callThrough();
    await paragraph.migrateHtmlTexcontent();
    expect(sanitizeTextContentStub.args[0][0]).to.be.eql('<p>h &hearts;</p>');
    const modified = await paragraph.execute('Paragraph', 'findOne', {
      id: '123',
    });
    expect(modified.htmlTextcontent).to.be.eql('h ♥');
  });
});
