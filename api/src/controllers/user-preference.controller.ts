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
  HttpErrors,
} from '@loopback/rest';
import {UserPreference} from '../models';
import {UserPreferenceRepository} from '../repositories';
import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {basicAuthorization} from '../services/basic.authorizor';
import {OPERATION_SECURITY_SPEC} from '../utils/security-spec';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {inject} from '@loopback/core';
@authenticate('jwt')
@authorize({
  allowedRoles: ['any-authenticated-user'],
  voters: [basicAuthorization],
})
export class UserPreferenceController {
  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(UserPreferenceRepository)
    public userPreferenceRepository: UserPreferenceRepository,
  ) {}

  private get userId(): string {
    return this.user[securityId];
  }

  private async ownedOrThrow(id: string): Promise<void> {
    const owned = await this.userPreferenceRepository.findOne({
      where: {id, userId: this.userId},
    });
    if (!owned) {
      throw new HttpErrors.NotFound(
        `Entity not found: UserPreference with id "${id}"`,
      );
    }
  }

  @post('/user-preferences', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'UserPreference model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(UserPreference)},
        },
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
    userPreference.userId = this.userId;
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
    return this.userPreferenceRepository.count({
      and: [where ?? {}, {userId: this.userId}],
    });
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
              items: getModelSchemaRef(UserPreference, {
                includeRelations: true,
              }),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(UserPreference) filter?: Filter<UserPreference>,
  ): Promise<UserPreference[]> {
    return this.userPreferenceRepository.find({
      ...filter,
      where: {and: [filter?.where ?? {}, {userId: this.userId}]},
    });
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
    userPreference.userId = this.userId;
    return this.userPreferenceRepository.updateAll(userPreference, {
      and: [where ?? {}, {userId: this.userId}],
    });
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
    @param.filter(UserPreference, {exclude: 'where'})
    filter?: FilterExcludingWhere<UserPreference>,
  ): Promise<UserPreference> {
    await this.ownedOrThrow(id);
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
    await this.ownedOrThrow(id);
    userPreference.userId = this.userId;
    await this.userPreferenceRepository.updateById(id, userPreference);
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
    await this.ownedOrThrow(id);
    await this.userPreferenceRepository.deleteById(id);
  }
}
