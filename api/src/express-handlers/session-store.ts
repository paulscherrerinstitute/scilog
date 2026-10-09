import MongoStore from 'connect-mongo';

export const sessionStoreBuilder = (mongoUrl: string) =>
  MongoStore.create({mongoUrl: mongoUrl});
