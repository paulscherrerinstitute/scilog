import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {inject} from '@loopback/core';
import {Count, CountSchema, Filter, FilterExcludingWhere, repository, Where} from '@loopback/repository';
import {del, get, getModelSchemaRef, param, patch, post, put, requestBody} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {Logbook} from '../models';
import {LogbookRepository} from '../repositories';
import {basicAuthorization} from '../services/basic.authorizor';
import {OPERATION_SECURITY_SPEC} from '../utils/security-spec';

@authenticate('jwt')
@authorize({allowedRoles: ['any-authenticated-user'], voters: [basicAuthorization]})
export class LogbookController {
  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(LogbookRepository)
    public logbookRepository: LogbookRepository,
  ) {}

  @post('/logbooks', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Logbook model instance',
        content: {'application/json': {schema: getModelSchemaRef(Logbook)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Logbook, {
            title: 'NewLogbook',
            exclude: ['id'],
          }),
        },
      },
    })
    logbook: Omit<Logbook, 'id'>,
  ): Promise<Logbook> {
    return this.logbookRepository.create(logbook,{currentUser: this.user});
  }

  @get('/logbooks/count', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Logbook model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.where(Logbook) where?: Where<Logbook>,
  ): Promise<Count> {
    return this.logbookRepository.count(where, {currentUser: this.user});
  }

  @get('/logbooks', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of Logbook model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Logbook, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(Logbook) filter?: Filter<Logbook>,
  ): Promise<Logbook[]> {
    return this.logbookRepository.find(filter, {currentUser: this.user});
  }

  @patch('/logbooks', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Logbook PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Logbook, {partial: true}),
        },
      },
    })
    logbook: Logbook,
    @param.where(Logbook) where?: Where<Logbook>,
  ): Promise<Count> {
    return this.logbookRepository.updateAll(logbook, where, {currentUser: this.user});
  }

  @get('/logbooks/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Logbook model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Logbook, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Logbook, {exclude: 'where'}) filter?: FilterExcludingWhere<Logbook>
  ): Promise<Logbook> {
    return this.logbookRepository.findById(id, filter, {currentUser: this.user});
  }

  @patch('/logbooks/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Logbook PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Logbook, {partial: true}),
        },
      },
    })
    logbook: Logbook,
  ): Promise<void> {
    await this.logbookRepository.updateById(id, logbook, {currentUser: this.user});
  }

  @put('/logbooks/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Logbook PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() logbook: Logbook,
  ): Promise<void> {
    await this.logbookRepository.replaceById(id, logbook, {currentUser: this.user});
  }

  @del('/logbooks/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Logbook DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.logbookRepository.deleteById(id, {currentUser: this.user});
  }
}
