import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
} from '@loopback/rest';
import { Image } from '../models';
import { ImageRepository } from '../repositories';
import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { basicAuthorization } from '../services/basic.authorizor';
import { OPERATION_SECURITY_SPEC } from '../utils/security-spec';
import { SecurityBindings, UserProfile } from '@loopback/security';
import {inject} from '@loopback/core';

@authenticate('jwt')
@authorize({ allowedRoles: ['any-authenticated-user'], voters: [basicAuthorization] })
export class ImageController {
  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(ImageRepository)
    public imageRepository: ImageRepository,
  ) { }

  @post('/images', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Image model instance',
        content: { 'application/json': { schema: getModelSchemaRef(Image) } },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Image, {
            title: 'NewImage',
            exclude: ['id'],
          }),
        },
      },
    })
    image: Omit<Image, 'id'>,
  ): Promise<Image> {
    return this.imageRepository.create(image, { currentUser: this.user });
  }

  @get('/images/count', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Image model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(
    @param.where(Image) where?: Where<Image>,
  ): Promise<Count> {
    return this.imageRepository.count(where, { currentUser: this.user });
  }

  @get('/images', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of Image model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Image, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(Image) filter?: Filter<Image>,
  ): Promise<Image[]> {
    return this.imageRepository.find(filter, { currentUser: this.user });
  }

  @patch('/images', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Image PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Image, { partial: true }),
        },
      },
    })
    image: Image,
    @param.where(Image) where?: Where<Image>,
  ): Promise<Count> {
    return this.imageRepository.updateAll(image, where, { currentUser: this.user });
  }

  @get('/images/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Image model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Image, { includeRelations: true }),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Image, { exclude: 'where' }) filter?: FilterExcludingWhere<Image>
  ): Promise<Image> {
    return this.imageRepository.findById(id, filter, { currentUser: this.user });
  }

  @patch('/images/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Image PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Image, { partial: true }),
        },
      },
    })
    image: Image,
  ): Promise<void> {
    await this.imageRepository.updateById(id, image, { currentUser: this.user });
  }

  @put('/images/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Image PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() image: Image,
  ): Promise<void> {
    await this.imageRepository.replaceById(id, image, { currentUser: this.user });
  }

  @del('/images/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Image DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.imageRepository.deleteById(id, { currentUser: this.user });
  }
}
