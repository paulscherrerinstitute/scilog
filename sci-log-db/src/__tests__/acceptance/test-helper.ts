import { SciLogDbApplication } from '../..';
import {
  createRestAppClient,
  givenHttpServerConfig,
  Client,
} from '@loopback/testlab';

export interface AppWithClient {
  app: SciLogDbApplication;
  client: Client;
}

export async function setupApplication(): Promise<AppWithClient> {
  const app = new SciLogDbApplication({
    rest: givenHttpServerConfig(),
    databaseSeeding: false,
  });

  // make sure the tests use their own test database
  // TODO understand the difference of datasources.mongo and datasources.config.mongo context keys
  await app.bind('datasources.config.mongo').to({
    name: "mongo",
    connector: "mongodb",
    url: "",
    host: "127.0.0.1",
    port: 27017,
    user: "",
    password: "",
    database: "test",
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  await app.boot();
  await app.start();

  const client = createRestAppClient(app);

  return { app, client };
}

