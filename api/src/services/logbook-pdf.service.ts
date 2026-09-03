import {BindingScope, Getter, inject, injectable} from '@loopback/core';
import {Filter, repository} from '@loopback/repository';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {createReadStream, rmSync} from 'node:fs';
import {mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {finished, Readable} from 'node:stream';
import {EXPORT_SERVICE} from '../keys';
import {Basesnippet, Logbook, Paragraph} from '../models';
import {BasesnippetRepository, LogbookRepository} from '../repositories';
import {ExportService} from './export-snippets.service';

export interface PdfExport {
  stream: Readable;
  pdfName: string;
}

// Service to get PDF export of a logbook as a Readable stream:
// https://nodejs.org/api/stream.html#readable-streams
// Wrapper over ExportService, which produces pdf or tar.gz files on disk,
// which the caller must be responsible for cleaning up.
// This class provides a better API by attaching cleanup to the stream's
// completion events.
@injectable({scope: BindingScope.TRANSIENT})
export class LogbookPdfService {
  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(BasesnippetRepository)
    private basesnippetRepository: BasesnippetRepository,
    @repository(LogbookRepository) private logbookRepository: LogbookRepository,
    @inject.getter(EXPORT_SERVICE)
    private exportServiceGetter: Getter<ExportService>,
  ) {}

  async exportPdf(logbookId: string): Promise<PdfExport> {
    const logbook = await this.findLogbook(logbookId);
    const snippets = await this.basesnippetRepository.find(
      this.exportFilter(logbookId),
      {currentUser: this.user},
    );

    const exportDir = await mkdtemp(join(tmpdir(), 'scilog-logbook-pdf-'));
    const removeTempFiles = () => {
      // exportToPdf writes the tarball as a sibling of exportDir, not inside
      // it, so removing only the directory would leak the tarball.
      rmSync(exportDir, {recursive: true, force: true});
      rmSync(`${exportDir}.gz`, {force: true});
    };

    try {
      const exportService = await this.exportServiceGetter();
      const pdfPath = await exportService.exportToPdf(
        snippets as unknown as Paragraph[],
        {exportFile: join(exportDir, 'export.pdf'), exportDir},
        {},
        logbook.name,
      );
      // The export writes a tarball when it bundles attachments, and names it
      // .gz rather than .tar.gz.
      const pdfName = pdfPath.endsWith('.gz')
        ? `${logbookId}.tar.gz`
        : `${logbookId}.pdf`;

      const stream = createReadStream(pdfPath);
      finished(stream, removeTempFiles);
      return {stream, pdfName};
    } catch (err) {
      removeTempFiles();
      throw err;
    }
  }

  // Mirrors the filter the web app sends for a whole-logbook PDF export
  // (`_prepareFilters` in web/src/app/core/remote-data.service.ts), including the
  // history exclusion that's added on top by ExportRepositoryMixin,
  // minus the innermost include of the 'edit' subsnippets which is not used by PDF export.
  private exportFilter(logbookId: string): Filter<Basesnippet> {
    return {
      order: ['defaultOrder ASC'],
      include: [
        {
          relation: 'subsnippets',
          scope: {where: {snippetType: {nin: ['history', 'updated']}}},
        },
      ],
      where: {
        and: [
          {snippetType: {inq: ['paragraph', 'image']}},
          {deleted: false},
          {parentId: logbookId},
        ],
      },
    };
  }

  private findLogbook(logbookId: string): Promise<Logbook> {
    return this.logbookRepository.findById(
      logbookId,
      {},
      {currentUser: this.user},
    );
  }
}
