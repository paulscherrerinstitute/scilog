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
      textcontent: '<p></p>',
    });
    await paragraph.execute('Paragraph', 'insertOne', {
      id: '456',
      ownerGroup: 'paragraphAcceptance',
      textcontent: '<p>h &hearts;</p>',
    });
    const sanitizeTextContentStub = sandbox
      .stub(util, 'sanitizeTextContent')
      .callThrough();
    await paragraph.migrateHtmlTexcontent();
    expect(sanitizeTextContentStub.callCount).to.be.eql(2);
    expect(sanitizeTextContentStub.args[0][0]).to.be.eql('<p></p>');
    expect(
      (
        await paragraph.execute('Paragraph', 'findOne', {
          id: '123',
        })
      ).htmlTextcontent,
    ).to.be.eql(undefined);
    expect(sanitizeTextContentStub.args[1][0]).to.be.eql('<p>h &hearts;</p>');
    expect(
      (
        await paragraph.execute('Paragraph', 'findOne', {
          id: '456',
        })
      ).htmlTextcontent,
    ).to.be.eql('h ♥');
  });
});
