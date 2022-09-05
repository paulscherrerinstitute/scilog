import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {inject} from '@loopback/core';
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
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
  Response,
  RestBindings,
} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {Basesnippet} from '../models';
import {BasesnippetRepository} from '../repositories';
import {basicAuthorization} from '../services/basic.authorizor';
import {OPERATION_SECURITY_SPEC} from '../utils/security-spec';

@authenticate('jwt')
@authorize({
  allowedRoles: ['any-authenticated-user'],
  voters: [basicAuthorization],
})
export class BasesnippetController {
  exportDir = '';

  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(BasesnippetRepository)
    public basesnippetRepository: BasesnippetRepository,
  ) {}

  @post('/basesnippets', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Basesnippet model instance',
        content: {'application/json': {schema: getModelSchemaRef(Basesnippet)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Basesnippet, {
            title: 'NewBasesnippet',
            exclude: ['id'],
          }),
        },
      },
    })
    basesnippet: Omit<Basesnippet, 'id'>,
  ): Promise<Basesnippet> {
    return this.basesnippetRepository.create(basesnippet, {
      currentUser: this.user,
    });
  }

  @get('/basesnippets/count', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Basesnippet model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.where(Basesnippet) where?: Where<Basesnippet>,
  ): Promise<Count> {
    return this.basesnippetRepository.count(where, {currentUser: this.user});
  }

  @get('/basesnippets', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of Basesnippet model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Basesnippet, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(Basesnippet) filter?: Filter<Basesnippet>,
  ): Promise<Basesnippet[]> {
    return this.basesnippetRepository.find(filter, {currentUser: this.user});
  }

  @get('/basesnippets/export={exportType}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of Basesnippet model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Basesnippet, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  // @oas.response.file()
  async prepareExport(
    @param.path.string('exportType') exportType: string,
    @inject(RestBindings.Http.RESPONSE) response: Response,
    @param.filter(Basesnippet) filter?: Filter<Basesnippet>,
  ) {
    const responseAfterCreate = await this.basesnippetRepository.prepareExport(
      exportType,
      response,
      this.user,
      filter,
    );
    return responseAfterCreate;
  }

  @get('/basesnippets/index={id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Basesnippet model instance',
        content: {
          'application/json': {
            type: 'any',
            schema: getModelSchemaRef(Basesnippet, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findIndexInBuffer(
    @param.path.string('id') id: string,
    @param.filter(Basesnippet) filter?: Filter<Basesnippet>,
  ): Promise<number> {
    return this.basesnippetRepository.findIndexInBuffer(id, this.user, filter);
  }

  @get('/basesnippets/search={search}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of Basesnippet model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Basesnippet, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async findWithSearch(
    @param.path.string('search') search: string,
    @param.filter(Basesnippet) filter?: Filter<Basesnippet>,
  ): Promise<Basesnippet[]> {
    const snippetsFiltered = await this.basesnippetRepository.findWithSearch(
      search,
      this.user,
      filter,
    );
    return snippetsFiltered;
  }

  @patch('/basesnippets', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Basesnippet PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Basesnippet, {partial: true}),
        },
      },
    })
    basesnippet: Basesnippet,
    @param.where(Basesnippet) where?: Where<Basesnippet>,
  ): Promise<Count> {
    return this.basesnippetRepository.updateAll(basesnippet, where, {
      currentUser: this.user,
    });
  }

  @get('/basesnippets/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Basesnippet model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Basesnippet, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Basesnippet, {exclude: 'where'})
    filter?: FilterExcludingWhere<Basesnippet>,
  ): Promise<Basesnippet> {
    return this.basesnippetRepository.findById(id, filter, { currentUser: this.user }).then((sn) => {
      sn.calculatedACLs=""
      if ((this.user.roles.filter((element: string) => sn.updateACL.includes(element))).length > 0) {
        sn.calculatedACLs += "U"
      }
      if ((this.user.roles.filter((element: string) => sn.deleteACL.includes(element))).length > 0) {
        sn.calculatedACLs += "D"
      }
      if ((this.user.roles.filter((element: string) => sn.shareACL.includes(element))).length > 0) {
        sn.calculatedACLs += "S"
      }
      if ((this.user.roles.filter((element: string) => sn.adminACL.includes(element))).length > 0) {
        sn.calculatedACLs += "A"
      }
      return sn
    }
    );
  }

  @patch('/basesnippets/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Basesnippet PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Basesnippet, {partial: true}),
        },
      },
    })
    basesnippet: Basesnippet,
  ): Promise<void> {
    await this.basesnippetRepository.updateByIdWithHistory(id, basesnippet, {
      currentUser: this.user,
    });
  }

  @put('/basesnippets/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Basesnippet PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() basesnippet: Basesnippet,
  ): Promise<void> {
    await this.basesnippetRepository.replaceById(id, basesnippet, {
      currentUser: this.user,
    });
  }

  @del('/basesnippets/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Basesnippet DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.basesnippetRepository.deleteByIdWithHistory(id, {
      currentUser: this.user,
    });
  }

  @patch('/basesnippets/{id}/restore', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Basesnippet RESTORE success',
      },
    },
  })
  async restoreDeletedId(@param.path.string('id') id: string): Promise<void> {
    this.basesnippetRepository.restoreDeletedId(id, this.user);
  }
}
