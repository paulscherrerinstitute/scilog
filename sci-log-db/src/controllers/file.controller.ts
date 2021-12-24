import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {inject} from '@loopback/core';
import {Count, CountSchema, Filter, FilterExcludingWhere, repository, Where} from '@loopback/repository';
import {del, get, getModelSchemaRef, HttpErrors, param, patch, post, put, requestBody, Response, RestBindings} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import path from 'path';
import {STORAGE_DIRECTORY} from '../keys';
import {Filesnippet} from '../models/file.model';
import {FileRepository} from '../repositories/file.repository';
import {basicAuthorization} from '../services/basic.authorizor';
import {OPERATION_SECURITY_SPEC} from '../utils/security-spec';

@authenticate('jwt')
@authorize({allowedRoles: ['customer'], voters: [basicAuthorization]})
export class FileController {
  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(FileRepository)
    public fileRepository: FileRepository,
    @inject(STORAGE_DIRECTORY) private storageDirectory: string
  ) {}

  @post('/filesnippet', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Filesnippet model instance',
        content: {'application/json': {schema: getModelSchemaRef(Filesnippet)}},
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
    return this.fileRepository.create(file, {currentUser: this.user});
  }

  @get('/filesnippet/count', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Filesnippet model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.where(Filesnippet) where?: Where<Filesnippet>,
  ): Promise<Count> {
    return this.fileRepository.count(where, {currentUser: this.user});
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
              items: getModelSchemaRef(Filesnippet, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(Filesnippet) filter?: Filter<Filesnippet>,
  ): Promise<Filesnippet[]> {
    return this.fileRepository.find(filter, {currentUser: this.user});
  }

  @patch('/filesnippet', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'File PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Filesnippet, {partial: true}),
        },
      },
    })
    file: Filesnippet,
    @param.where(Filesnippet) where?: Where<Filesnippet>,
  ): Promise<Count> {
    return this.fileRepository.updateAll(file, where, {currentUser: this.user});
  }

  @get('/filesnippet/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Filesnippet model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Filesnippet, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Filesnippet, {exclude: 'where'}) filter?: FilterExcludingWhere<Filesnippet>
  ): Promise<Filesnippet> {
    return this.fileRepository.findById(id, filter, {currentUser: this.user});
  }

  @get('/filesnippet/{id}/file', {
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
    @param.filter(Filesnippet, {exclude: 'where'}) filter?: FilterExcludingWhere<Filesnippet>
  ) {
    let data = await this.fileRepository.findById(id, filter, {currentUser: this.user})
    console.log(data);
    if (true) {
      const file = this.validateFileName('6053648475ee78951a266b9c.png');
      response.download(file, '6053648475ee78951a266b9c.png');
    } else {
      throw new HttpErrors.BadRequest(`Invalid image file for id: ${id}`);
    }

    return response;
  }

  /**
 * Validate file names to prevent them goes beyond the designated directory
 * @param fileName - File name
 */
  private validateFileName(fileName: string) {
    const resolved = path.resolve(this.storageDirectory, fileName);
    if (resolved.startsWith(this.storageDirectory)) return resolved;
    // The resolved file is outside sandbox
    throw new HttpErrors.BadRequest(`Invalid file name: ${fileName}`);
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
          schema: getModelSchemaRef(Filesnippet, {partial: true}),
        },
      },
    })
    file: Filesnippet,
  ): Promise<void> {
    await this.fileRepository.updateById(id, file, {currentUser: this.user});
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
    await this.fileRepository.replaceById(id, file, {currentUser: this.user});
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
    await this.fileRepository.deleteById(id, {currentUser: this.user});
  }
}
