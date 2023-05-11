import {cookieToToken} from './cookie-to-token';
import session = require('express-session');
import {sessionStoreBuilder} from './session-store';
import cors from 'cors';
import {MongoDataSource} from '../datasources';
import {ExpressRequestHandler} from '@loopback/rest';
import {Provider, inject} from '@loopback/core';

export class ExpressRequestHandlersProvider
  implements Provider<ExpressRequestHandler[]>
{
  constructor(
    @inject('datasources.mongo') private mongoDataSource: MongoDataSource,
  ) {}

  value() {
    return [cors(), cookieToToken, this.instantiateSession()];
  }

  private instantiateSession() {
    return session({
      secret: process.env.SESSION_SECRET ?? 'someSecret',
      resave: false,
      saveUninitialized: false,
      ...(process.env.SESSION_STORE_BUILDER
        ? {store: sessionStoreBuilder(this.mongoDataSource.settings.url)}
        : {}),
    }) as ExpressRequestHandler;
  }
}
