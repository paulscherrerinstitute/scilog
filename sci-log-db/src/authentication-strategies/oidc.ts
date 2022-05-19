import {asAuthStrategy, AuthenticationStrategy} from '@loopback/authentication';
import {StrategyAdapter} from '@loopback/authentication-passport';
import {extensionFor, inject, injectable} from '@loopback/core';
import {RedirectRoute, Request} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {Strategy} from 'passport';
import {User} from '../models';
import {mapProfile, PassportAuthenticationBindings} from './types';

@injectable(
  asAuthStrategy,
)
export class OIDCAuthentication implements AuthenticationStrategy {
  name = 'oidc';
  protected strategy: StrategyAdapter<User>;

  /**
   * create an oidc strategy
   */
  constructor(
    @inject('oidcStrategy')
    public passportstrategy: Strategy,
  ) {
    this.strategy = new StrategyAdapter(
      this.passportstrategy,
      this.name,
      mapProfile.bind(this),
    );
  }

  /**
   * authenticate a request
   * @param request
   */
  async authenticate(request: Request): Promise<UserProfile | RedirectRoute> {
    return (this.strategy as any).authenticate(request);
  }
}
