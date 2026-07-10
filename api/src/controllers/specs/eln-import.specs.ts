import {getModelSchemaRef, RequestBodyObject} from '@loopback/rest';
import {Logbook} from '../../models';
import {ElnErrorCode} from '../../services/eln-archive';
import {MAX_FILE_SIZE, MAX_FILE_SIZE_MB} from '../eln-import.config';

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

/** OpenAPI `responses` for `POST /logbooks/import/eln`. */
export const ELN_IMPORT_RESPONSES = {
  '201': {
    description: 'Created Logbook (with subsnippets included)',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Logbook, {includeRelations: true}),
      },
    },
  },
  ...ERROR_RESPONSES,
};

/** OpenAPI `requestBody` for the multipart .eln upload. */
export const ELN_IMPORT_REQUEST_BODY: Partial<RequestBodyObject> = {
  required: true,
  content: {
    'multipart/form-data': {
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description: `The .eln file to import (max ${MAX_FILE_SIZE_MB} MB)`,
          },
        },
      },
      'x-parser': 'stream',
    },
  },
};
