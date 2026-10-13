import {asAuthStrategy, AuthenticationStrategy} from '@loopback/authentication';
import {StrategyAdapter} from '@loopback/authentication-passport';
import {inject, injectable} from '@loopback/core';
import {RedirectRoute, Request} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import passport, {Strategy} from 'passport';
import OIDCStrategy from 'passport-openidconnect';
import {User} from '../models';
import {mapProfile, OIDCOptions, verifyFunctionFactory} from './types';
import {UserRepository} from '../repositories';
import {repository} from '@loopback/repository';

@injectable(asAuthStrategy)
export class OIDCAuthentication implements AuthenticationStrategy {
  name = 'oidc';
  protected strategy: StrategyAdapter<User>;

  /**
   * create an oidc strategy
   */
  constructor(
    @inject('oidcOptions')
    private oidcOptions: OIDCOptions,
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {
    const strategy: Strategy = new OIDCStrategy(
      this.oidcOptions,
      verifyFunctionFactory(this.userRepository, this.oidcOptions.rolesClaims),
    );
    this.strategy = new StrategyAdapter(
      strategy,
      this.name,
      mapProfile.bind(this),
    );
    passport.use(strategy);
  }

  /**
   * authenticate a request
   * @param request
   */
  async authenticate(request: Request): Promise<UserProfile | RedirectRoute> {
    return this.strategy.authenticate(request);
  }
}
