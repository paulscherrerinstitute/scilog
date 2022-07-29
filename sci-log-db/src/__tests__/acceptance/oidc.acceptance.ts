import {TokenServiceBindings} from '@loopback/authentication-jwt';
import {Client, expect} from '@loopback/testlab';
import {createSandbox} from 'sinon';
import {Suite} from 'mocha';
import {SciLogDbApplication} from '../..';
import {User} from '../../models';
import {UserRepository} from '../../repositories';
const oidcStrategy = require('passport-openidconnect');
import { RequestContext, RestBindings } from '@loopback/rest';
import { InvocationContext, Next } from '@loopback/core';
import { verifyFunctionFactory } from '../../authentication-strategies/types';
import { oidcOptions, setupApplication } from './test-helper';


describe('OIDC services', function (this: Suite) {
  this.timeout(5000);
  let app: SciLogDbApplication;
  let client: Client;
  let userRepo: UserRepository;

  const profileData = {
    name: {
    givenName: 'unit',
    familyName: 'test'
    },
    username: 'unittest',
    emails: [{value: 'unittest@loopback.io'}],
    _json: {roles: ['aRole']},
    provider: 'oidc',
    id: '123',
    displayName: ''
  }

  const userData = {
    email: 'unittest@loopback.io',
    firstName: 'unit',
    lastName: 'test',
    username: 'unittest',
    roles: ['aRole', 'customer', 'unittest'],
  };

  async function clearDatabase() {
    await userRepo.deleteAll()
  }

  const sandbox = createSandbox();

  before('setupApplication', async () => {
    ({app, client} = await setupApplication({oidcOptions: oidcOptions}));
  });
  before('userRepo', async () => {
    userRepo = await app.get('repositories.UserRepository')
  })
  beforeEach(clearDatabase);

  afterEach(done => {
    sandbox.restore();
    done();
  });
  after(async () => {
    if (app != null) await app.stop();
  });

  it('login with OIDC and checks if authenticate is correctly called', async () => {
    const mockAuthenticate = sandbox.spy(oidcStrategy.prototype, 'authenticate');

    const res = await client.get('/auth/thirdparty/oidc').expect(303);
    expect(mockAuthenticate.calledOnce).to.be.true;
    expect(res.headers.location).to.startWith('oidc-authorization-url')
  });

  it('create user in DB after authentication', async () => {
    app.getBinding('passport-oidc').to(
      async (invocationCtx: InvocationContext, next: Next) => {

          const requestCtx = invocationCtx.getSync<RequestContext>(
              RestBindings.Http.CONTEXT,
          );
          verifyFunctionFactory(userRepo)('', profileData, 
      undefined as any, undefined, undefined as any, undefined as any, undefined as any, undefined, next)
          const request = requestCtx.request;
          request.user = userData;
          return next();
      }
    )

    const res = await client.get('/auth/oidc/callback').expect(302);
    expect(res.headers.location).to.startWith(`success-redirect`);
    const jwtService = await app.get(TokenServiceBindings.TOKEN_SERVICE);
    const verifiedUser = await jwtService.verifyToken(res.headers.location.split("?token=")[1]);
    expect(verifiedUser).to.have.property('email').and.to.be.eql(userData.email);
    expect(verifiedUser).to.have.property('name').and.to.be.eql(`${userData.firstName} ${userData.lastName}`);
    expect(verifiedUser).to.have.property('roles').and.to.be.eql(userData.roles);
    const {id, ...user} = await userRepo.findOne({where: {email: userData.email}}) as User;
    expect(user).to.be.eql(userData);
  })

})
