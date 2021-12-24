import {
  Application, CoreBindings, inject, lifeCycleObserver, // The decorator
  LifeCycleObserver
} from '@loopback/core';
import _ from 'lodash';
import {PasswordHasherBindings} from '../keys';
import {UserRepository} from '../repositories/user.repository';
import {PasswordHasher} from '../services/hash.password.bcryptjs';

/**
 * This class will be bound to the application as a `LifeCycleObserver` during
 * `boot`
 */
@lifeCycleObserver('')
export class CreateFunctionalAccountsObserver implements LifeCycleObserver {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) private app: Application,
    @inject('repositories.UserRepository') private userRepository: UserRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER) public passwordHasher: PasswordHasher,
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

    var fs = require('fs');
    let path = '/root/scilog/sci-log-db/src/scilog_config_PSI/functionalAccounts.json';
    let pathLocal = './src/scilog_config_PSI/functionalAccounts.json';
    var accounts = [];
    if (fs.existsSync(path)) {
      var contents = fs.readFileSync(path, 'utf8');
      // Define to JSON type
      accounts = JSON.parse(contents);
    } else if (fs.existsSync(pathLocal)) {
      var contents = fs.readFileSync(pathLocal, 'utf8');
      // Define to JSON type
      accounts = JSON.parse(contents);
    }

    accounts.forEach(async (account: any) => {
      let accountExists = await this.userRepository.findOne({
        where: {email: account.email}
      });
      if (accountExists != null) {
        return
      }
      const password = await this.passwordHasher.hashPassword(
        account.password,
      );

      try {
        // create the new user
        const savedUser = await this.userRepository.create(
          _.omit(account, 'password'),
        );

        // set the password
        await this.userRepository
          .userCredentials(savedUser.id)
          .create({password});
      } catch (error) {
        // MongoError 11000 duplicate key
        throw error;
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
