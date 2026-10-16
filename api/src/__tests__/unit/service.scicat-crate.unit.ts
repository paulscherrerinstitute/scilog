import {
  createStubInstance,
  expect,
  StubbedInstanceWithSinonAccessor,
} from '@loopback/testlab';
import {UserProfile} from '@loopback/security';
import {Readable} from 'node:stream';
import {buffer} from 'node:stream/consumers';
import {ROCrate} from 'ro-crate';
import {Logbook, User} from '../../models';
import {LogbookRepository, UserRepository} from '../../repositories';
import {EntityBuilderService} from '../../services';
import {
  DATA_DIR,
  ScicatCrateService,
} from '../../services/scicat-crate.service';
import {ElnExportService} from '../../services/eln/export.service';
import {LogbookPdfService} from '../../services/logbook-pdf.service';
import {ArchiveService} from '../../services/archive.service';
import {listZipEntries} from '../zip.helpers';

describe('ScicatCrateService (unit)', () => {
  let logbookRepository: StubbedInstanceWithSinonAccessor<LogbookRepository>;
  let userRepository: StubbedInstanceWithSinonAccessor<UserRepository>;
  let entityBuilder: EntityBuilderService;
  let elnExportService: StubbedInstanceWithSinonAccessor<ElnExportService>;
  let logbookPdfService: StubbedInstanceWithSinonAccessor<LogbookPdfService>;
  // a real ArchiveService so buildCrateStream produces an inspectable zip
  let archiveService: ArchiveService;
  let service: ScicatCrateService;

  const user: UserProfile = {
    email: 'test@example.com',
    name: 'Test user',
  } as UserProfile;

  beforeEach(() => {
    logbookRepository = createStubInstance(LogbookRepository);
    userRepository = createStubInstance(UserRepository);
    entityBuilder = new EntityBuilderService();
    elnExportService = createStubInstance(ElnExportService);
    logbookPdfService = createStubInstance(LogbookPdfService);
    archiveService = new ArchiveService();
    service = new ScicatCrateService(
      user,
      logbookRepository,
      userRepository,
      entityBuilder,
      elnExportService,
      logbookPdfService,
      archiveService,
    );
    logbookRepository.stubs.findById.resolves(givenLogbook());
    userRepository.stubs.findOne.resolves(givenUser());
    logbookPdfService.stubs.exportPdf.resolves({
      stream: Readable.from(['fake pdf bytes']),
      pdfName: 'logbook-1.pdf',
    });
    elnExportService.stubs.buildElnStream.resolves(
      Readable.from(['fake eln bytes']),
    );
  });

  it('creates ro-crate with basic metadata and data directory', async () => {
    const crate = new ROCrate(
      JSON.parse(await service.getMetadataJson('logbook-1')),
    );
    expect(crate.root.name).to.equal('A logbook');
    expect(crate.root.description).to.equal('A description');
    expect(crate.root.datePublished).to.not.be.undefined();

    // the crate describes the data directory rather than the individual files
    const partIds = crate.root.hasPart.map(
      (part: {[key: string]: string}) => part['@id'],
    );
    expect(partIds).to.eql(['data/']);

    const dataEntity = crate.getEntity('data/');
    expect(crate.hasType(dataEntity, 'Dataset')).to.be.true();
    expect(dataEntity.dateCreated).to.equal('2026-08-01T09:30:00.000Z');

    // the logbook creator (looked up by createdBy) is added as a Person entity
    const creator = crate.getEntity('person://creator@example.com');
    expect(crate.hasType(creator, 'Person')).to.be.true();
    expect(creator?.givenName).to.equal('test-fn');
    expect(creator?.familyName).to.equal('test-ln');
  });

  it('rejects a logbook whose creator has no name on record', async () => {
    userRepository.stubs.findOne
      .withArgs({where: {email: 'creator@example.com'}})
      .resolves({} as User);

    const error = await expect(
      service.getMetadataJson('logbook-1'),
    ).to.be.rejectedWith(/first and last name/);
    expect((error as {statusCode?: number}).statusCode).to.equal(409);
  });

  it('builds a crate zip containing the pdf, eln and metadata', async () => {
    const zip = await service.buildCrateStream('logbook-1');
    const entries = await listZipEntries(await buffer(zip));

    expect(entries.sort()).to.eql(
      [
        'ro-crate-metadata.json',
        `${DATA_DIR}/logbook-1.pdf`,
        `${DATA_DIR}/logbook-1.eln`,
      ].sort(),
    );
  });

  function givenLogbook(): Logbook {
    return {
      id: 'logbook-1',
      name: 'A logbook',
      description: 'A description',
      createdAt: new Date('2026-08-01T09:30:00.000Z'),
      createdBy: 'creator@example.com',
    } as Logbook;
  }

  function givenUser(): User {
    return {
      firstName: 'test-fn',
      lastName: 'test-ln',
    } as User;
  }
});
