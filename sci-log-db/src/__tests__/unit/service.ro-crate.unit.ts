import {
  createStubInstance,
  expect,
  StubbedInstanceWithSinonAccessor,
} from '@loopback/testlab';
import {RoCrateService} from '../../services/ro-crate.service';
import {
  BasesnippetRepository,
  FileRepository,
  LogbookRepository,
} from '../../repositories';
import {EntityBuilderService} from '../../services';
import {UserProfile} from '@loopback/security';
import {LinkType, Logbook, Paragraph} from '../../models';
import {Filesnippet} from '../../models/file.model';

// these are more like integration tests for RoCrateService + EntityBuilderService
// as EntityBuilderService only contains pure functions, we use the real service instead of mocking their outputs
describe('ROCrateService (unit)', () => {
  let basesnippetRepository: StubbedInstanceWithSinonAccessor<BasesnippetRepository>;
  let logbookRepository: StubbedInstanceWithSinonAccessor<LogbookRepository>;
  let fileRepository: StubbedInstanceWithSinonAccessor<FileRepository>;
  let entityBuilder: EntityBuilderService;
  const user: UserProfile = {
    email: 'test@example.com',
    name: 'Test user',
  } as UserProfile;

  beforeEach(() => {
    basesnippetRepository = createStubInstance(BasesnippetRepository);
    logbookRepository = createStubInstance(LogbookRepository);
    fileRepository = createStubInstance(FileRepository);
    entityBuilder = new EntityBuilderService();
  });

  it('gets RO-Crate metadata for a logbook without files', async () => {
    logbookRepository.stubs.findById.resolves(givenLogbook());
    basesnippetRepository.stubs.find.resolves([
      givenParagraph({
        id: 'snippet-1',
        textcontent: 'Paragraph 1',
      }),
      givenParagraph({
        id: 'snippet-2',
        textcontent: 'Paragraph 2',
        subsnippets: [
          givenParagraph({
            id: 'snippet-3',
            textcontent: 'Comment on paragraph 1',
            parentId: 'snippet-2',
            linkType: LinkType.COMMENT,
          }),
        ],
      }),
    ]);

    const roCrateService = new RoCrateService(
      user,
      basesnippetRepository,
      logbookRepository,
      fileRepository,
      entityBuilder,
    );

    const {rocrate} = await roCrateService.getRoCrateMetadata('logbook-id');

    console.log(JSON.stringify(rocrate, null, 2));
    // assert the structure of the ro-crate: root data entity has a logbook,
    // with hasPart two snippets, and a comment on second paragraph
    expect(rocrate.root.hasPart).to.be.Array();
    expect(rocrate.root.hasPart).to.have.length(1);
    expect(rocrate.root.hasPart).to.containEql({
      '@id': entityBuilder.getEntityId('logbook-1'),
    });
    const logbookEntity = rocrate.getEntity(
      entityBuilder.getEntityId('logbook-1'),
    );
    // expect logbook name/description to match
    expect(logbookEntity.name).to.equal('SciLog ELN export: Test Logbook');
    expect(logbookEntity.description).to.equal('A logbook for testing');
    // expect hasPart to contain three snippets: two paragraphs and a comment
    expect(logbookEntity.hasPart).to.be.Array();
    expect(logbookEntity.hasPart).to.have.length(3);
    expect(logbookEntity.hasPart).to.containEql({
      '@id': entityBuilder.getEntityId('snippet-1'),
    });
    expect(logbookEntity.hasPart).to.containEql({
      '@id': entityBuilder.getEntityId('snippet-2'),
    });
    expect(logbookEntity.hasPart).to.containEql({
      '@id': entityBuilder.getEntityId('snippet-3'),
    });

    // expect second snippet to have comment as comment
    const snippet2Entity = rocrate.getEntity(
      entityBuilder.getEntityId('snippet-2'),
    );
    expect(snippet2Entity.comment).to.containEql({
      '@id': entityBuilder.getEntityId('snippet-3'),
    });
  });

  it('gets ro-crate and file metadata for a logbook with files', async () => {
    logbookRepository.stubs.findById.resolves(givenLogbook());
    basesnippetRepository.stubs.find.resolves([
      givenParagraph({
        id: 'snippet-1',
        textcontent: 'Paragraph 1',
        files: [{fileId: 'file-1'}],
      }),
      givenParagraph({
        id: 'snippet-2',
        textcontent: 'Paragraph 2',
        files: [{fileId: 'file-2'}],
      }),
    ]);

    fileRepository.stubs.findById
      .withArgs('file-1')
      .resolves(givenFilesnippet({_fileId: 'file-1'}));
    fileRepository.stubs.findById
      .withArgs('file-2')
      .resolves(givenFilesnippet({_fileId: 'file-2'}));

    const roCrateService = new RoCrateService(
      user,
      basesnippetRepository,
      logbookRepository,
      fileRepository,
      entityBuilder,
    );

    const {rocrate, fileMetadata} = await roCrateService.getRoCrateMetadata(
      'logbook-id',
    );

    expect(fileMetadata).to.containEql({
      snippetId: 'snippet-1',
      fileId: 'file-1',
      fileExt: 'txt',
    });
    expect(fileMetadata).to.containEql({
      snippetId: 'snippet-2',
      fileId: 'file-2',
      fileExt: 'txt',
    });

    // check that file entities are linked to the snippet in the ro-crate
    const snippet1Entity = rocrate.getEntity(
      entityBuilder.getEntityId('snippet-1'),
    );
    expect(snippet1Entity.hasPart).to.be.Array();
    expect(snippet1Entity.hasPart).to.containEql({
      '@id': entityBuilder.getFilePath('snippet-1', 'file-1', 'txt'),
    });

    const snippet2Entity = rocrate.getEntity(
      entityBuilder.getEntityId('snippet-2'),
    );
    expect(snippet2Entity.hasPart).to.be.Array();
    expect(snippet2Entity.hasPart).to.containEql({
      '@id': entityBuilder.getFilePath('snippet-2', 'file-2', 'txt'),
    });
  });
});

function givenLogbook(data?: Partial<Logbook>): Logbook {
  const defaults: Partial<Logbook> = {
    id: 'logbook-1',
    snippetType: 'logbook',
    name: 'Test Logbook',
    description: 'A logbook for testing',
    createdBy: 'user-1@test.com',
    createdAt: new Date(),
  };
  const logbook = new Logbook(Object.assign({}, defaults, data));
  return logbook;
}

function givenParagraph(data?: Partial<Paragraph>): Paragraph {
  const defaults: Partial<Paragraph> = {
    id: 'paragraph-1',
    snippetType: 'paragraph',
    textcontent: 'This is a test paragraph.',
    createdBy: 'user-1@test.com',
    createdAt: new Date(),
    linkType: LinkType.PARAGRAPH,
  };
  const paragraph = new Paragraph(Object.assign({}, defaults, data));
  return paragraph;
}

function givenFilesnippet(data?: Partial<Filesnippet>): Filesnippet {
  const defaults: Partial<Filesnippet> = {
    id: 'file-1',
    snippetType: 'Image',
    _fileId: 'abc123',
    contentType: 'text/plain',
    fileExtension: 'txt',
    createdBy: 'user-1@test.com',
    createdAt: new Date(),
  };
  const filesnippet = new Filesnippet(Object.assign({}, defaults, data));
  return filesnippet;
}
