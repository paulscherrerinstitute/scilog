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
import {Paragraph} from '../models';
import {ParagraphRepository} from '../repositories';

import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {basicAuthorization} from '../services/basic.authorizor';
import {OPERATION_SECURITY_SPEC} from '../utils/security-spec';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {inject} from '@loopback/core';

@authenticate('jwt')
@authorize({
  allowedRoles: ['any-authenticated-user'],
  voters: [basicAuthorization],
})
export class ParagraphController {
  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(ParagraphRepository)
    public paragraphRepository: ParagraphRepository,
  ) {}

  @post('/paragraphs', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Paragraph model instance',
        content: {'application/json': {schema: getModelSchemaRef(Paragraph)}},
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
    return this.paragraphRepository.create(paragraph, {currentUser: this.user});
  }

  @get('/paragraphs/count', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Paragraph model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.where(Paragraph) where?: Where<Paragraph>,
  ): Promise<Count> {
    return this.paragraphRepository.count(where, {currentUser: this.user});
  }

  @get('/paragraphs/search={search}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of paragraphs model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Paragraph, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async findWithSearch(
    @param.path.string('search') search: string,
    @param.filter(Paragraph) filter?: Filter<Paragraph>,
  ): Promise<Paragraph[]> {
    const snippetsFiltered = await this.paragraphRepository.findWithSearch(
      search,
      this.user,
      filter,
    );
    return snippetsFiltered;
  }

  @get('/paragraphs/index={id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Paragraphs model instance',
        content: {
          'application/json': {
            type: 'any',
            schema: getModelSchemaRef(Paragraph, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findIndexInBuffer(
    @param.path.string('id') id: string,
    @param.filter(Paragraph) filter?: Filter<Paragraph>,
  ): Promise<number> {
    return this.paragraphRepository.findIndexInBuffer(id, this.user, filter);
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
              items: getModelSchemaRef(Paragraph, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(Paragraph) filter?: Filter<Paragraph>,
  ): Promise<Paragraph[]> {
    return this.paragraphRepository.find(filter, {currentUser: this.user});
  }

  @patch('/paragraphs', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Paragraph PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Paragraph, {partial: true}),
        },
      },
    })
    paragraph: Paragraph,
    @param.where(Paragraph) where?: Where<Paragraph>,
  ): Promise<Count> {
    return this.paragraphRepository.updateAll(paragraph, where, {
      currentUser: this.user,
    });
  }

  @get('/paragraphs/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Paragraph model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Paragraph, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Paragraph, {exclude: 'where'})
    filter?: FilterExcludingWhere<Paragraph>,
  ): Promise<Paragraph> {
    return this.paragraphRepository.findById(id, filter, {
      currentUser: this.user,
    });
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
          schema: getModelSchemaRef(Paragraph, {partial: true}),
        },
      },
    })
    paragraph: Paragraph,
  ): Promise<void> {
    await this.paragraphRepository.updateByIdWithHistory(id, paragraph, {
      currentUser: this.user,
    });
  }

  @put('/paragraphs/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Paragraph PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() paragraph: Paragraph,
  ): Promise<void> {
    await this.paragraphRepository.replaceById(id, paragraph, {
      currentUser: this.user,
    });
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
    await this.paragraphRepository.deleteByIdWithHistory(id, {
      currentUser: this.user,
    });
  }

  @patch('/paragraphs/{id}/restore', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Paragraphs RESTORE success',
      },
    },
  })
  async restoreDeletedId(@param.path.string('id') id: string): Promise<void> {
    this.paragraphRepository.restoreDeletedId(id, this.user);
  }
}
