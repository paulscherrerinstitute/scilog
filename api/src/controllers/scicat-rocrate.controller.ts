import {get, param, RestBindings, Response} from '@loopback/rest';

import {inject, service} from '@loopback/core';
import {OPERATION_SECURITY_SPEC} from '../utils/security-spec';
import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {basicAuthorization} from '../services/basic.authorizor';
import {ElnExportService} from '../services';
import {DATA_DIR, ScicatCrateService} from '../services/scicat-crate.service';
import {LogbookPdfService} from '../services/logbook-pdf.service';
import {ArchiveService, AssetDescriptor} from '../services/archive.service';
import {Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';

@authenticate('jwt')
@authorize({
  allowedRoles: ['any-authenticated-user'],
  voters: [basicAuthorization],
})
export class ScicatRoCrateController {
  constructor(
    @service(ElnExportService) private elnExportService: ElnExportService,
    @service(ArchiveService) private archiveService: ArchiveService,
    @service(ScicatCrateService) private scicatCrateService: ScicatCrateService,
    @service(LogbookPdfService) private logbookPdfService: LogbookPdfService,
  ) {}

  // GET /logbooks/export/{id}/scicat-rocrate
  @get('/logbooks/export/{id}/scicat-rocrate', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Rocrate model instance',
        content: {'application/zip': {schema: {type: 'object'}}},
      },
    },
  })
  async exportScicatRoCrate(
    @param.path.string('id') id: string,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ) {
    const metadataJson = await this.scicatCrateService.getMetadataJson(id);

    const {stream: pdfStream, pdfName} =
      await this.logbookPdfService.exportPdf(id);

    try {
      const elnStream = await this.elnExportService.buildElnStream(id);

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
