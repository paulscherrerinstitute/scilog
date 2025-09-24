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
      .then(async result => {
        console.log(JSON.stringify(result.body, null, 2));

        // write metadata file
        fs.writeFileSync(
          'ro-crate-metadata.json',
          JSON.stringify(result.body, null, 2)
        );

        // set up output stream and archive
        const output = fs.createWriteStream('testeln.eln');
        const archive = archiver('zip');

        archive.pipe(output);

        const archiveName = 'testeln';
        archive.file('ro-crate-metadata.json', { name: `${archiveName}/ro-crate-metadata.json` });

        // wait for close event so we know the file is fully flushed
        await new Promise<void>((resolve, reject) => {
          output.on('close', () => {
            console.log(`${archive.pointer()} total bytes`);
            console.log('Archive finalized and file written.');
            resolve();
          });
          archive.on('error', err => reject(err));
          archive.finalize().catch(err => reject(err));
        });

        console.log('Wrote testeln.eln');
      });
  });


});
