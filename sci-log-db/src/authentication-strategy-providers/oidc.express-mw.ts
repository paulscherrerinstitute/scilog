const passport = require('passport');
import {BindingScope, inject, injectable, Provider} from '@loopback/core';
import {ExpressRequestHandler} from '@loopback/rest';
import { Strategy } from 'passport';

@injectable.provider({scope: BindingScope.SINGLETON})
export class OIDCExpressMiddleware
  implements Provider<ExpressRequestHandler>
{
  constructor(
    @inject('oidcStrategy')
    public strategy: Strategy,
  ) {
    passport.use(this.strategy);
  }

  value() {
    return passport.authenticate('openidconnect');
  }
}
