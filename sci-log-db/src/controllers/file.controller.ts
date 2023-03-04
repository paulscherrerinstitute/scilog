import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { inject } from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  HttpErrors,
  modelToJsonSchema,
  param,
  patch,
  post,
  Request,
  requestBody,
  Response,
  RestBindings,
} from '@loopback/rest';
import { SecurityBindings, UserProfile } from '@loopback/security';
import formidable from 'formidable';
import fs from 'fs';
import _ from 'lodash';
import { STORAGE_DIRECTORY } from '../keys';
import { Filesnippet } from '../models/file.model';
import { FileRepository } from '../repositories/file.repository';
import { basicAuthorization } from '../services/basic.authorizor';
import {
  addOwnerGroupAccessGroups,
  getModelSchemaRefWithStrict,
  validateFieldsVSModel,
} from '../utils/misc';
import { OPERATION_SECURITY_SPEC } from '../utils/security-spec';

const Mongo = require('mongodb');
const crypto = require('crypto');

const ownerGroupAccessGroupsFilesnippetModel = modelToJsonSchema(
  addOwnerGroupAccessGroups(Filesnippet, true),
);

const getModelSchemaRef = getModelSchemaRefWithStrict;

interface FormData {
  fields: Filesnippet;
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  files: any;
}

const formDataSchema = {
  type: 'object' as const,
  properties: {
    fields: getModelSchemaRef(Filesnippet),
    file: {
      type: 'string' as const,
      format: 'binary',
    },
  },
};

class MissingFileError extends Error {
  constructor(message = 'A file must be provided') {
    super(message);
  }
  statusCode = 422;
  name = 'ValidationError';
}

@authenticate('jwt')
@authorize({
  allowedRoles: ['any-authenticated-user'],
  voters: [basicAuthorization],
})
export class FileController {
  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(FileRepository)
    public fileRepository: FileRepository,
    @inject(STORAGE_DIRECTORY) private storageDirectory: string,
  ) { }

  @post('/filesnippet', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Filesnippet model instance',
        content: { 'application/json': { schema: getModelSchemaRef(Filesnippet) } },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Filesnippet, {
            title: 'NewFile',
            exclude: ['id'],
          }),
        },
      },
    })
    file: Omit<Filesnippet, 'id'>,
  ): Promise<Filesnippet> {
    return this.fileRepository.authorizedCreate(file, { currentUser: this.user });
  }

  @post('/filesnippet/files', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
            },
          },
        },
        description: 'Files and fields',
      },
    },
  })
  async fileUpload(
    @requestBody({
      required: true,
      content: {
        'multipart/form-data': {
          schema: formDataSchema,
          'x-parser': 'stream',
        },
      },
    })
    request: Request,
  ): Promise<Object> {
    const form = new formidable.IncomingForm();
    const formData: FormData = await new Promise(function (resolve, reject) {
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      form.parse(request, (err: any, fields: any, files: any) => {
        if (err) {
          reject(err);
          return;
        }
        if (!files.file) {
          const error = new MissingFileError();
          reject(error);
          return error;
        }
        const parsedFields = JSON.parse(fields?.fields || '{}');
        validateFieldsVSModel(
          parsedFields,
          ownerGroupAccessGroupsFilesnippetModel,
          reject,
        );
        resolve({ fields: parsedFields, files: files });
      });
    });
    return this.uploadToGridfs(formData, async (fm, resolve, reject) => {
      fm.fields['accessHash'] = crypto.randomBytes(64).toString('hex');
      return this.fileRepository
        .create(_.omit(fm.fields, ['id']), { currentUser: this.user })
        .then((file: Filesnippet) => {
          resolve(file);
        })
        .catch((err: HttpErrors.HttpError) => {
          reject(err);
        });
    });
  }

  @get('/filesnippet/count', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Filesnippet model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(
    @param.where(Filesnippet) where?: Where<Filesnippet>,
  ): Promise<Count> {
    return this.fileRepository.count(where, { currentUser: this.user });
  }

  @get('/filesnippet/index={id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Filesnippet model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Filesnippet, { includeRelations: true }),
          },
        },
      },
    },
  })
  async findIndexInBuffer(
    @param.path.string('id') id: string,
    @param.filter(Filesnippet, { exclude: 'where' })
    filter?: FilterExcludingWhere<Filesnippet>,
  ): Promise<Filesnippet> {
    return this.fileRepository.findIndexInBuffer(id, this.user, filter);
  }

  @get('/filesnippet/search={search}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of Filesnippet model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Filesnippet, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async findWithSearch(
    @param.path.string('search') search: string,
    @param.filter(Filesnippet) filter?: Filter<Filesnippet>,
  ): Promise<Filesnippet[]> {
    const snippetsFiltered = await this.fileRepository.findWithSearch(
      search,
      this.user,
      filter,
    );
    return snippetsFiltered;
  }

  @get('/filesnippet', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of Filesnippet model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Filesnippet, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(Filesnippet) filter?: Filter<Filesnippet>,
  ): Promise<Filesnippet[]> {
    return this.fileRepository.find(filter, { currentUser: this.user });
  }

  @patch('/filesnippet', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'File PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Filesnippet, { partial: true }),
        },
      },
    })
    file: Filesnippet,
    @param.where(Filesnippet) where?: Where<Filesnippet>,
  ): Promise<Count> {
    return this.fileRepository.updateAll(file, where, { currentUser: this.user });
  }

  @get('/filesnippet/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Filesnippet model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Filesnippet, { includeRelations: true }),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Filesnippet, { exclude: 'where' })
    filter?: FilterExcludingWhere<Filesnippet>,
  ): Promise<Filesnippet> {
    return this.fileRepository.findById(id, filter, { currentUser: this.user });
  }

  @get('/filesnippet/{id}/files', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Download file',
      },
    },
  })
  // @oas.response.file()
  async downloadFile(
    @param.path.string('id') id: string,
    @inject(RestBindings.Http.RESPONSE) response: Response,
    @param.filter(Filesnippet, { exclude: 'where' })
    filter?: FilterExcludingWhere<Filesnippet>,
  ) {
    const data = await this.fileRepository.findById(id, filter, {
      currentUser: this.user,
    });
    console.log(data);
    if (typeof data._fileId == 'undefined') {
      throw new HttpErrors.BadRequest(`Retrieving sandbox data is deprecated.`);
    }
    const bucket = new Mongo.GridFSBucket(
      this.fileRepository.dataSource.connector?.db,
    );
    response.set('Content-Type', data.contentType);
    bucket.openDownloadStream(data._fileId).pipe(response);
    return response;
  }

  @patch('/filesnippet/{id}/files', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      204: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
            },
          },
        },
        description: 'Files and fields',
      },
    },
  })
  async updateByIdWithFile(
    @param.path.string('id') id: string,
    @requestBody({
      required: true,
      content: {
        'multipart/form-data': {
          schema: formDataSchema,
          'x-parser': 'stream',
        },
      },
    })
    request: Request,
  ): Promise<void> {
    const form = new formidable.IncomingForm();
    const formData: FormData = await new Promise(function (resolve, reject) {
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      form.parse(request, (err: any, fields: any, files: any) => {
        if (err) {
          reject(err);
          return;
        }
        if (!files.file) {
          const error = new MissingFileError();
          reject(error);
          return error;
        }
        const parsedFields = JSON.parse(fields?.fields || '{}');
        validateFieldsVSModel(
          parsedFields,
          ownerGroupAccessGroupsFilesnippetModel,
          reject,
        );
        resolve({ fields: parsedFields, files: files });
      });
    });
    return this.uploadToGridfs(formData, async (fm, resolve, reject) => {
      return this.fileRepository
        .updateById(id, _.omit(fm.fields, ['id']), {
          currentUser: this.user,
        })
        .then(() => {
          resolve();
        })
        .catch((err: HttpErrors.HttpError) => {
          reject(err);
        });
    });
  }

  @patch('/filesnippet/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'File PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Filesnippet, { partial: true }),
        },
      },
    })
    file: Filesnippet,
  ): Promise<void> {
    await this.fileRepository.updateByIdWithHistory(id, file, {
      currentUser: this.user,
    });
  }

  @del('/filesnippet/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'File DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.fileRepository.deleteByIdWithHistory(id, {
      currentUser: this.user,
    });
  }

  @patch('/filesnippet/{id}/restore', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Filesnippet RESTORE success',
      },
    },
  })
  async restoreDeletedId(@param.path.string('id') id: string): Promise<void> {
    this.fileRepository.restoreDeletedId(id, this.user);
  }

  uploadToGridfs(
    formData: FormData,
    cb: (
      formData: FormData,
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      resolve: (value?: any | PromiseLike<any>) => void,
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      reject: (reason?: any) => void,
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    ) => Promise<any>,
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const bucket = new Mongo.GridFSBucket(
        this.fileRepository.dataSource.connector?.db,
      );
      const readStream = fs.createReadStream(formData.files.file.filepath);
      const uploadStream = bucket.openUploadStream(
        formData.files.file.filepath,
      );
      readStream.pipe(uploadStream);
      const id = uploadStream.id;
      uploadStream
        // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        .on('error', (error: any) => {
          console.log(error);
          reject({ error: error });
        })
        .on('finish', async () => {
          formData.fields['_fileId'] = id;
          formData.fields['contentType'] = formData.files.file.mimetype;
          // eslint-disable-next-line  @typescript-eslint/no-floating-promises
          cb(formData, resolve, reject);
        });
    });
  }
}
