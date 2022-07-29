import { SciLogDbApplication } from '../..';
import {
  createRestAppClient,
  givenHttpServerConfig,
  Client,
} from '@loopback/testlab';
import { testdb } from '../testdb.datasource';
import { ApplicationConfig } from '@loopback/core';

export interface AppWithClient {
  app: SciLogDbApplication;
  client: Client;
}

export const oidcOptions = {
  issuer: "issuer",
  authorizationURL: "oidc-authorization-url",
  tokenURL: "tokenURL",
  clientID: "clientID",
  successRedirect: 'success-redirect'
};

export async function setupApplication(options: ApplicationConfig = {}): Promise<AppWithClient> {
  const app = new SciLogDbApplication({
    rest: givenHttpServerConfig(),
    databaseSeeding: false,
    ...options,
  });
  await app.boot();
  app.dataSource(testdb);
  await app.start();
  const client = createRestAppClient(app);
  return {app, client}
};
