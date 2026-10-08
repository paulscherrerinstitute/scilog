import {get, param, RestBindings, Response} from '@loopback/rest';

import {inject, service} from '@loopback/core';
import {OPERATION_SECURITY_SPEC} from '../utils/security-spec';
import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {basicAuthorization} from '../services/basic.authorizor';
import {ElnExportService, ELN_ARCHIVE_ROOT} from '../services';
import {pipeline} from 'node:stream/promises';

@authenticate('jwt')
@authorize({
  allowedRoles: ['any-authenticated-user'],
  voters: [basicAuthorization],
})
export class ElnExportController {
  static readonly ELN_MEDIA_TYPE = 'application/vnd.eln+zip';
  constructor(
    @service(ElnExportService) private elnExportService: ElnExportService,
  ) {}

  // GET /logbooks/export/{id}/eln/metadata
  @get('/logbooks/export/{id}/eln/metadata', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Rocrate model instance',
        content: {'application/json': {schema: {type: 'object'}}},
      },
    },
  })
  async exportElnMetadata(
    @param.path.string('id') id: string,
  ): Promise<object> {
    const {rocrate} = await this.elnExportService.getRoCrateMetadata(id);
    return rocrate;
  }

  // GET /logbooks/export/{id}/eln
  @get('/logbooks/export/{id}/eln', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Rocrate model instance',
        content: {
          [ElnExportController.ELN_MEDIA_TYPE]: {schema: {type: 'object'}},
        },
      },
    },
  })
  async exportEln(
    @param.path.string('id') id: string,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ) {
    const zip = await this.elnExportService.buildElnStream(id);
    response.set('Content-Type', ElnExportController.ELN_MEDIA_TYPE);
    response.set(
      'Content-Disposition',
      `attachment; filename="${ELN_ARCHIVE_ROOT}-${id}.eln"`,
    );
    await pipeline(zip, response);
  }
}
