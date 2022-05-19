import {UserIdentityService} from '@loopback/authentication';
import {BindingScope, inject, injectable, Provider} from '@loopback/core';
import {Profile, Strategy} from 'passport';
const oidcStrategy = require('passport-openidconnect');
import {verifyFunctionFactory} from '../authentication-strategies/types';
import {User} from '../models';
import {UserServiceBindings} from '../services';

@injectable.provider({scope: BindingScope.SINGLETON})
export class OIDCProvider implements Provider<Strategy> {
  strategy: Strategy;

  constructor(
    @inject('oidcOptions')
    public oidcOptions: any,
    @inject(UserServiceBindings.PASSPORT_USER_IDENTITY_SERVICE)
    public userService: UserIdentityService<Profile, User>,
  ) {
    
    this.strategy = new oidcStrategy(
      this.oidcOptions,
      verifyFunctionFactory(this.userService),
    );
  }

  value() {
    return this.strategy;
  }
}
