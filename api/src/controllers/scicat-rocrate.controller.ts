import {param, post, requestBody, RestBindings, Response} from '@loopback/rest';

import {inject, service} from '@loopback/core';
import {OPERATION_SECURITY_SPEC} from '../utils/security-spec';
import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {basicAuthorization} from '../services/basic.authorizor';
import {ScicatCrateService} from '../services/scicat-crate.service';
import {pipeline} from 'node:stream/promises';

@authenticate('jwt')
@authorize({
  allowedRoles: ['any-authenticated-user'],
  voters: [basicAuthorization],
})
export class ScicatRoCrateController {
  constructor(
    @service(ScicatCrateService) private scicatCrateService: ScicatCrateService,
  ) {}

  // POST /logbooks/export/{id}/scicat-rocrate
  @post('/logbooks/export/{id}/scicat-rocrate', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Logbook packaged as a SciCat dataset RO-Crate',
        content: {
          'application/zip': {
            schema: {type: 'string', format: 'binary'},
          },
        },
      },
      '404': {
        description:
          'No logbook exists with the given id or user not authorized to read it',
      },
      '409': {
        description:
          "The logbook's creator has no first and last name on record, " +
          'which are required to build the crate',
      },
    },
  })
  async exportScicatRoCrate(
    @param.path.string('id') id: string,
    @requestBody({
      required: false,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              linkedDatasets: {
                type: 'array',
                items: {type: 'string'},
                description:
                  'PIDs of SciCat datasets to record as referenced by the exported logbook',
              },
            },
            additionalProperties: false,
          },
        },
      },
    })
    body: {linkedDatasets?: string[]} | undefined,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ) {
    const zip = await this.scicatCrateService.buildCrateStream(
      id,
      body?.linkedDatasets,
    );

    response.set('Content-Type', 'application/zip');
    response.set(
      'Content-Disposition',
      `attachment; filename="logbook-${id}-as-dataset.zip"`,
    );

    await pipeline(zip, response);
  }
}
