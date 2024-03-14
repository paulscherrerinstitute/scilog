// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-file-transfer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  AuthenticationComponent,
  registerAuthenticationStrategy,
} from '@loopback/authentication';
import {
  JWTAuthenticationComponent,
  TokenServiceBindings,
} from '@loopback/authentication-jwt';
import {AuthorizationComponent} from '@loopback/authorization';
import {BootMixin} from '@loopback/boot';
import {
  ApplicationConfig,
  BindingKey,
  BindingScope,
  createBindingFromClass,
} from '@loopback/core';
import {
  AnyObject,
  model,
  property,
  RepositoryMixin,
  SchemaMigrationOptions,
} from '@loopback/repository';
import {ExpressRequestHandler, RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import multer from 'multer';
import path from 'path';
import {
  FILE_UPLOAD_SERVICE,
  PasswordHasherBindings,
  STORAGE_DIRECTORY,
} from './keys';
import {User} from './models';
import {ParagraphRepository} from './repositories';
import {MySequence} from './sequence';
import {BcryptHasher} from './services/hash.password.bcryptjs';
import {JWTService} from './services/jwt-service';
import {SecuritySpecEnhancer} from './services/jwt-spec.enhancer';
import {MyUserService} from './services/user-service';
import {startWebsocket} from './utils/websocket';
import * as crypto from 'crypto';

import {toInterceptor} from '@loopback/rest';
import passport from 'passport';
import {OIDCAuthentication} from './authentication-strategies';
import {UserServiceBindings} from './keys';

import {ExpressRequestHandlersProvider} from './express-handlers/middleware-sequence';

export {ApplicationConfig};

/**
 * Information from package.json
 */
export interface PackageInfo {
  name: string;
  version: string;
  description: string;
}
export const PackageKey = BindingKey.create<PackageInfo>('application.package');

const pkg: PackageInfo = require('../package.json');

@model()
export class NewUser extends User {
  @property({
    type: 'string',
    required: true,
  })
  password: string;
}

export class SciLogDbApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Bind authentication component related elements
    this.component(AuthenticationComponent);
    this.component(JWTAuthenticationComponent);
    this.component(AuthorizationComponent);
    this.setUpBindings();

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    // Configure file upload with multer options
    this.configureFileUpload(options.fileStorageDirectory);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
    // Bind datasource
    // TODO still needed ? this.dataSource(MongoDataSource, UserServiceBindings.DATASOURCE_NAME);
  }

  /**
   * Configure `multer` options for file upload
   */
  protected configureFileUpload(destination?: string) {
    // Upload files to `dist/.sandbox` by default
    destination = destination ?? path.join(__dirname, '../.sandbox');
    this.bind(STORAGE_DIRECTORY).to(destination);
    const multerOptions: multer.Options = {
      storage: multer.diskStorage({
        destination,
        // Use the original file name as is
        filename: (req, file, cb) => {
          cb(null, file.originalname);
        },
      }),
    };
    // Configure the file upload service with multer options
    this.configure(FILE_UPLOAD_SERVICE).to(multerOptions);
  }

  setUpBindings(): void {
    // Bind package.json to the application context
    this.bind(PackageKey).to(pkg);

    // // Bind bcrypt hash services
    this.bind(PasswordHasherBindings.ROUNDS).to(10);
    this.bind(PasswordHasherBindings.PASSWORD_HASHER).toClass(BcryptHasher);
    this.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(JWTService);
    if (process.env.JWT_ACCESS_TOKEN_EXPIRES_IN)
      this.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to(
        process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
      );
    this.bind(TokenServiceBindings.TOKEN_SECRET).to(
      (process.env.JWT_SECRET as string) ??
        crypto.randomBytes(12).toString('hex'),
    );
    this.bind(UserServiceBindings.USER_SERVICE).toClass(MyUserService);

    this.add(createBindingFromClass(SecuritySpecEnhancer));

    // Bind datasource config
    this.configureDatasourceFromFile(
      '../datasource.json',
      'datasources.config.mongo',
    );
    this.bind('middleware.sequence')
      .toProvider(ExpressRequestHandlersProvider)
      .inScope(BindingScope.SINGLETON);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    passport.serializeUser(function (user: any, done) {
      done(null, user);
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    passport.deserializeUser(function (user: any, done) {
      done(null, user);
    });

    // LoopBack 4 style authentication strategies

    // Express style middleware interceptors
    if (this.options.oidcOptions) {
      this.bind('oidcOptions').to(this.options.oidcOptions);
      registerAuthenticationStrategy(this, OIDCAuthentication);
      this.add(createBindingFromClass(OIDCAuthentication));
      this.bind('passport-init-mw').to(
        toInterceptor(passport.initialize() as ExpressRequestHandler),
      );
      this.bind('passport-session-mw').to(toInterceptor(passport.session()));
      this.bind('passport-oidc').to(
        toInterceptor(passport.authenticate('openidconnect')),
      );
    }
  }

  configureDatasourceFromFile(
    datasourceFile: string,
    datasourceConfigBindingKey: string,
  ): void {
    try {
      const mongoConfig: AnyObject = require(datasourceFile);
      this.bind(datasourceConfigBindingKey).to(mongoConfig);
    } catch {
      console.debug('missing datasource config file, applying defaults');
    }
  }

  // Unfortunately, TypeScript does not allow overriding methods inherited
  // from mapped types. https://github.com/microsoft/TypeScript/issues/38496
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  async start(): Promise<void> {
    // Use `databaseSeeding` flag to control if products/users should be pre
    // populated into the database. Its value is default to `true`.
    if (this.options.databaseSeeding !== false) {
      console.error(
        'Warning: Database seeding enabled' +
          JSON.stringify(this.options, null, 3),
      );
      await this.migrateSchema();
    }
    return super.start();
  }

  async startWebsocket(): Promise<void> {
    return startWebsocket(this);
  }

  async migrateSchema(options?: SchemaMigrationOptions): Promise<void> {
    const paragraphRepo = await this.getRepository(ParagraphRepository);
    await paragraphRepo.migrateHtmlTexcontent();

    await super.migrateSchema(options);

    // TODO adjust to SciLog case Delete existing shopping carts
    // cconst cartRepo = await this.getRepository(ShoppingCartRepository);
    // await cartRepo.deleteAll();
  }
}
