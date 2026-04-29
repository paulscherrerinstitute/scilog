import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors, Request, param, post, requestBody} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {errors as formidableErrors, formidable} from 'formidable';
import {LocationRepository} from '../repositories';
import {basicAuthorization} from '../services/basic.authorizor';
import {OPERATION_SECURITY_SPEC} from '../utils/security-spec';

const MAX_FILE_SIZE = 100 * 1024 * 1024;

const FORMIDABLE_422_ERRORS = new Set([
  formidableErrors.maxFilesExceeded,
  formidableErrors.malformedMultipart,
  formidableErrors.missingMultipartBoundary,
  formidableErrors.missingContentType,
  formidableErrors.noEmptyFiles,
  formidableErrors.unknownTransferEncoding,
]);

@authenticate('jwt')
@authorize({
  allowedRoles: ['any-authenticated-user'],
  voters: [basicAuthorization],
})
export class ElnImportController {
  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(LocationRepository)
    private locationRepository: LocationRepository,
  ) {}

  @post('/logbooks/import/eln', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '501': {
        description: 'Not implemented',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: {
                  type: 'object',
                  properties: {
                    statusCode: {type: 'number'},
                    message: {type: 'string'},
                  },
                },
              },
            },
            example: {
              error: {
                statusCode: 501,
                message: 'Not Implemented',
              },
            },
          },
        },
      },
    },
  })
  async import(
    @param.query.string('location-id', {
      description: 'ID of the location to import into',
      required: true,
    })
    locationId: string,
    @requestBody({
      required: true,
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            properties: {
              file: {
                type: 'string',
                format: 'binary',
                description: 'The .eln file to import (max 100 MB)',
              },
            },
          },
          'x-parser': 'stream',
        },
      },
    })
    request: Request,
  ): Promise<void> {
    await this.getUploadedFilePath(request);

    await this.locationRepository.findById(
      locationId,
      {},
      {
        currentUser: this.user,
      },
    );

    throw new HttpErrors.NotImplemented();
  }

  private async getUploadedFilePath(request: Request): Promise<string> {
    const form = formidable({maxFileSize: MAX_FILE_SIZE, maxFiles: 1});

    let files;
    try {
      [, files] = await form.parse(request);
    } catch (err: unknown) {
      if (!(err instanceof formidableErrors.default)) throw err;

      if (
        err.code === formidableErrors.biggerThanMaxFileSize ||
        err.code === formidableErrors.biggerThanTotalMaxFileSize
      ) {
        throw new HttpErrors.PayloadTooLarge(err.message);
      }
      if (FORMIDABLE_422_ERRORS.has(err.code)) {
        throw new HttpErrors.UnprocessableEntity(err.message);
      }

      throw err;
    }

    const uploaded = files.file?.[0];
    if (!uploaded) {
      throw new HttpErrors.UnprocessableEntity('A file must be provided');
    }

    return uploaded.filepath;
  }
}
