import {BindingScope, inject, injectable, service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {ROCrate} from 'ro-crate';
import {Logbook, User} from '../models';
import {LogbookRepository} from '../repositories';
import {EntityBuilderService} from './entity-builder.service';
import {UserRepository} from '@loopback/authentication-jwt';
import {computeUserName} from './user-service';

export const DATA_DIR = 'data';

// Construct a ro-crate-metadata.json to be used with scicat-rocrate service.
// This RO-Crate represents the logbook as a SciCat Dataset.
// The ELN and PDF files should be placed under DATA_DIR in the RO-Crate,
// and getMetadataJson creates a directory entity for it.
@injectable({scope: BindingScope.TRANSIENT})
export class ScicatCrateService {
  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(LogbookRepository) private logbookRepository: LogbookRepository,
    @repository(UserRepository) private userRepository: UserRepository,
    @service(EntityBuilderService) private entityBuilder: EntityBuilderService,
  ) {}

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
      throw new HttpErrors.UnprocessableEntity(
        `Logbook ${logbook.id} was created by ${logbook.createdBy}, whose first and last name are needed for the crate but are not on record.`,
      );
    return user;
  }

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
