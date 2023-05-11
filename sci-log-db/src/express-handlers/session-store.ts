const MongoStore = require('connect-mongo');

export const sessionStoreBuilder = (mongoUrl: string) =>
  MongoStore.create({mongoUrl: mongoUrl});
