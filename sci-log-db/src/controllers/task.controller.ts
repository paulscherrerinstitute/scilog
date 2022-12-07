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
import {del, get, param, patch, post, requestBody} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {Task} from '../models';
import {BasesnippetRepository, TaskRepository} from '../repositories';
import {basicAuthorization} from '../services/basic.authorizor';
import {getModelSchemaRef} from '../utils/misc';
import {OPERATION_SECURITY_SPEC} from '../utils/security-spec';
import {BasesnippetController} from './basesnippet.controller';

@authenticate('jwt')
@authorize({
  allowedRoles: ['any-authenticated-user'],
  voters: [basicAuthorization],
})
export class TaskController {
  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(TaskRepository)
    public taskRepository: TaskRepository,
    @repository(BasesnippetRepository)
    public basesnippetRepository: BasesnippetRepository,
    @inject('controllers.BasesnippetController')
    public basesnippetController: BasesnippetController,
  ) {}

  @post('/tasks', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Task model instance',
        content: {'application/json': {schema: getModelSchemaRef(Task)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Task, {
            title: 'NewTask',
            exclude: ['id'],
          }),
        },
      },
    })
    task: Omit<Task, 'id'>,
  ): Promise<Task> {
    return this.taskRepository.create(task, {currentUser: this.user});
  }

  @get('/tasks/count', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Task model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(@param.where(Task) where?: Where<Task>): Promise<Count> {
    return this.taskRepository.count(where, {currentUser: this.user});
  }

  @get('/tasks/search={search}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of tasks model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Task, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async findWithSearch(
    @param.path.string('search') search: string,
    @param.filter(Task) filter?: Filter<Task>,
  ): Promise<Task[]> {
    const snippetsFiltered = await this.taskRepository.findWithSearch(
      search,
      this.user,
      filter,
    );
    return snippetsFiltered;
  }

  @get('/tasks/index={id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Find the index (i.e position) of a task within a query.',
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
    @param.filter(Task) filter?: Filter<Task>,
  ): Promise<number> {
    return this.taskRepository.findIndexInBuffer(id, this.user, filter);
  }

  @get('/tasks', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of Task model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Task, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(@param.filter(Task) filter?: Filter<Task>): Promise<Task[]> {
    return this.taskRepository.find(filter, {currentUser: this.user});
  }

  @patch('/tasks', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Task PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Task, {partial: true}),
        },
      },
    })
    task: Task,
    @param.where(Task) where?: Where<Task>,
  ): Promise<Count> {
    return this.taskRepository.updateAll(task, where, {currentUser: this.user});
  }

  @get('/tasks/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Task model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Task, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Task, {exclude: 'where'}) filter?: FilterExcludingWhere<Task>,
  ): Promise<Task> {
    return this.taskRepository.findById(id, filter, {currentUser: this.user});
  }

  @patch('/tasks/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Task PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Task, {partial: true}),
        },
      },
    })
    task: Task,
  ): Promise<void> {
    await this.taskRepository.updateByIdWithHistory(id, task, {
      currentUser: this.user,
    });
  }

  @del('/tasks/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Task DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.basesnippetRepository.deleteByIdWithHistory(id, {
      currentUser: this.user,
    });
  }

  @patch('/tasks/{id}/restore', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Tasks RESTORE success',
      },
    },
  })
  async restoreDeletedId(@param.path.string('id') id: string): Promise<void> {
    this.taskRepository.restoreDeletedId(id, this.user);
  }
}
