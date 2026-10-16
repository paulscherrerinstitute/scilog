import {BindingScope, inject, injectable, service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {Readable} from 'node:stream';
import {ROCrate} from 'ro-crate';
import {Logbook, User} from '../models';
import {LogbookRepository} from '../repositories';
import {EntityBuilderService} from './entity-builder.service';
import {UserRepository} from '../repositories';
import {computeUserName} from './user-service';
import {ElnExportService} from './eln/export.service';
import {LogbookPdfService} from './logbook-pdf.service';
import {ArchiveService, AssetDescriptor} from './archive.service';

export const DATA_DIR = 'data';

// Construct a RO-Crate to be used with scicat-rocrate service.
// This RO-Crate represents the logbook as a SciCat Dataset.
// The ELN and PDF files are placed under DATA_DIR in the RO-Crate,
@injectable({scope: BindingScope.TRANSIENT})
export class ScicatCrateService {
  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(LogbookRepository) private logbookRepository: LogbookRepository,
    @repository(UserRepository) private userRepository: UserRepository,
    @service(EntityBuilderService) private entityBuilder: EntityBuilderService,
    @service(ElnExportService) private elnExportService: ElnExportService,
    @service(LogbookPdfService) private logbookPdfService: LogbookPdfService,
    @service(ArchiveService) private archiveService: ArchiveService,
  ) {}

  async buildCrateStream(logbookId: string): Promise<Readable> {
    const metadataJson = await this.getMetadataJson(logbookId);

    const {stream: pdfStream, pdfName} =
      await this.logbookPdfService.exportPdf(logbookId);

    try {
      const elnStream = await this.elnExportService.buildElnStream(logbookId);

      const assets: AssetDescriptor[] = [
        {stream: pdfStream, archivePath: `${DATA_DIR}/${pdfName}`},
        {stream: elnStream, archivePath: `${DATA_DIR}/${logbookId}.eln`},
        {
          stream: Readable.from([metadataJson]),
          archivePath: 'ro-crate-metadata.json',
        },
      ];
      return this.archiveService.zipStream(assets);
    } catch (err) {
      pdfStream.destroy();
      throw err;
    }
  }

  private findLogbook(logbookId: string): Promise<Logbook> {
    return this.logbookRepository.findById(
      logbookId,
      {},
      {currentUser: this.user},
    );
  }

  private async findCreator(logbook: Logbook): Promise<User> {
    const user: User | null = await this.userRepository.findOne({
      where: {email: logbook.createdBy},
    });
    if (!user?.firstName || !user.lastName)
      throw new HttpErrors.Conflict(
        `Logbook ${logbook.id} was created by ${logbook.createdBy}, ` +
          `whose first and last name are needed for the crate but are not on record. ` +
          `Contact an administrator to update the user's attributes.`,
      );
    return user;
  }

  // @internal - left public only for unit tests
  async getMetadataJson(logbookId: string): Promise<string> {
    const logbook = await this.findLogbook(logbookId);
    const creator = await this.findCreator(logbook);
    const crate = new ROCrate();
    crate.descriptor.sdPublisher = this.entityBuilder.buildOrganizationEntity();
    crate.root.name = logbook.name;
    crate.root.description = logbook.description ?? '';
    crate.root.datePublished = new Date().toISOString();
    crate.root.license = this.entityBuilder.buildLicenseEntity('RO-Crate');
    const dsEntityToAdd = this.entityBuilder.buildDirectoryEntity(
      `${DATA_DIR}/`,
      logbook.name,
      logbook.createdAt.toISOString(),
      logbook.description,
    );
    crate.root.hasPart = [dsEntityToAdd];
    const dsEntity = crate.getEntity(dsEntityToAdd['@id']);
    dsEntity.creator = this.entityBuilder.buildPerson(
      logbook.createdBy,
      computeUserName(creator),
      creator.firstName,
      creator.lastName,
    );
    return JSON.stringify(crate, null, 2);
  }
}
