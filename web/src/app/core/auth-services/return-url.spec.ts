import { afterLoginUrl, loginUrl, safeReturnUrl } from './return-url';

describe('safeReturnUrl', () => {
  [
    ['/logbooks/1/dashboard', '/logbooks/1/dashboard'],
    ['/overview?x=1#y', '/overview?x=1#y'],
    ['/overview(settings:viewSettings)', '/overview(settings:viewSettings)'],
    ['/%2F%2Fevil.com', '/%2F%2Fevil.com'],
    ['/loginfoo', '/loginfoo'],
    ['/auth-callbackfoo', '/auth-callbackfoo'],
  ].forEach(([value, expected]) => {
    it(`keeps the app page ${value}`, () => {
      expect(safeReturnUrl(value)).toEqual(expected);
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
    '/login?returnUrl=/overview',
    '/login;a=1',
    '/login(settings:viewSettings)',
    '/%6Cogin',
    '/auth-callback',
    '/auth-callback?access-token=x',
    '/a(b',
    '',
    undefined,
    ['/a', '/b'],
  ].forEach((value) => {
    it(`rejects ${JSON.stringify(value)}`, () => {
      expect(safeReturnUrl(value)).toBeUndefined();
    });
  });
});

describe('afterLoginUrl', () => {
  it('opens the return address if it is a page of this app', () => {
    expect(afterLoginUrl('/logbooks/1/dashboard')).toEqual('/logbooks/1/dashboard');
  });

  ['//evil.com', '/login', undefined].forEach((value) => {
    it(`opens the overview for ${JSON.stringify(value)}`, () => {
      expect(afterLoginUrl(value)).toEqual('/overview');
    });
  });
});

describe('loginUrl', () => {
  [
    '/logbooks/1/dashboard?x=1#y',
    '/overview(settings:viewSettings)',
    '/logbooks/1/dashboard(settings:profileSettings)',
  ].forEach((page) => {
    it(`returns to ${page} after login`, () => {
      const url = new URL(loginUrl(page), location.origin);
      expect(url.pathname).toEqual('/login');
      expect(safeReturnUrl(url.searchParams.get('returnUrl'))).toEqual(page);
    });
  });

  ['/login?returnUrl=%2Foverview', '//evil.com', undefined].forEach((page) => {
    it(`leaves out the return address for ${JSON.stringify(page)}`, () => {
      expect(loginUrl(page)).toEqual('/login');
    });
  });
});
