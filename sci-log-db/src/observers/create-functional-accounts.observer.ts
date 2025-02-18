import {
  inject,
  lifeCycleObserver, // The decorator
  LifeCycleObserver,
} from '@loopback/core';
import _ from 'lodash';
import {PasswordHasherBindings} from '../keys';
import {UserRepository} from '../repositories/user.repository';
import {PasswordHasher} from '../services/hash.password.bcryptjs';
import {arrayOfUniqueFrom} from '../utils/misc';
import {BasesnippetRepository} from '../repositories';
import {noUnxDescendantsQuery} from './no-unx-descendants-query';
import {Location} from '../models';
import {AggregationCursor, ObjectId} from 'mongodb';
import {User} from '@loopback/authentication-jwt';

/**
 * This class will be bound to the application as a `LifeCycleObserver` during
 * `boot`
 */
@lifeCycleObserver('')
export class CreateFunctionalAccountsObserver implements LifeCycleObserver {
  batchSize = 100;
  constructor(
    @inject('repositories.UserRepository')
    private userRepository: UserRepository,
    @inject('repositories.BasesnippetRepository')
    public basesnippetRepository: BasesnippetRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
  ) {}

  /**
   * This method will be invoked when the application initializes. It will be
   * called at most once for a given application instance.
   */
  async init(): Promise<void> {
    // Add your logic for init
  }

  /**
   * This method will be invoked when the application starts.
   */
  async start(): Promise<void> {
    // Add your logic for start

    const fs = require('fs');
    const path = '/home/node/app/functionalAccounts.json';
    const pathLocal = './functionalAccounts.json';
    let accounts = [];
    if (fs.existsSync(path)) {
      const contents = fs.readFileSync(path, 'utf8');
      // Define to JSON type
      accounts = JSON.parse(contents);
    } else if (fs.existsSync(pathLocal)) {
      const contents = fs.readFileSync(pathLocal, 'utf8');
      // Define to JSON type
      accounts = JSON.parse(contents);
    }

    accounts.forEach(async (account: User) => {
      const accountExists = await this.userRepository.findOne({
        where: {email: account.email},
      });
      if (accountExists != null) {
        await this.userRepository.updateById(accountExists.id, {
          ..._.omit(account, ['password', 'roles']),
          roles: arrayOfUniqueFrom(account.roles, account.email),
        });
      } else {
        const password = await this.passwordHasher.hashPassword(
          account.password,
        );

        await this.addAclsToExistingSnippetsFromAccount(account);

        // create the new user
        const savedUser = await this.userRepository.create({
          ..._.omit(account, ['password', 'roles']),
          roles: arrayOfUniqueFrom(account.roles, account.email),
        });

        // set the password
        await this.userRepository
          .userCredentials(savedUser.id)
          .create({password});
      }
    });
  }

  private async addAclsToDescendants(locationId: string, unxGroup: string) {
    const descendantsQuery = noUnxDescendantsQuery(locationId, unxGroup);
    const descendants = await this.basesnippetRepository.dataSource.connector
      .collection('Basesnippet')
      .aggregate(descendantsQuery);

    const addToSetAclsQuery = this.computeUnxAclsQuery(unxGroup);
    await this.updateDescendantsAcls(descendants, addToSetAclsQuery);
  }

  private async updateDescendantsAcls(
    descendants: AggregationCursor<Record<'_id', ObjectId>>,
    addToSetAclsQuery: Record<'$addToSet', Record<string, string>>,
  ) {
    let batchIds = [];
    while (await descendants.hasNext()) {
      const descendant = await descendants.next();
      batchIds.push(descendant!._id);
      const isLast = !(await descendants.hasNext());
      if (batchIds.length === this.batchSize || isLast) {
        await this.basesnippetRepository.updateAll(
          addToSetAclsQuery,
          {_id: {inq: batchIds}},
          {currentUser: {roles: ['admin']}},
        );
        batchIds = [];
      }
      if (isLast) break;
    }
  }

  private computeUnxAclsQuery(unxGroup: string) {
    return this.basesnippetRepository.baseACLS.reduce(
      (
        currentValue: Record<'$addToSet', Record<string, string>>,
        previousValue: string,
      ) => {
        currentValue.$addToSet[previousValue] = unxGroup;
        return currentValue;
      },
      {$addToSet: {}},
    );
  }

  private async addAclsToLocation(location: Location, unxGroup: string) {
    if (location.updateACL?.includes(unxGroup)) return;
    await this.basesnippetRepository.updateById(
      location.id,
      {$addToSet: {updateACL: unxGroup}},
      {currentUser: {roles: ['admin']}},
    );
  }

  private async addAclsToExistingSnippetsFromAccount(account: User) {
    if (!account.unxGroup || !account.location) return;
    const location = await this.basesnippetRepository.findOne(
      {where: {location: account.location, snippetType: 'location'}},
      {currentUser: {roles: ['admin']}},
    );
    if (!location) return;
    await this.addAclsToLocation(location, account.unxGroup);
    await this.addAclsToDescendants(location.id, account.unxGroup);
  }

  async migrateUnxGroup() {
    const accounts = await this.userRepository.find({
      where: {location: {exists: true}, unxGroup: {exists: true}},
    });
    for await (const account of accounts)
      await this.addAclsToExistingSnippetsFromAccount(account);
  }

  /**
   * This method will be invoked when the application stops.
   */
  async stop(): Promise<void> {
    // Add your logic for stop
  }
}
