import {expect} from '@loopback/testlab';
import {once} from 'node:events';
import {Readable} from 'node:stream';
import {ArchiveService} from '../../services/archive.service';
import {listZipEntries} from '../zip.helpers';

describe('ArchiveService (unit)', () => {
  let service: ArchiveService;

  beforeEach(() => {
    service = new ArchiveService();
  });

  it('zips the assets it was given', async () => {
    const zip = service.zipStream([
      {stream: Readable.from(['hello']), archivePath: 'a.txt'},
      {stream: Readable.from(['world']), archivePath: 'nested/b.txt'},
    ]);

    expect(await zipEntries(zip)).to.eql(['a.txt', 'nested/b.txt']);
  });

  it('destroys the source streams once the archive completes', async () => {
    const source = Readable.from(['hello']);
    const zip = service.zipStream([{stream: source, archivePath: 'a.txt'}]);

    await zipEntries(zip);

    expect(source.destroyed).to.be.true();
  });

  it('destroys the source streams when the download is abandoned', async () => {
    const source = new Readable({read() {}});
    const zip = service.zipStream([{stream: source, archivePath: 'a.bin'}]);

    zip.destroy();
    await once(zip, 'close');

    expect(source.destroyed).to.be.true();
  });

  it('destroys the remaining sources when one of them fails', async () => {
    const failing = new Readable({read() {}});
    const pending = new Readable({read() {}});
    const zip = service.zipStream([
      {stream: failing, archivePath: 'a.bin'},
      {stream: pending, archivePath: 'b.bin'},
    ]);
    zip.on('error', () => {});

    failing.destroy(new Error('the source went away'));
    await new Promise(resolve => zip.once('close', resolve));

    expect(pending.destroyed).to.be.true();
  });

  async function zipEntries(zip: Readable) {
    const chunks: Buffer[] = [];
    for await (const chunk of zip) chunks.push(chunk as Buffer);
    return listZipEntries(Buffer.concat(chunks));
  }
});
