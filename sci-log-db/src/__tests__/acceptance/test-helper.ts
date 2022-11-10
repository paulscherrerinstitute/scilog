import {SciLogDbApplication} from '../..';
import {
  createRestAppClient,
  givenHttpServerConfig,
  Client,
} from '@loopback/testlab';
import {testdb} from '../testdb.datasource';
import {PasswordHasherBindings} from '../../keys';
import {User, UserRepository} from '@loopback/authentication-jwt';
import {ApplicationConfig} from '@loopback/core';
import _ from 'lodash';
import {BasesnippetRepository, TaskRepository} from '../../repositories';
import {FileRepository} from '../../repositories/file.repository';
import {JobRepository} from '../../repositories/job.repository';

export interface AppWithClient {
  app: SciLogDbApplication;
  client: Client;
}

export const userPassword = 'p4ssw0rd';

export const userData = {
  email: 'test@loopback.io',
  firstName: 'Example',
  lastName: 'User',
  roles: ['p12345', 'any-authenticated-user'],
};

export const adminUser = {
  email: 'admin@loopback.io',
  firstName: 'Exampleadmin',
  lastName: 'UserAdmin',
  roles: ['admin', 'any-authenticated-user'],
  location: 'anExistingLocation',
  unxGroup: 'aUnxGroup',
};

export const oidcOptions = {
  issuer: 'issuer',
  authorizationURL: 'oidc-authorization-url',
  tokenURL: 'tokenURL',
  clientID: 'clientID',
  successRedirect: 'success-redirect',
};

export async function setupApplication(
  options: ApplicationConfig = {},
): Promise<AppWithClient> {
  const app = new SciLogDbApplication({
    rest: givenHttpServerConfig(),
    databaseSeeding: false,
    ...options,
  });
  await app.boot();
  app.dataSource(testdb);
  await app.start();
  const client = createRestAppClient(app);
  return {app, client};
}

export async function createAUser(
  app: SciLogDbApplication,
  additionalRoles: string[] = [],
  user = userData,
): Promise<User> {
  const passwordHasher = await app.get(PasswordHasherBindings.PASSWORD_HASHER);
  const encryptedPassword = await passwordHasher.hashPassword(userPassword);
  const userRepo: UserRepository = await app.get('repositories.UserRepository');
  const newUser = await userRepo.create({
    ..._.omit(user, 'roles'),
    roles: user.roles.concat(additionalRoles),
  });
  newUser.id = newUser.id.toString();

  await userRepo.userCredentials(newUser.id).create({
    password: encryptedPassword,
  });

  return newUser;
}

async function createToken(client: Client, user: User) {
  const loginResponse = await client
    .post('/users/login')
    .send({principal: user.email, password: userPassword});
  return loginResponse.body.token;
}

export async function createUserToken(
  app: SciLogDbApplication,
  client: Client,
  additionalRoles: string[] = [],
) {
  const user = await createAUser(app, additionalRoles);
  const token = await createToken(client, user);
  return token;
}

export async function createAdminToken(
  app: SciLogDbApplication,
  client: Client,
) {
  const user = await createAdminUser(app);
  const token = await createToken(client, user);
  return token;
}
export async function createAdminUser(app: SciLogDbApplication) {
  const user = await createAUser(app, [], adminUser);
  return user;
}

export async function clearDatabase(app: SciLogDbApplication) {
  const basesnippetRepository: BasesnippetRepository = await app.get(
    'repositories.BasesnippetRepository',
  );
  const userRepository: UserRepository = await app.get(
    'repositories.UserRepository',
  );
  const fileRepository: FileRepository = await app.get(
    'repositories.FileRepository',
  );
  const jobRepository: JobRepository = await app.get(
    'repositories.JobRepository',
  );
  const taskRepository: TaskRepository = await app.get(
    'repositories.TaskRepository',
  );
  await basesnippetRepository.deleteAll(null, {
    currentUser: {roles: ['admin']},
  });
  await userRepository.deleteAll();
  await fileRepository.deleteAll(null, {currentUser: {roles: ['admin']}});
  await jobRepository.deleteAll({}, {currentUser: {roles: ['admin']}});
  await taskRepository.deleteAll(null, {currentUser: {roles: ['admin']}});
}
