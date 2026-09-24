import {
  createStubInstance,
  expect,
  StubbedInstanceWithSinonAccessor,
} from '@loopback/testlab';
import {UserProfile} from '@loopback/security';
import {Logbook, Paragraph} from '../../models';
import {BasesnippetRepository, LogbookRepository} from '../../repositories';
import {ExportService} from '../../services/export-snippets.service';
import {LogbookPdfService} from '../../services/logbook-pdf.service';
import {once} from 'node:events';
import {existsSync, rmSync, writeFileSync} from 'node:fs';
import {text} from 'node:stream/consumers';

describe('LogbookPdfService (unit)', () => {
  let basesnippetRepository: StubbedInstanceWithSinonAccessor<BasesnippetRepository>;
  let logbookRepository: StubbedInstanceWithSinonAccessor<LogbookRepository>;
  let exportService: StubbedInstanceWithSinonAccessor<ExportService>;
  let service: LogbookPdfService;
  let exportDir: string;

  const user: UserProfile = {
    email: 'test@example.com',
    name: 'Test user',
  } as UserProfile;

  beforeEach(() => {
    exportDir = '';
    basesnippetRepository = createStubInstance(BasesnippetRepository);
    logbookRepository = createStubInstance(LogbookRepository);
    exportService = createStubInstance(ExportService);
    service = new LogbookPdfService(
      user,
      basesnippetRepository,
      logbookRepository,
      async () => exportService,
    );
    logbookRepository.stubs.findById.resolves(givenLogbook());
    basesnippetRepository.stubs.find.resolves([
      {id: 'snippet-1', textcontent: 'a paragraph'} as Paragraph,
    ]);
  });

  afterEach(() => {
    if (!exportDir) return;
    rmSync(exportDir, {recursive: true, force: true});
    rmSync(`${exportDir}.gz`, {force: true});
  });

  it('names the export after the logbook and streams it', async () => {
    givenExport();

    const result = await service.exportPdf('logbook-1');

    expect(result.pdfName).to.equal('logbook-1.pdf');
    expect(await text(result.stream)).to.equal('an export');
  });

  it('names the export a tarball when it bundled attachments', async () => {
    givenExport({withAttachments: true});

    const result = await service.exportPdf('logbook-1');

    expect(result.pdfName).to.equal('logbook-1.tar.gz');
    expect(await text(result.stream)).to.equal('an export');
  });

  it('titles the export with the logbook name', async () => {
    givenExport();

    await service.exportPdf('logbook-1');

    expect(exportService.stubs.exportToPdf.firstCall.args[3]).to.equal(
      'A logbook',
    );
  });

  it('removes the temporary files once the stream has been read', async () => {
    givenExport();

    const result = await service.exportPdf('logbook-1');
    // Listening before draining: close can fire before the read resolves.
    const closed = once(result.stream, 'close');
    await text(result.stream);
    await closed;

    expect(existsSync(exportDir)).to.be.false();
  });

  it('removes the temporary files when an unread stream is destroyed', async () => {
    givenExport({withAttachments: true});

    const result = await service.exportPdf('logbook-1');
    const closed = once(result.stream, 'close');
    result.stream.destroy();
    await closed;

    expect(existsSync(exportDir)).to.be.false();
    expect(existsSync(`${exportDir}.gz`)).to.be.false();
  });

  // mocks exportService.exportToPdf by writing a small text file
  // to exportPath. tests verify existence of files / proper cleanup.
  function givenExport({withAttachments = false} = {}): void {
    exportService.stubs.exportToPdf.callsFake(
      async (
        _snippets,
        exportPath: {exportFile: string; exportDir: string},
      ) => {
        exportDir = exportPath.exportDir;
        const file = withAttachments
          ? `${exportDir}.gz`
          : exportPath.exportFile;
        writeFileSync(file, 'an export');
        return file;
      },
    );
  }

  function givenLogbook(): Logbook {
    return {
      id: 'logbook-1',
      name: 'A logbook',
      description: 'A description',
      createdAt: new Date('2026-08-01T09:30:00.000Z'),
    } as Logbook;
  }
});
