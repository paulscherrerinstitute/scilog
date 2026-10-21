import {expect} from '@loopback/testlab';
import {Session} from '@loopback/rest';
import {saveReturnUrl, takeReturnUrl} from '../../utils/return-url';

describe('saveReturnUrl and takeReturnUrl', () => {
  let session: Session;

  beforeEach(() => {
    session = {} as Session;
  });

  it('hands back the saved page once', () => {
    saveReturnUrl(session, '/logbooks/1/dashboard');

    expect(takeReturnUrl(session)).to.eql('/logbooks/1/dashboard');
    expect(takeReturnUrl(session)).to.be.undefined();
  });

  it('replaces an earlier page with a missing one', () => {
    saveReturnUrl(session, '/logbooks/1/dashboard');
    saveReturnUrl(session, undefined);

    expect(takeReturnUrl(session)).to.be.undefined();
  });

  it('replaces an earlier page with a value that is not a string', () => {
    saveReturnUrl(session, '/logbooks/1/dashboard');
    saveReturnUrl(session, ['/a', '/b']);

    expect(takeReturnUrl(session)).to.be.undefined();
  });
});
