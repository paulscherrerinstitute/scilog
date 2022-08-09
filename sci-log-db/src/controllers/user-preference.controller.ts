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
import {UserPreference} from '../models';
import {UserPreferenceRepository} from '../repositories';
import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {basicAuthorization} from '../services/basic.authorizor';
import {OPERATION_SECURITY_SPEC} from '../utils/security-spec';
@authenticate('jwt')
@authorize({allowedRoles: ['any-authenticated-user'], voters: [basicAuthorization]})

export class UserPreferenceController {
  constructor(
    @repository(UserPreferenceRepository)
    public userPreferenceRepository : UserPreferenceRepository,
  ) {}

  @post('/user-preferences', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'UserPreference model instance',
        content: {'application/json': {schema: getModelSchemaRef(UserPreference)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserPreference, {
            title: 'NewUserPreference',
            exclude: ['id'],
          }),
        },
      },
    })
    userPreference: Omit<UserPreference, 'id'>,
  ): Promise<UserPreference> {
    return this.userPreferenceRepository.create(userPreference);
  }

  @get('/user-preferences/count', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'UserPreference model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.where(UserPreference) where?: Where<UserPreference>,
  ): Promise<Count> {
    return this.userPreferenceRepository.count(where);
  }

  @get('/user-preferences', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of UserPreference model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(UserPreference, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(UserPreference) filter?: Filter<UserPreference>,
  ): Promise<UserPreference[]> {
    return this.userPreferenceRepository.find(filter);
  }

  @patch('/user-preferences', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'UserPreference PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserPreference, {partial: true}),
        },
      },
    })
    userPreference: UserPreference,
    @param.where(UserPreference) where?: Where<UserPreference>,
  ): Promise<Count> {
    return this.userPreferenceRepository.updateAll(userPreference, where);
  }

  @get('/user-preferences/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'UserPreference model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(UserPreference, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(UserPreference, {exclude: 'where'}) filter?: FilterExcludingWhere<UserPreference>
  ): Promise<UserPreference> {
    return this.userPreferenceRepository.findById(id, filter);
  }

  @patch('/user-preferences/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'UserPreference PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserPreference, {partial: true}),
        },
      },
    })
    userPreference: UserPreference,
  ): Promise<void> {
    await this.userPreferenceRepository.updateById(id, userPreference);
  }

  @put('/user-preferences/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'UserPreference PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() userPreference: UserPreference,
  ): Promise<void> {
    await this.userPreferenceRepository.replaceById(id, userPreference);
  }

  @del('/user-preferences/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'UserPreference DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.userPreferenceRepository.deleteById(id);
  }
}
