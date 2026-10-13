import {cookieToToken} from './cookie-to-token';
import session = require('express-session');
import {sessionStoreBuilder} from './session-store';
import cors from 'cors';
import {MongoDataSource} from '../datasources';
import {ExpressRequestHandler} from '@loopback/rest';
import {Provider, inject} from '@loopback/core';
import {SESSION_SECRET} from '../keys';

export class ExpressRequestHandlersProvider implements Provider<
  ExpressRequestHandler[]
> {
  constructor(
    @inject('datasources.mongo') private mongoDataSource: MongoDataSource,
    @inject(SESSION_SECRET) private sessionSecret: string,
  ) {}

  value() {
    return [cors(), cookieToToken, this.instantiateSession()];
  }

  private instantiateSession() {
    return session({
      secret: this.sessionSecret,
      resave: false,
      saveUninitialized: false,
      proxy: true,
      cookie: {secure: 'auto'},
      ...(process.env.SESSION_STORE_BUILDER
        ? {store: sessionStoreBuilder(this.mongoDataSource.settings.url)}
        : {}),
    }) as ExpressRequestHandler;
  }
}
