import { SciLogDbApplication } from '../..';
import {
  createRestAppClient,
  givenHttpServerConfig,
  Client,
} from '@loopback/testlab';
import { testdb } from '../testdb.datasource';

export interface AppWithClient {
  app: SciLogDbApplication;
  client: Client;
}

export async function setupApplication(): Promise<AppWithClient> {
  const app = new SciLogDbApplication({
    rest: givenHttpServerConfig(),
    databaseSeeding: false,
  });
  await app.boot();
  app.dataSource(testdb);
  await app.start();
  const client = createRestAppClient(app);
  return {app, client}
};
