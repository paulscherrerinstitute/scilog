import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {inject, service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  getModelSchemaRef,
  HttpErrors,
  Request,
  Response,
  RestBindings,
  param,
  post,
  requestBody,
} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {errors as formidableErrors, formidable} from 'formidable';
import {Logbook} from '../models';
import {LocationRepository} from '../repositories';
import {basicAuthorization} from '../services/basic.authorizor';
import {ElnError, ElnErrorCode} from '../services/eln-archive';
import {ElnImportError, ElnImportService} from '../services/eln-import.service';
import {OPERATION_SECURITY_SPEC} from '../utils/security-spec';

const MAX_FILE_SIZE = 100 * 1024 * 1024;

/**
 * 422 envelope for archive-validation failures. `details` carries the list
 * of `ElnError`s; strong-error-handler serializes it as `error.details`
 * (one of its default-passthrough fields for 4xx responses).
 */
class ElnImportHttpError extends HttpErrors.UnprocessableEntity {
  constructor(public readonly details: ElnError[]) {
    super('Archive validation failed');
  }
}

const ERROR_SCHEMA = {
  type: 'object',
  properties: {
    error: {
      type: 'object',
      properties: {
        statusCode: {type: 'number'},
        message: {type: 'string'},
        name: {type: 'string'},
        code: {type: 'string'},
      },
    },
  },
};

const ELN_ERROR_SCHEMA = {
  type: 'object',
  properties: {
    error: {
      type: 'object',
      properties: {
        statusCode: {type: 'number'},
        message: {type: 'string'},
        name: {type: 'string'},
        details: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              code: {type: 'string', enum: Object.values(ElnErrorCode)},
              message: {type: 'string'},
            },
          },
        },
      },
    },
  },
};

const ERROR_RESPONSES = {
  '400': {
    description: 'Bad request — `location-id` query parameter is missing.',
    content: {
      'application/json': {
        schema: ERROR_SCHEMA,
        example: {
          error: {
            statusCode: 400,
            name: 'BadRequestError',
            message: 'Required parameter location-id is missing!',
            code: 'MISSING_REQUIRED_PARAMETER',
          },
        },
      },
    },
  },
  '401': {
    description: 'Unauthorized — no JWT or invalid JWT.',
    content: {
      'application/json': {
        schema: ERROR_SCHEMA,
        example: {
          error: {
            statusCode: 401,
            name: 'UnauthorizedError',
            message: 'Authorization header not found.',
          },
        },
      },
    },
  },
  '404': {
    description: 'Location with the supplied `location-id` does not exist.',
    content: {
      'application/json': {
        schema: ERROR_SCHEMA,
        example: {
          error: {
            statusCode: 404,
            name: 'Error',
            message:
              'Entity not found: Location with id "000000000000000000000000"',
            code: 'ENTITY_NOT_FOUND',
          },
        },
      },
    },
  },
  '413': {
    description: `Payload too large — the .eln file exceeds ${MAX_FILE_SIZE} bytes.`,
    content: {
      'application/json': {
        schema: ERROR_SCHEMA,
        example: {
          error: {
            statusCode: 413,
            name: 'PayloadTooLargeError',
            message:
              `options.maxTotalFileSize (${MAX_FILE_SIZE} bytes) exceeded, ` +
              `received ${MAX_FILE_SIZE + 1} bytes of file data`,
          },
        },
      },
    },
  },
  '422': {
    description:
      'Unprocessable — no file attached, multiple files attached, malformed ' +
      'multipart, or the .eln archive failed metadata/integrity validation. ' +
      'For archive-validation failures, `error.details` contains the list of ' +
      `ElnError entries; \`code\` is one of: ${Object.values(ElnErrorCode).join(', ')}.`,
    content: {
      'application/json': {
        schema: ELN_ERROR_SCHEMA,
        examples: {
          'no file attached': {
            summary: 'No file field in the multipart payload',
            value: {
              error: {
                statusCode: 422,
                name: 'UnprocessableEntityError',
                message: 'A file must be provided',
              },
            },
          },
          'multiple files attached': {
            summary: 'More than one file in the payload',
            value: {
              error: {
                statusCode: 422,
                name: 'UnprocessableEntityError',
                message: 'options.maxFiles (1) exceeded',
              },
            },
          },
          'archive validation failed': {
            summary: 'The .eln archive failed integrity or metadata validation',
            value: {
              error: {
                statusCode: 422,
                name: 'UnprocessableEntityError',
                message: 'Archive validation failed',
                details: [
                  {
                    code: ElnErrorCode.MISSING_ELN_FILE,
                    message: 'File ./book/file.txt not found in archive',
                  },
                  {
                    code: ElnErrorCode.MISSING_DATASET_FIELD,
                    message: 'Dataset ./: missing author',
                  },
                ],
              },
            },
          },
        },
      },
    },
  },
};

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
    @service(ElnImportService) private importService: ElnImportService,
  ) {}

  @post('/logbooks/import/eln', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '201': {
        description: 'Created Logbook (with subsnippets included)',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Logbook, {includeRelations: true}),
          },
        },
      },
      ...ERROR_RESPONSES,
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
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ): Promise<Logbook> {
    const filepath = await this.getUploadedFilePath(request);

    const location = await this.locationRepository.findById(
      locationId,
      {},
      {currentUser: this.user},
    );

    try {
      const logbook = await this.importService.import(filepath, location);
      response.status(201);
      return logbook;
    } catch (err) {
      if (err instanceof ElnImportError) {
        throw new ElnImportHttpError(err.errors);
      }
      throw err;
    }
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
