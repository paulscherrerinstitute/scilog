import {TokenServiceBindings} from '@loopback/authentication-jwt';
import {Client, expect} from '@loopback/testlab';
import {createSandbox} from 'sinon';
import {Suite} from 'mocha';
import {SciLogDbApplication} from '../..';
import {UserRepository} from '../../repositories';
import OIDCStrategy from 'passport-openidconnect';
import {RequestContext, RestBindings} from '@loopback/rest';
import {Interceptor, InvocationContext, Next} from '@loopback/core';
import {verifyFunctionFactory} from '../../authentication-strategies/types';
import {createUserToken, oidcOptions, setupApplication} from './test-helper';

describe('OIDC services', function (this: Suite) {
  this.timeout(1000);
  let app: SciLogDbApplication;
  let client: Client;
  let userRepo: UserRepository;
  let token: string;
  let passportOidc: Interceptor;

  const profileData = {
    name: {
      givenName: 'unit',
      familyName: 'test',
    },
    username: 'unittest',
    emails: [{value: 'unittest@loopback.io'}],
    _json: {roles: ['aRole']},
    provider: 'oidc',
    id: '123',
    displayName: '',
  };

  const userData = {
    email: 'unittest@loopback.io',
    firstName: 'unit',
    lastName: 'test',
    username: 'unittest',
    roles: ['aRole', 'any-authenticated-user', 'unittest'],
  };

  async function clearDatabase() {
    await userRepo.deleteAll();
  }

  const sandbox = createSandbox();

  before('setupApplication', async () => {
    ({app, client} = await setupApplication({oidcOptions: oidcOptions}));
    token = await createUserToken(app, client, ['logbookAcceptance']);
    passportOidc = await app.get<Interceptor>('passport-oidc');
  });
  before('userRepo', async () => {
    userRepo = await app.get('repositories.UserRepository');
  });
  beforeEach(clearDatabase);

  afterEach(done => {
    sandbox.restore();
    done();
  });
  after(async () => {
    if (app != null) await app.stop();
  });

  it('login with OIDC and checks if authenticate is correctly called', async () => {
    const mockAuthenticate = sandbox.spy(
      OIDCStrategy.prototype,
      'authenticate',
    );

    const res = await client.get('/auth/oidc/login').expect(303);
    // eslint-disable-next-line no-unused-expressions
    expect(mockAuthenticate.calledOnce).to.be.true;
    expect(res.headers.location).to.startWith('oidc-authorization-url');
  });

  it('create user in DB after authentication', async () => {
    app
      .getBinding('passport-oidc')
      .to(async (invocationCtx: InvocationContext, next: Next) => {
        const requestCtx = invocationCtx.getSync<RequestContext>(
          RestBindings.Http.CONTEXT,
        );
        await new Promise<void>((resolve, reject) =>
          verifyFunctionFactory(userRepo)(
            '',
            profileData,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            err => (err ? reject(err) : resolve()),
          ),
        );
        const request = requestCtx.request;
        request.user = userData;
        return next();
      });

    const res = await client.get('/auth/oidc/callback').expect(302);
    const location = new URL(res.headers.location);
    expect(location.origin + location.pathname).to.eql(
      'http://web.invalid/success-redirect',
    );
    const jwtService = await app.get(TokenServiceBindings.TOKEN_SERVICE);
    const verifiedUser = await jwtService.verifyToken(
      location.searchParams.get('token')!,
    );
    expect(verifiedUser)
      .to.have.property('email')
      .and.to.be.eql(userData.email);
    expect(verifiedUser)
      .to.have.property('name')
      .and.to.be.eql(`${userData.firstName} ${userData.lastName}`);
    expect(verifiedUser)
      .to.have.property('roles')
      .and.to.be.eql(userData.roles);
  });

  describe('return to the opened page', () => {
    beforeEach(() => {
      // earlier tests replace the passport step; use the real one so the
      // session is renewed on login as in production
      app.getBinding('passport-oidc').to(passportOidc);
      const authenticate = OIDCStrategy.prototype.authenticate;
      sandbox.stub(OIDCStrategy.prototype, 'authenticate').callsFake(function (
        this: OIDCStrategy,
        req,
        options,
      ) {
        if (req.url.startsWith('/auth/oidc/callback')) {
          return this.success(userData);
        }
        return authenticate.call(this, req, options);
      });
    });

    async function login(query = '', cookie: string[] = []) {
      const res = await client
        .get(`/auth/oidc/login${query}`)
        .set('Cookie', cookie)
        .expect(303);
      return res.get('Set-Cookie') ?? cookie;
    }

    async function callback(cookie: string[]) {
      const res = await client
        .get('/auth/oidc/callback')
        .set('Cookie', cookie)
        .expect(302);
      const location = new URL(res.headers.location);
      expect(location.pathname).to.eql('/success-redirect');
      return {
        returnUrl: location.searchParams.get('returnUrl'),
        cookie: res.get('Set-Cookie') ?? [],
      };
    }

    it('passes the returnUrl of the login on to the web app once', async () => {
      const cookie = await login('?returnUrl=/logbooks/1/dashboard');

      const first = await callback(cookie);
      expect(first.returnUrl).to.eql('/logbooks/1/dashboard');
      expect(first.cookie).to.not.be.empty();
      expect(first.cookie).to.not.eql(cookie);
      expect((await callback(first.cookie)).returnUrl).to.be.null();
    });

    it('keeps the query of the returnUrl', async () => {
      const cookie = await login(
        `?returnUrl=${encodeURIComponent('/logbooks/1/dashboard?a=1&b=2')}`,
      );

      expect((await callback(cookie)).returnUrl).to.eql(
        '/logbooks/1/dashboard?a=1&b=2',
      );
    });

    it('forgets the returnUrl of an earlier, unfinished login', async () => {
      const cookie = await login('?returnUrl=/logbooks/1/dashboard');
      await login('', cookie);

      expect((await callback(cookie)).returnUrl).to.be.null();
    });

    it('passes the returnUrl on as is; the web app checks it', async () => {
      const cookie = await login('?returnUrl=https://evil.com');

      expect((await callback(cookie)).returnUrl).to.eql('https://evil.com');
    });

    it('keeps the redirect unchanged without returnUrl', async () => {
      const cookie = await login();

      expect((await callback(cookie)).returnUrl).to.be.null();
    });
  });

  it('Logout with unauthenticated user should fail', async () => {
    await client
      .get('/auth/oidc/logout')
      .set('Accept', 'application/json')
      .expect(401);
  });

  it('Logout with bearer authenticated user should redirect', async () => {
    await client
      .get('/auth/oidc/logout')
      .set({Authorization: `Bearer ${token}`})
      .set('Cookie', ['connect.sid=12345'])
      .expect(302)
      .then(result => {
        expect(result.headers.location).to.be.eql(
          'aUrl?post_logout_redirect_uri=aRedirectUrl&client_id=clientID',
        );
        expect(result.headers['set-cookie']).to.be.eql([
          'id_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
          'connect.sid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
        ]);
      });
  });

  it('Logout with cookie authenticated user should redirect', async () => {
    await client
      .get('/auth/oidc/logout')
      .set('Cookie', [`id_token=${token}`, 'connect.sid=12345'])
      .expect(302)
      .then(result => {
        expect(result.headers.location).to.be.eql(
          'aUrl?post_logout_redirect_uri=aRedirectUrl&client_id=clientID',
        );
        expect(result.headers['set-cookie']).to.be.eql([
          'id_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
          'connect.sid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
        ]);
      });
  });
});
