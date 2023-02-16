import {TokenServiceBindings} from '@loopback/authentication-jwt';
import {Client, expect} from '@loopback/testlab';
import {createSandbox} from 'sinon';
import {Suite} from 'mocha';
import {SciLogDbApplication} from '../..';
import {UserRepository} from '../../repositories';
const oidcStrategy = require('passport-openidconnect');
import {RequestContext, RestBindings} from '@loopback/rest';
import {InvocationContext, Next} from '@loopback/core';
import {verifyFunctionFactory} from '../../authentication-strategies/types';
import {createUserToken, oidcOptions, setupApplication} from './test-helper';

describe('OIDC services', function (this: Suite) {
  this.timeout(1000);
  let app: SciLogDbApplication;
  let client: Client;
  let userRepo: UserRepository;
  let token: string;

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
      oidcStrategy.prototype,
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
        verifyFunctionFactory(userRepo)(
          '',
          profileData,
          // eslint-disable-next-line  @typescript-eslint/no-explicit-any
          undefined as any,
          undefined,
          // eslint-disable-next-line  @typescript-eslint/no-explicit-any
          undefined as any,
          // eslint-disable-next-line  @typescript-eslint/no-explicit-any
          undefined as any,
          // eslint-disable-next-line  @typescript-eslint/no-explicit-any
          undefined as any,
          undefined,
          // eslint-disable-next-line  @typescript-eslint/no-misused-promises
          next,
        );
        const request = requestCtx.request;
        request.user = userData;
        return next();
      });

    const res = await client.get('/auth/oidc/callback').expect(302);
    expect(res.headers.location).to.startWith(`success-redirect`);
    const jwtService = await app.get(TokenServiceBindings.TOKEN_SERVICE);
    const verifiedUser = await jwtService.verifyToken(
      res.headers.location.split('?token=')[1],
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
