import { SciLogDbApplication } from '../..';
import {
  createRestAppClient,
  givenHttpServerConfig,
  Client,
} from '@loopback/testlab';
import { testdb } from '../testdb.datasource';
import { PasswordHasherBindings } from '../../keys';
import { User, UserRepository } from '@loopback/authentication-jwt';
import { ApplicationConfig } from '@loopback/core';

export interface AppWithClient {
  app: SciLogDbApplication;
  client: Client;
}

export const userPassword = 'p4ssw0rd';

const userData = {
  email: 'test@loopback.io',
  firstName: 'Example',
  lastName: 'User',
  roles: ['p12345','any-authenticated-user'],
};

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

export async function createAUser(app: SciLogDbApplication): Promise<User> {
  const passwordHasher = await app.get(PasswordHasherBindings.PASSWORD_HASHER);
  const encryptedPassword = await passwordHasher.hashPassword(userPassword);
  const userRepo: UserRepository = await app.get('repositories.UserRepository');
  const newUser = await userRepo.create(userData);
  newUser.id = newUser.id.toString();

  await userRepo.userCredentials(newUser.id).create({
    password: encryptedPassword,
  });

  return newUser;
}
