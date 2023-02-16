/* eslint-disable  @typescript-eslint/no-explicit-any */

import {asAuthStrategy, AuthenticationStrategy} from '@loopback/authentication';
import {StrategyAdapter} from '@loopback/authentication-passport';
import {inject, injectable} from '@loopback/core';
import {RedirectRoute, Request} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {Strategy} from 'passport';
const oidcStrategy = require('passport-openidconnect');
import {User} from '../models';
import {mapProfile, OIDCOptions, verifyFunctionFactory} from './types';
import {UserRepository} from '../repositories';
import {repository} from '@loopback/repository';
const passport = require('passport');

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
    const strategy: Strategy = new oidcStrategy(
      this.oidcOptions,
      verifyFunctionFactory(this.userRepository),
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
    return (this.strategy as any).authenticate(request);
  }
}
