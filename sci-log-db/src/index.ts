import * as fs from 'fs';
import {ApplicationConfig} from '@loopback/core';
import {SciLogDbApplication} from './application';

export * from './application';

export async function main(options: ApplicationConfig = {}) {
  const app = new SciLogDbApplication(options);
  app.bind('oidcOptions').to(options.oidcOptions);
  await app.boot();
  await app.start();
  await app.startWebsocket();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}

if (require.main === module) {
  // Run the application
  const port = process.env.PORT ?? 3000;
  const config = {
    rest: {
      port,
      host: process.env.HOST,
      basePath: process.env.BASE_PATH ?? "",
      // The `gracePeriodForClose` provides a graceful close for http/https
      // servers with keep-alive clients. The default value is `Infinity`
      // (don't force-close). If you want to immediately destroy all sockets
      // upon stop, set its value to `0`.
      // See https://www.npmjs.com/package/stoppable
      gracePeriodForClose: 5000, // 5 seconds
      openApiSpec: {
        // useful when used with OpenAPI-to-GraphQL to locate your application
        setServersFromRequest: true,
      },
      websocket: {port},
    },
    databaseSeeding: false,
    oidcOptions: fs.existsSync('../oidc.json')? require('../oidc.json'): {},
  }

  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
