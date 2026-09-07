import {repository} from '@loopback/repository';
import {get, param, RestBindings, Response} from '@loopback/rest';

import {inject, service} from '@loopback/core';
import {OPERATION_SECURITY_SPEC} from '../utils/security-spec';
import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {basicAuthorization} from '../services/basic.authorizor';
import {FileRepository} from '../repositories/file.repository';
import {RoCrateExportService} from '../services';
import {EntityBuilderService} from '../services';
import {DATA_DIR, ScicatCrateService} from '../services/scicat-crate.service';
import {LogbookPdfService} from '../services/logbook-pdf.service';
import {ArchiveService, AssetDescriptor} from '../services/archive.service';
import {Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';

import {ObjectId} from 'mongodb';
import * as mongodb from 'mongodb';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {Preview, Defaults, HtmlFile} from 'ro-crate-html/index-node.js';
import path from 'path';

@authenticate('jwt')
@authorize({
  allowedRoles: ['any-authenticated-user'],
  voters: [basicAuthorization],
})
export class RoCrateController {
  static readonly ARCHIVE_ROOT = 'scilog-eln-export';
  static readonly ELN_MEDIA_TYPE = 'application/vnd.eln+zip';
  constructor(
    @repository(FileRepository) private fileRepository: FileRepository,
    @service(RoCrateExportService)
    private rocrateExportService: RoCrateExportService,
    @service(ArchiveService) private archiveService: ArchiveService,
    @service(EntityBuilderService) private entityBuilder: EntityBuilderService,
    @service(ScicatCrateService) private scicatCrateService: ScicatCrateService,
    @service(LogbookPdfService) private logbookPdfService: LogbookPdfService,
  ) {}

  // GET /rocrates/{id}
  @get('/rocrates/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Rocrate model instance',
        content: {'application/json': {schema: {type: 'object'}}},
      },
    },
  })
  async findById(@param.path.string('id') id: string): Promise<object> {
    const {rocrate} = await this.rocrateExportService.getRoCrateMetadata(id);
    return rocrate;
  }

  // GET /rocrates/{id}/download
  @get('/rocrates/{id}/download', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Rocrate model instance',
        content: {
          [RoCrateController.ELN_MEDIA_TYPE]: {schema: {type: 'object'}},
        },
      },
    },
  })
  async downloadById(
    @param.path.string('id') id: string,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ) {
    const zip = await this.buildElnStream(id);
    response.set('Content-Type', RoCrateController.ELN_MEDIA_TYPE);
    response.set(
      'Content-Disposition',
      `attachment; filename="${RoCrateController.ARCHIVE_ROOT}-${id}.eln"`,
    );
    await pipeline(zip, response);
  }

  // Build the ELN archive for a logbook and return it as a readable stream.
  private async buildElnStream(id: string): Promise<Readable> {
    const {rocrate, fileMetadata} =
      await this.rocrateExportService.getRoCrateMetadata(id);

    // Build asset descriptors from GridFS streams for files referenced in snippets
    const bucket = new mongodb.GridFSBucket(
      this.fileRepository.dataSource.connector?.db,
    );
    const assets: Array<AssetDescriptor> = fileMetadata.map(
      ({snippetId, fileId, fileExt}) => {
        return {
          stream: bucket.openDownloadStream(fileId as unknown as ObjectId),
          archivePath: path.join(
            RoCrateController.ARCHIVE_ROOT,
            this.entityBuilder.getFilePath(snippetId, fileId, fileExt),
          ),
        };
      },
    );

    // add metadata json as a stream asset
    const metadataJson = JSON.stringify(rocrate, null, 2);
    assets.push({
      stream: Readable.from([metadataJson]),
      archivePath: path.join(
        RoCrateController.ARCHIVE_ROOT,
        'ro-crate-metadata.json',
      ),
    });

    // generate preview html and add as stream asset
    const previewHtml: string = await new HtmlFile(new Preview(rocrate)).render(
      Defaults.render_script,
    );
    assets.push({
      stream: Readable.from([previewHtml]),
      archivePath: path.join(
        RoCrateController.ARCHIVE_ROOT,
        'ro-crate-preview.html',
      ),
    });

    return this.archiveService.zipStream(assets);
  }

  // GET /scicat-rocrates/{id}/download
  @get('/scicat-rocrates/{id}/download', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Rocrate model instance',
        content: {'application/zip': {schema: {type: 'object'}}},
      },
    },
  })
  async downloadScicatRoCrateById(
    @param.path.string('id') id: string,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ) {
    const metadataJson = await this.scicatCrateService.getMetadataJson(id);

    const {stream: pdfStream, pdfName} =
      await this.logbookPdfService.exportPdf(id);

    try {
      const elnStream = await this.buildElnStream(id);

      const assets: Array<AssetDescriptor> = [
        {
          // Explicitly create a directory entry as validation fails in scicat-rocrate
          // service otherwise
          // TO-DO: Remove this once the fix (v2.6.6) is deployed:
          // https://github.com/paulscherrerinstitute/scicat-rocrate/issues/338
          stream: null,
          archivePath: `${DATA_DIR}/`,
        },
        {
          stream: pdfStream,
          archivePath: `${DATA_DIR}/${pdfName}`,
        },
        {
          stream: elnStream,
          archivePath: `${DATA_DIR}/${id}.eln`,
        },
        {
          stream: Readable.from([metadataJson]),
          archivePath: 'ro-crate-metadata.json',
        },
      ];

      const zip = this.archiveService.zipStream(assets);

      response.set('Content-Type', 'application/zip');
      response.set(
        'Content-Disposition',
        `attachment; filename="logbook-${id}-as-dataset.zip"`,
      );

      await pipeline(zip, response);
    } finally {
      pdfStream.destroy();
    }
  }
}
