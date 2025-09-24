import { Client } from '@loopback/testlab';
import { Suite } from 'mocha';
import { SciLogDbApplication } from '../..';
import { createUserToken, setupApplication } from './test-helper';
import fs from 'fs';
import archiver from 'archiver';

describe('RocrateController', function (this: Suite) {
  this.timeout(5000);
  let app: SciLogDbApplication;
  let client: Client;
  let token: string;

  before('setupApplication', async () => {
    ({ app, client } = await setupApplication({ dirtyDb: true }));
    // await clearDatabase(app);
    token = await createUserToken(app, client, ['oidc-user@facility.com']);
  });

  after(async () => {
    //await clearDatabase(app);
    if (app != null) await app.stop();
  });

  it('dummy test for rocrate endpoint for development', async () => {
    console.log('Using token: ' + token);
    await client
      .get('/rocrates/68b7047b45f9f4795ee4ea60')
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .expect(200)
      .then(
        async result => {
          console.log(JSON.stringify(result.body, null, 2));
          fs.writeFileSync('ro-crate-metadata.json', JSON.stringify(result.body, null, 2));
          // zip up the ro-crate.
          // the zip archive is called testeln.eln (not .zip)
          // and contains the ro-crate-metadata.json inside it
          const output = fs.createWriteStream('testeln.eln');
          const archive = archiver('zip', { zlib: { level: 9 } });
          output.on('close', function () {
            console.log(archive.pointer() + ' total bytes');
            console.log('archiver has been finalized and the output file descriptor has closed.');
          });
          archive.on('warning', function (err) {
            if (err.code === 'ENOENT') {
              console.warn(err);
            } else {
              throw err;
            }
          });
          archive.on('error', function (err) {
            throw err;
          });
          archive.pipe(output);
          archive.file('ro-crate-metadata.json', { name: 'ro-crate-metadata.json' });
          // sleep for 1 second to ensure the file is written
          function sleep(ms: number) {
            return new Promise(resolve => setTimeout(resolve, ms));
          }
          await archive.finalize();
          await sleep(1000);
          console.log('Wrote testeln.eln');
        }
      );
  });


});
