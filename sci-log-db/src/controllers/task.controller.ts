import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {inject} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where
} from '@loopback/repository';
import {
  del, get,
  getModelSchemaRef, param,


  patch, post,




  put,

  requestBody
} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {Task} from '../models';
import {TaskRepository} from '../repositories';
import {basicAuthorization} from '../services/basic.authorizor';
import {OPERATION_SECURITY_SPEC} from '../utils/security-spec';

@authenticate('jwt')
@authorize({allowedRoles: ['customer'], voters: [basicAuthorization]})
export class TaskController {
  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(TaskRepository)
    public taskRepository: TaskRepository,
  ) { }

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
  async count(
    @param.where(Task) where?: Where<Task>,
  ): Promise<Count> {
    return this.taskRepository.count(where, {currentUser: this.user});
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
  async find(
    @param.filter(Task) filter?: Filter<Task>,
  ): Promise<Task[]> {
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
    @param.filter(Task, {exclude: 'where'}) filter?: FilterExcludingWhere<Task>
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
    await this.taskRepository.updateById(id, task, {currentUser: this.user});
  }

  @put('/task/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Task PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() task: Task,
  ): Promise<void> {
    await this.taskRepository.replaceById(id, task, {currentUser: this.user});
  }

  @del('/tasks/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Task DELETE success',
      },
    },
  })
  // async deleteById(@param.path.string('id') id: string): Promise<void> {
  //   await this.taskRepository.deleteById(id, { currentUser: this.user });
  // }
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    // Two steps:
    // 1. set snippet to 'deleted=true'
    // 2. inside websocket and after informing the clients, replace the parentId or delete the snippet
    // let snippet = await this.taskRepository.findById(id, {}, {currentUser: this.user});
    // if (snippet?.versionable) {
    //   if (snippet?.parentId) {
    //     let parent = await this.taskRepository.findById(snippet.parentId, {}, {currentUser: this.user});
    //     let parentHistory = await this.getHistorySnippet(parent);
    //     console.log(parentHistory);
    //   }
    // }
    await this.taskRepository.updateById(id, {deleted: true}, {currentUser: this.user});
  }
}
