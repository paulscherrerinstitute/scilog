import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {inject} from '@loopback/core';
import {Count, CountSchema, Filter, FilterExcludingWhere, repository, Where} from '@loopback/repository';
import {del, get, getModelSchemaRef, HttpErrors, oas, param, patch, post, put, requestBody, Response, RestBindings} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import _ from 'lodash';
import {EXPORT_SERVICE} from '../keys';
import {Basesnippet} from '../models';
import {BasesnippetRepository} from '../repositories';
import {JobRepository} from '../repositories/job.repository';
import {basicAuthorization} from '../services/basic.authorizor';
import {ExportService} from '../services/export-snippets.service';
import {OPERATION_SECURITY_SPEC} from '../utils/security-spec';

@authenticate('jwt')
@authorize({allowedRoles: ['customer'], voters: [basicAuthorization]})
export class BasesnippetController {

  exportDir: string = "";

  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(BasesnippetRepository)
    public basesnippetRepository: BasesnippetRepository,
    @repository(JobRepository) private jobRepository: JobRepository,
    @inject(EXPORT_SERVICE) private exportService: ExportService
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
    return this.basesnippetRepository.create(basesnippet, {currentUser: this.user});
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
    @param.path.string('exportType') exportType: string, @inject(RestBindings.Http.RESPONSE) response: Response, @param.filter(Basesnippet) filter?: Filter<Basesnippet>,
  ) {
    var createPDF: boolean;
    createPDF=(exportType=="pdf")

    let snippets = await this.basesnippetRepository.find(filter, {currentUser: this.user});
    // console.log(filter);
    let job: Object = {};
    if (snippets.length > 0) {
      if (snippets[0]?.parentId) {
        let parent = await this.basesnippetRepository.findById(snippets[0].parentId, filter, {currentUser: this.user});
        job = {
          ownerGroup: parent.ownerGroup,
          accessGroups: parent.accessGroups,
          parentId: parent.id,
          description: "export",
          params: filter
        }

      } else {
        job = {
          description: "export",
          params: filter
        }
      }
    } else {
      throw new HttpErrors.RangeNotSatisfiable;
    }

    let jobEntity = await this.jobRepository.create(job, {currentUser: this.user});
    let basePath = "/tmp/"
    var fs = require('fs');
    this.exportDir = basePath + jobEntity.id;
    if (!fs.existsSync(this.exportDir)) {
      fs.mkdirSync(this.exportDir, {recursive: true});
    }

    let src = await this.exportService.prepareLateXSourceFile(snippets, this.exportDir, this.user);
    await this.exportService.compilePDF();
    let downloadFile = "";
    if (createPDF) {
      downloadFile = this.exportDir + "/export.pdf";
    } else {
      downloadFile = await this.exportService.createZipFile();
    }

    response.download(downloadFile, (err, path = this.exportDir) => {
      console.log("file transferred successfully", err)
      var fs = require('fs');
      if (path.includes(basePath)) {
        fs.rmdirSync(path, {recursive: true});
      }
    });
    return response;
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
  ): Promise<any> {
    let index = new Promise<any>(async (resolve, reject) => {
      let snippets = await this.basesnippetRepository.find(filter, {currentUser: this.user});
      // console.log(snippets)
      resolve(snippets.findIndex((snippet) => {
        return (snippet.id == id);
      }))
    });
    return index;
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
    let textSearch = new Promise<Basesnippet[]>(async (resolve, reject) => {
      // console.log(filter)
      // console.log(filter?.skip, filter?.limit)
      let skip = typeof filter?.skip == "undefined" ? -1 : filter.skip;
      let limit = typeof filter?.limit == "undefined" ? +Infinity : filter.limit;
      let includeTags = false;
      if (filter?.fields?.hasOwnProperty('tags')) {
        let fields: any = filter?.fields;
        if (fields['tags'] == true) {
          includeTags = true;
        }
      }

      delete filter?.fields;
      delete filter?.limit;
      delete filter?.skip;

      // If we experience performance issues, the query can be split into junks of size <filter.limit>*<number_of_junks>.
      // For now it seems to be fine though...
      let snippets = await this.basesnippetRepository.find(filter, {currentUser: this.user});
      let snippetsFiltered: Basesnippet[] = [];
      let foundEntries = 0;
      for (let index = 0; index < snippets.length; index++) {
        const item: any = snippets[index];
        if ((typeof item.textcontent != 'undefined') && (item.textcontent.length > 0)) {
          let foundSubsnippetEntry = false;
          if (item.subsnippets) {
            item.subsnippets.forEach((it: any) => {
              if ((typeof it.textcontent != 'undefined') && (it.textcontent.length > 0)) {
                if (it.textcontent.toLowerCase().includes(search.toLowerCase())) {
                  foundSubsnippetEntry = true;
                } else if (includeTags) {
                  if (it.tags.some((tag: string) => {
                    if (tag.toLowerCase() == search.toLowerCase()) {
                      return true;
                    }
                  })) {
                    foundSubsnippetEntry = true;
                  }
                }
              }
            })
          }
          let foundSnippetEntry = false;
          if ((item?.textcontent.toLowerCase().includes(search.toLowerCase())) || ((includeTags) && (item.tags.some((item: string) => {
            if (item.toLowerCase() == search.toLowerCase()) {
              return true;
            }
          })))) {
            foundSnippetEntry = true;
          }
          if ((foundSnippetEntry) || (foundSubsnippetEntry)) {
            foundEntries++;
            if (foundEntries > skip) {
              snippetsFiltered.push(item);
            }
            if (foundEntries > limit + skip) {
              break;
            }
          };
        }

      }
      // console.log(snippetsFiltered)
      resolve(snippetsFiltered);
    });

    return textSearch;
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
    return this.basesnippetRepository.updateAll(basesnippet, where, {currentUser: this.user});
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
    @param.filter(Basesnippet, {exclude: 'where'}) filter?: FilterExcludingWhere<Basesnippet>
  ): Promise<Basesnippet> {
    return this.basesnippetRepository.findById(id, filter, {currentUser: this.user});
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
    if ((typeof basesnippet.deleted == 'undefined') || (basesnippet.deleted == false)) {
      let snippet = await this.basesnippetRepository.findById(id, {}, {currentUser: this.user});
      if (((typeof snippet?.expiresAt != 'undefined') && (snippet.expiresAt.getTime() < Date.now())) || (typeof snippet?.expiresAt == 'undefined')) {
        throw new HttpErrors.Forbidden('Cannot modify expired data snippet.')
      }
      if (snippet?.versionable) {
        this.addToHistory(snippet);
      }
    }
    await this.basesnippetRepository.updateById(id, basesnippet, {currentUser: this.user});
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
    await this.basesnippetRepository.replaceById(id, basesnippet, {currentUser: this.user});
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
    // Two steps:
    // 1. set snippet to 'deleted=true'
    // 2. inside websocket and after informing the clients, replace the parentId or delete the snippet
    let snippet = await this.basesnippetRepository.findById(id, {}, {currentUser: this.user});
    if (snippet?.versionable) {
      if (snippet?.parentId) {
        let parent = await this.basesnippetRepository.findById(snippet.parentId, {}, {currentUser: this.user});
        let parentHistory = await this.getHistorySnippet(parent);
        console.log("deleteById:parentHistory:",parentHistory);
      }
    }
    await this.basesnippetRepository.updateById(id, {deleted: true}, {currentUser: this.user});
  }

  @patch('/basesnippets/{id}/restore', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Basesnippet RESTORE success',
      },
    },
  })
  async restoreDeletedId(
    @param.path.string('id') id: string,
  ): Promise<void> {
    let snippet = await this.basesnippetRepository.findById(id, {}, {currentUser: this.user});
    if ((snippet?.deleted) && (snippet.parentId)) {
      let historySnippet = await this.basesnippetRepository.findById(snippet.parentId, {}, {currentUser: this.user});
      let restoredSnippet = {
        deleted: false,
        parentId: historySnippet.parentId
      };
      await this.basesnippetRepository.updateById(id, restoredSnippet, {currentUser: this.user});
    }

  }

  async setDeleted(snippet: Basesnippet) {
    let historySnippet = await this.getHistorySnippet(snippet);
    snippet.parentId = historySnippet.id;
    let deletedSnippet = {
      deleted: true,
      parentId: historySnippet.id
    };
    await this.basesnippetRepository.updateById(snippet.id, deletedSnippet, {currentUser: this.user});
  }

  async addToHistory(snippet: Basesnippet) {

    let historySnippet = await this.getHistorySnippet(snippet);
    let snippetCopy = _.omit(snippet, 'id');
    snippetCopy.parentId = historySnippet.id;
    snippetCopy = await this.basesnippetRepository.create(snippetCopy, {currentUser: this.user});
  }

  async getHistorySnippet(snippet: Basesnippet): Promise<Basesnippet> {
    let historySnippet = await this.basesnippetRepository.findOne({where: {snippetType: 'history', parentId: snippet.id}}, {currentUser: this.user});

    if (historySnippet == null) {
      let historySnippetPayload: any = _.pick(snippet, ['isPrivate', 'ownerGroup', 'accessGroups']);
      historySnippetPayload.parentId = snippet.id;
      historySnippetPayload.snippetType = 'history';
      historySnippet = await this.basesnippetRepository.create(historySnippetPayload, {currentUser: this.user});
    }
    return historySnippet;
  }
}
