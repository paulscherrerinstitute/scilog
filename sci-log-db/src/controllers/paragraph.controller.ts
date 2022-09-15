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
  del,
  requestBody,
} from '@loopback/rest';
import { Paragraph } from '../models';
import { ParagraphRepository } from '../repositories';

import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { basicAuthorization } from '../services/basic.authorizor';
import { OPERATION_SECURITY_SPEC } from '../utils/security-spec';
import { SecurityBindings, UserProfile } from '@loopback/security';
import {inject} from '@loopback/core';

@authenticate('jwt')
@authorize({ allowedRoles: ['any-authenticated-user'], voters: [basicAuthorization] })
export class ParagraphController {
  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(ParagraphRepository)
    public paragraphRepository: ParagraphRepository,
  ) { }

  @post('/paragraphs', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Paragraph model instance',
        content: { 'application/json': { schema: getModelSchemaRef(Paragraph) } },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Paragraph, {
            title: 'NewParagraph',
            exclude: ['id'],
          }),
        },
      },
    })
    paragraph: Omit<Paragraph, 'id'>,
  ): Promise<Paragraph> {
    return this.paragraphRepository.create(paragraph, { currentUser: this.user });
  }

  @get('/paragraphs/count', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Paragraph model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(
    @param.where(Paragraph) where?: Where<Paragraph>,
  ): Promise<Count> {
    return this.paragraphRepository.count(where, { currentUser: this.user });
  }

  @get('/paragraphs', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of Paragraph model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Paragraph, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(Paragraph) filter?: Filter<Paragraph>,
  ): Promise<Paragraph[]> {
    return this.paragraphRepository.find(filter, { currentUser: this.user });
  }

  @patch('/paragraphs', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Paragraph PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Paragraph, { partial: true }),
        },
      },
    })
    paragraph: Paragraph,
    @param.where(Paragraph) where?: Where<Paragraph>,
  ): Promise<Count> {
    return this.paragraphRepository.updateAll(paragraph, where, { currentUser: this.user });
  }

  @get('/paragraphs/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Paragraph model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Paragraph, { includeRelations: true }),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Paragraph, { exclude: 'where' }) filter?: FilterExcludingWhere<Paragraph>
  ): Promise<Paragraph> {
    return this.paragraphRepository.findById(id, filter, { currentUser: this.user });
  }

  @patch('/paragraphs/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Paragraph PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Paragraph, { partial: true }),
        },
      },
    })
    paragraph: Paragraph,
  ): Promise<void> {
    await this.paragraphRepository.updateById(id, paragraph, { currentUser: this.user });
  }

  @del('/paragraphs/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Paragraph DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.paragraphRepository.deleteById(id, { currentUser: this.user });
  }
}
