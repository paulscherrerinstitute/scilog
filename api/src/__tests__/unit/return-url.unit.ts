import {expect} from '@loopback/testlab';
import {Session} from '@loopback/rest';
import {
  safeReturnUrl,
  saveReturnUrl,
  takeReturnUrl,
} from '../../utils/return-url';

describe('safeReturnUrl', () => {
  [
    ['/logbooks/1/dashboard', '/logbooks/1/dashboard'],
    ['/a?b=1#c', '/a?b=1#c'],
    ['/a/../b', '/b'],
    ['/%2F%2Fevil.com', '/%2F%2Fevil.com'],
    ['/loginfoo', '/loginfoo'],
  ].forEach(([value, expected]) => {
    it(`keeps the app path ${value}`, () => {
      expect(safeReturnUrl(value)).to.eql(expected);
    });
  });

  [
    '//evil.com',
    '/\\evil.com',
    '/\\\\evil.com',
    '/\t/evil.com',
    '/\n/evil.com',
    '/..//evil.com',
    '/./\\evil.com',
    'https://evil.com',
    'javascript:alert(1)',
    'logbooks/1',
    '/login',
    '/login/x',
    '',
    undefined,
    ['/a', '/b'],
  ].forEach(value => {
    it(`rejects ${JSON.stringify(value)}`, () => {
      expect(safeReturnUrl(value)).to.be.undefined();
    });
  });
});

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

  it('replaces an earlier page with one outside the app', () => {
    saveReturnUrl(session, '/logbooks/1/dashboard');
    saveReturnUrl(session, 'https://evil.com');

    expect(takeReturnUrl(session)).to.be.undefined();
  });
});
