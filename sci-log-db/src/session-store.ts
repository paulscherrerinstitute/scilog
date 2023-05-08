import {SciLogDbApplication} from './application';
import {MongoDataSource} from './datasources';
const MongoStore = require('connect-mongo');

export const sessionStoreBuilder = (app: SciLogDbApplication) =>
  MongoStore.create({
    mongoUrl: (app.getSync('datasources.mongo') as MongoDataSource).settings
      .url,
  });
