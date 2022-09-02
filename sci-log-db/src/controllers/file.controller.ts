import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { inject } from '@loopback/core';
import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository';
import { del, get, getModelSchemaRef, HttpErrors, param, patch, post, put, Request, requestBody, Response, RestBindings } from '@loopback/rest';
import { SecurityBindings, UserProfile } from '@loopback/security';
import formidable from 'formidable';
import fs from 'fs';
import _ from 'lodash';
import { STORAGE_DIRECTORY } from '../keys';
import { Filesnippet } from '../models/file.model';
import { FileRepository } from '../repositories/file.repository';
import { basicAuthorization } from '../services/basic.authorizor';
import { OPERATION_SECURITY_SPEC } from '../utils/security-spec';

const Mongo = require('mongodb');
const crypto = require('crypto');

interface FormData {
  fields: Filesnippet,
  files: any
}

const formDataSchema = {
  type: 'object' as const,
  properties: {
    fields: getModelSchemaRef(Filesnippet),
    file: {
      type: 'string' as const,
      format: 'binary'
    },
  }
}

class MissingFileError extends Error {
  constructor(message: string = 'A file must be provided') {
    super(message)
  }
  statusCode = 422
  name = 'ValidationError'
}

@authenticate('jwt')
@authorize({ allowedRoles: ['any-authenticated-user'], voters: [basicAuthorization] })
export class FileController {
  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(FileRepository)
    public fileRepository: FileRepository,
    @inject(STORAGE_DIRECTORY) private storageDirectory: string
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
    return this.fileRepository.create(file, { currentUser: this.user });
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
          schema:
            formDataSchema,
          'x-parser': 'stream'
        }
      }
    })
    request: Request
  ): Promise<Object> {
    var form = new formidable.IncomingForm();
    var formData: FormData = await new Promise(function (resolve, reject) {
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
        resolve({ fields: JSON.parse(fields?.fields || '{}'), files: files });
      });
    });
    return this.uploadToGridfs(formData, async (formData, resolve, reject) => {
      formData.fields["accessHash"] = crypto.randomBytes(64).toString('hex');
      return this.fileRepository.create(_.omit(formData.fields, ['id']), { currentUser: this.user }).then((file) => {
        resolve(file);
      }).catch((err: HttpErrors.HttpError) => {
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
    @param.filter(Filesnippet, { exclude: 'where' }) filter?: FilterExcludingWhere<Filesnippet>
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
    @param.filter(Filesnippet, { exclude: 'where' }) filter?: FilterExcludingWhere<Filesnippet>
  ) {
    let data = await this.fileRepository.findById(id, filter, { currentUser: this.user })
    console.log(data);
    if (typeof data._fileId == 'undefined') {
      throw new HttpErrors.BadRequest(`Retrieving sandbox data is deprecated.`);
    }
    let bucket = new Mongo.GridFSBucket(this.fileRepository.dataSource.connector?.db);
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
          schema:
            formDataSchema,
          'x-parser': 'stream'
        }
      }
    })
    request: Request
  ): Promise<void> {
    var form = new formidable.IncomingForm();
    interface FormData {
      fields: any,
      files: any
    }
    var formData: FormData = await new Promise(function (resolve, reject) {
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
        resolve({ fields: JSON.parse(fields?.fields), files: files });
      });
    });
    return this.uploadToGridfs(formData, async (formData, resolve, reject) => {
      return this.fileRepository.updateById(id, _.omit(formData.fields, ['id']), { currentUser: this.user }).then(() => {
        resolve();
      }).catch((err: HttpErrors.HttpError) => {
        reject(err);
      });
    })
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
    await this.fileRepository.updateById(id, file, { currentUser: this.user });
  }


  @put('/filesnippet/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'File PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() file: Filesnippet,
  ): Promise<void> {
    await this.fileRepository.replaceById(id, file, { currentUser: this.user });
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
    await this.fileRepository.deleteById(id, { currentUser: this.user });
  }

  uploadToGridfs(formData: FormData, cb: (formData: FormData, resolve: (value?: any | PromiseLike<any>) => void, reject: (reason?: any) => void) => Promise<any>): Promise<any> {
    return new Promise((resolve, reject) => {
      var bucket = new Mongo.GridFSBucket(this.fileRepository.dataSource.connector?.db);
      let readStream = fs.createReadStream(formData.files.file.path);
      let uploadStream = bucket.openUploadStream(formData.files.file.path);
      readStream.pipe(uploadStream);
      let id = uploadStream.id;
      uploadStream.
        on('error', (error: any) => {
          console.log(error);
          reject({ error: error });
        }).
        on('finish', async () => {
          console.log('done!');
          formData.fields['_fileId'] = id;
          formData.fields['contentType'] = formData.files.file.type;
          cb(formData, resolve, reject)
        });
    });
  }
}
