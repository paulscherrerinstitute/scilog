import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {post, param, get, patch, del, requestBody} from '@loopback/rest';
import {Location} from '../models';
import {LocationRepository} from '../repositories';

import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {basicAuthorization} from '../services/basic.authorizor';
import {OPERATION_SECURITY_SPEC} from '../utils/security-spec';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {inject} from '@loopback/core';
import {getModelSchemaRef} from '../utils/misc';

@authenticate('jwt')
@authorize({
  allowedRoles: ['any-authenticated-user'],
  voters: [basicAuthorization],
})
export class LocationController {
  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(LocationRepository)
    public locationRepository: LocationRepository,
  ) {}

  @post('/locations', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Location model instance',
        content: {'application/json': {schema: getModelSchemaRef(Location)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Location, {
            title: 'NewLocation',
            exclude: ['id'],
          }),
        },
      },
    })
    location: Omit<Location, 'id'>,
  ): Promise<Location> {
    return this.locationRepository.create(location, {currentUser: this.user});
  }

  @get('/locations/count', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Location model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(@param.where(Location) where?: Where<Location>): Promise<Count> {
    return this.locationRepository.count(where, {currentUser: this.user});
  }

  @get('/locations/search={search}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of locations model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Location, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async findWithSearch(
    @param.path.string('search') search: string,
    @param.filter(Location) filter?: Filter<Location>,
  ): Promise<Location[]> {
    const snippetsFiltered = await this.locationRepository.findWithSearch(
      search,
      this.user,
      filter,
    );
    return snippetsFiltered;
  }

  @get('/locations/index={id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description:
          'Find the index (i.e position) of a location within a query.',
        content: {
          'application/json': {
            schema: {type: 'number'},
          },
        },
      },
    },
  })
  async findIndexInBuffer(
    @param.path.string('id') id: string,
    @param.filter(Location) filter?: Filter<Location>,
  ): Promise<number> {
    return this.locationRepository.findIndexInBuffer(id, this.user, filter);
  }

  @get('/locations', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of Location model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Location, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(Location) filter?: Filter<Location>,
  ): Promise<Location[]> {
    return this.locationRepository.find(filter, {currentUser: this.user});
  }

  @patch('/locations', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Location PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Location, {partial: true}),
        },
      },
    })
    location: Location,
    @param.where(Location) where?: Where<Location>,
  ): Promise<Count> {
    return this.locationRepository.updateAll(location, where, {
      currentUser: this.user,
    });
  }

  @get('/locations/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Location model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Location, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Location, {exclude: 'where'})
    filter?: FilterExcludingWhere<Location>,
  ): Promise<Location> {
    return this.locationRepository.findById(id, filter, {
      currentUser: this.user,
    });
  }

  @patch('/locations/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Location PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Location, {partial: true}),
        },
      },
    })
    location: Location,
  ): Promise<void> {
    await this.locationRepository.updateByIdWithHistory(id, location, {
      currentUser: this.user,
    });
  }

  @del('/locations/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Location DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.locationRepository.deleteByIdWithHistory(id, {
      currentUser: this.user,
    });
  }

  @patch('/locations/{id}/restore', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Locations RESTORE success',
      },
    },
  })
  async restoreDeletedId(@param.path.string('id') id: string): Promise<void> {
    this.locationRepository.restoreDeletedId(id, this.user);
  }
}
