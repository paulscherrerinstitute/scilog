import {
  Application,
  CoreBindings,
  inject,
  lifeCycleObserver, // The decorator
  LifeCycleObserver,
} from '@loopback/core';
import _ from 'lodash';
import {PasswordHasherBindings} from '../keys';
import {UserRepository} from '../repositories/user.repository';
import {PasswordHasher} from '../services/hash.password.bcryptjs';
import {arrayOfUniqueFrom} from '../utils/misc';

/**
 * This class will be bound to the application as a `LifeCycleObserver` during
 * `boot`
 */
@lifeCycleObserver('')
export class CreateFunctionalAccountsObserver implements LifeCycleObserver {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) private app: Application,
    @inject('repositories.UserRepository')
    private userRepository: UserRepository,
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

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    accounts.forEach(async (account: any) => {
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

  /**
   * This method will be invoked when the application stops.
   */
  async stop(): Promise<void> {
    // Add your logic for stop
  }
}
