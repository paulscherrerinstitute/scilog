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
import {View} from '../models';
import {ViewRepository} from '../repositories';

export class ViewController {
  constructor(
    @repository(ViewRepository)
    public viewRepository: ViewRepository,
  ) {}

  @post('/views', {
    responses: {
      '200': {
        description: 'View model instance',
        content: {'application/json': {schema: getModelSchemaRef(View)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(View, {
            title: 'NewView',
            exclude: ['id'],
          }),
        },
      },
    })
    view: Omit<View, 'id'>,
  ): Promise<View> {
    return this.viewRepository.create(view);
  }

  @get('/views/count', {
    responses: {
      '200': {
        description: 'View model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(@param.where(View) where?: Where<View>): Promise<Count> {
    return this.viewRepository.count(where);
  }

  @get('/views', {
    responses: {
      '200': {
        description: 'Array of View model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(View, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(@param.filter(View) filter?: Filter<View>): Promise<View[]> {
    return this.viewRepository.find(filter);
  }

  @patch('/views', {
    responses: {
      '200': {
        description: 'View PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(View, {partial: true}),
        },
      },
    })
    view: View,
    @param.where(View) where?: Where<View>,
  ): Promise<Count> {
    return this.viewRepository.updateAll(view, where);
  }

  @get('/views/{id}', {
    responses: {
      '200': {
        description: 'View model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(View, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(View, {exclude: 'where'}) filter?: FilterExcludingWhere<View>,
  ): Promise<View> {
    return this.viewRepository.findById(id, filter);
  }

  @patch('/views/{id}', {
    responses: {
      '204': {
        description: 'View PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(View, {partial: true}),
        },
      },
    })
    view: View,
  ): Promise<void> {
    await this.viewRepository.updateById(id, view);
  }

  @put('/views/{id}', {
    responses: {
      '204': {
        description: 'View PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() view: View,
  ): Promise<void> {
    await this.viewRepository.replaceById(id, view);
  }

  @del('/views/{id}', {
    responses: {
      '204': {
        description: 'View DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.viewRepository.deleteById(id);
  }
}
