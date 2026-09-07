import {
  createStubInstance,
  expect,
  StubbedInstanceWithSinonAccessor,
} from '@loopback/testlab';
import {UserProfile} from '@loopback/security';
import {ROCrate} from 'ro-crate';
import {Logbook, User} from '../../models';
import {LogbookRepository} from '../../repositories';
import {EntityBuilderService} from '../../services';
import {ScicatCrateService} from '../../services/scicat-crate.service';
import {UserRepository} from '@loopback/authentication-jwt';

describe('ScicatCrateService (unit)', () => {
  let logbookRepository: StubbedInstanceWithSinonAccessor<LogbookRepository>;
  let userRepository: StubbedInstanceWithSinonAccessor<UserRepository>;
  let entityBuilder: EntityBuilderService;
  let service: ScicatCrateService;

  const user: UserProfile = {
    email: 'test@example.com',
    name: 'Test user',
  } as UserProfile;

  beforeEach(() => {
    logbookRepository = createStubInstance(LogbookRepository);
    userRepository = createStubInstance(UserRepository);
    entityBuilder = new EntityBuilderService();
    service = new ScicatCrateService(
      user,
      logbookRepository,
      userRepository,
      entityBuilder,
    );
    logbookRepository.stubs.findById.resolves(givenLogbook());
    userRepository.stubs.findOne.resolves(givenUser());
  });

  it('describes the data directory rather than the individual files', async () => {
    const crate = new ROCrate(
      JSON.parse(await service.getMetadataJson('logbook-1')),
    );
    expect(crate.root.name).to.equal('A logbook');
    expect(crate.root.description).to.equal('A description');
    expect(crate.root.datePublished).to.not.be.undefined();

    const partIds = crate.root.hasPart.map(
      (part: {[key: string]: string}) => part['@id'],
    );
    expect(partIds).to.eql(['data/']);

    const dataEntity = crate.getEntity('data/');
    expect(crate.hasType(dataEntity, 'Dataset')).to.be.true();
    expect(dataEntity.dateCreated).to.equal('2026-08-01T09:30:00.000Z');
  });

  it('rejects a logbook whose creator has no name on record', async () => {
    userRepository.stubs.findOne.resolves({} as User);

    const error = await caught(() => service.getMetadataJson('logbook-1'));
    expect(error.statusCode).to.equal(422);
    expect(error.message).to.match(/first and last name/);
  });

  async function caught(
    run: () => Promise<unknown>,
  ): Promise<{statusCode?: number; message?: string}> {
    try {
      await run();
    } catch (err) {
      return err;
    }
    throw new Error('expected the call to reject');
  }

  function givenLogbook(): Logbook {
    return {
      id: 'logbook-1',
      name: 'A logbook',
      description: 'A description',
      createdAt: new Date('2026-08-01T09:30:00.000Z'),
    } as Logbook;
  }

  function givenUser(): User {
    return {
      firstName: 'test-fn',
      lastName: 'test-ln',
    } as User;
  }
});
