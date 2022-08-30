import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {inject} from '@loopback/core';
import {Count, CountSchema, Filter, FilterExcludingWhere, repository, Where} from '@loopback/repository';
import {del, get, getModelSchemaRef, param, patch, post, put, requestBody} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {ACL} from '../models';
import {ACLRepository} from '../repositories';
import {basicAuthorization} from '../services/basic.authorizor';
import {OPERATION_SECURITY_SPEC} from '../utils/security-spec';

@authenticate('jwt')
@authorize({allowedRoles: ['any-authenticated-user'], voters: [basicAuthorization]})
export class ACLController {
  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(ACLRepository)
    public aclRepository: ACLRepository,
  ) {}

  @post('/acls', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'ACL model instance',
        content: {'application/json': {schema: getModelSchemaRef(ACL)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ACL, {
            title: 'NewACL',
            exclude: ['id'],
          }),
        },
      },
    })
    acl: Omit<ACL, 'id'>,
  ): Promise<ACL> {
    return this.aclRepository.create(acl,{currentUser: this.user});
  }

  @get('/acls/count', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'ACL model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.where(ACL) where?: Where<ACL>,
  ): Promise<Count> {
    return this.aclRepository.count(where, {currentUser: this.user});
  }

  @get('/acls', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of ACL model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(ACL, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(ACL) filter?: Filter<ACL>,
  ): Promise<ACL[]> {
    return this.aclRepository.find(filter, {currentUser: this.user});
  }

  @patch('/acls', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'ACL PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ACL, {partial: true}),
        },
      },
    })
    acl: ACL,
    @param.where(ACL) where?: Where<ACL>,
  ): Promise<Count> {
    return this.aclRepository.updateAll(acl, where, {currentUser: this.user});
  }

  @get('/acls/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'ACL model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(ACL, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(ACL, {exclude: 'where'}) filter?: FilterExcludingWhere<ACL>
  ): Promise<ACL> {
    return this.aclRepository.findById(id, filter, {currentUser: this.user});
  }

  @patch('/acls/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'ACL PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ACL, {partial: true}),
        },
      },
    })
    acl: ACL,
  ): Promise<void> {
    await this.aclRepository.updateById(id, acl, {currentUser: this.user});
  }

  @put('/acls/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'ACL PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() acl: ACL,
  ): Promise<void> {
    await this.aclRepository.replaceById(id, acl, {currentUser: this.user});
  }

  @del('/acls/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'ACL DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.aclRepository.deleteById(id, {currentUser: this.user});
  }
}
