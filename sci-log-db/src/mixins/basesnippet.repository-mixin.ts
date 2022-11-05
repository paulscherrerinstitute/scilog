import {Getter, inject, MixinTarget} from '@loopback/core';
import {
  DefaultCrudRepository,
  Entity,
  Filter,
  Options,
  repository,
} from '@loopback/repository';
import {Basesnippet} from '../models';
import {UserProfile} from '@loopback/security';
import {HttpErrors, Response} from '@loopback/rest';
import _ from 'lodash';
import {BasesnippetRepository} from '../repositories/basesnippet.repository';
import {JobRepository} from '../repositories/job.repository';
import {EXPORT_SERVICE} from '../keys';
import {ExportService} from '../services/export-snippets.service';

function UpdateAndDeleteRepositoryMixin<
  M extends Entity & {
    expiresAt: Date;
    versionable?: boolean;
    parentId?: string;
    id: string;
    deleted?: boolean;
    snippetType: string;
  },
  ID,
  Relations extends object,
  R extends MixinTarget<DefaultCrudRepository<M, ID, Relations>>
>(superClass: R) {
  class Mixed extends superClass {
    @repository.getter('BasesnippetRepository')
    readonly baseSnippetRepositoryGetter: Getter<BasesnippetRepository>;

    private async baseSnippetRepository(): Promise<BasesnippetRepository> {
      const basesnippetRepository =
        this.constructor.name === 'BasesnippetRepository'
          ? this
          : await this.baseSnippetRepositoryGetter();
      return basesnippetRepository as BasesnippetRepository;
    }

    async updateByIdWithHistory(
      id: ID,
      basesnippet: Basesnippet,
      options?: Options,
    ): Promise<void> {
      if (
        typeof basesnippet.deleted == 'undefined' ||
        basesnippet.deleted === false
      ) {
        const snippet = await this.findById(id, {}, options);
        if (
          (typeof snippet?.expiresAt != 'undefined' &&
            snippet.expiresAt.getTime() < Date.now()) ||
          typeof snippet?.expiresAt == 'undefined'
        ) {
          throw new HttpErrors.Forbidden('Cannot modify expired data snippet.');
        }
        if (snippet?.versionable) {
          await this.addToHistory(snippet, options?.currentUser);
        }
      }
        await this.updateById(id, basesnippet, options);
    }

    private async addToHistory(snippet: M, user: UserProfile): Promise<void> {
      const historySnippet = await this.getHistorySnippet(snippet, user);
      const snippetCopy = _.omit(snippet, 'id');
      snippetCopy.parentId = historySnippet.id;
      const baseSnippetRepository = await this.baseSnippetRepository();
      await baseSnippetRepository.create(snippetCopy, {currentUser: user});
    }

    private async getHistorySnippet(
      snippet: M,
      user: UserProfile,
    ): Promise<Basesnippet> {
      const baseSnippetRepository = await this.baseSnippetRepository();
      let historySnippet = await baseSnippetRepository.findOne(
        {where: {snippetType: 'history', parentId: snippet.id}},
        {currentUser: user},
      );

      if (historySnippet == null) {
        const historySnippetPayload = _.pick(snippet, [
          'isPrivate',
          'ownerGroup',
          'accessGroups',
          'readACL',
          'updateACL',
          'adminACL',
          'shareACL',
          'deleteACL',
          'createACL',
        ]);
        historySnippetPayload.parentId = snippet.id;
        historySnippetPayload.snippetType = 'history';
        historySnippet = await baseSnippetRepository.create(
          historySnippetPayload,
          {currentUser: user},
        );
      }
      return historySnippet;
    }

    async deleteByIdWithHistory(id: ID, options?: Options): Promise<void> {
      // Two steps:
      // 1. set snippet to 'deleted=true'
      // 2. inside websocket and after informing the clients, replace the parentId or delete the snippet
      const snippet = await this.findById(id, {}, options);
      if (snippet?.versionable) {
        if (snippet?.parentId) {
          const baseSnippetRepository = await this.baseSnippetRepository();
          const parent = await baseSnippetRepository.findById(
            (snippet.parentId as unknown) as ID,
            {},
            options,
          );
          const parentHistory = await this.getHistorySnippet(
            parent,
            options?.currentUser,
          );
          console.log('deleteById:parentHistory:', parentHistory);
        }
      }
      await this.updateById(id as ID, {deleted: true}, options);
    }

    async restoreDeletedId(id: ID, user: UserProfile): Promise<void> {
      const snippet = await this.findById(id, {}, {currentUser: user});
      if (snippet?.deleted && snippet.parentId) {
        const baseSnippetRepository = await this.baseSnippetRepository();
        const historySnippet = await baseSnippetRepository.findById(
          (snippet.parentId as unknown) as ID,
          {},
          {currentUser: user},
        );
        const restoredSnippet = {
          deleted: false,
          parentId: historySnippet.parentId,
        };
        await this.updateById(id, restoredSnippet, {
          currentUser: user,
        });
      }
    }
  }
  return Mixed;
}

function FindWithSearchRepositoryMixin<
  M extends Entity & {id: ID},
  ID,
  Relations extends object,
  R extends MixinTarget<DefaultCrudRepository<M, ID, Relations>>
>(superClass: R) {
  class Mixed extends superClass {
    async findWithSearch(
      search: string,
      user: UserProfile,
      filter?: Filter<M>,
    ): Promise<M[]> {
      const skip = typeof filter?.skip == 'undefined' ? -1 : filter.skip;
      const limit =
        typeof filter?.limit == 'undefined' ? +Infinity : filter.limit;
      let includeTags = false;
      // eslint-disable-next-line  no-prototype-builtins
      if (filter?.fields?.hasOwnProperty('tags')) {
        // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        const fields: any = filter?.fields;
        if (fields['tags'] === true) {
          includeTags = true;
        }
      }

      delete filter?.fields;
      delete filter?.limit;
      delete filter?.skip;

      // If we experience performance issues, the query can be split into junks of size <filter.limit>*<number_of_junks>.
      // For now it seems to be fine though...
      const snippets = await this.find(filter, {
        currentUser: user,
      });
      const snippetsFiltered: M[] = [];
      let foundEntries = 0;
      for (const s of snippets) {
        // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        const item: any = s;
        let foundSubsnippetEntry = false;
        if (item.subsnippets) {
          // eslint-disable-next-line  @typescript-eslint/no-explicit-any
          item.subsnippets.forEach((it: any) => {
            if (
              typeof it.textcontent != 'undefined' &&
              it.textcontent.length > 0
            ) {
              if (it.textcontent.toLowerCase().includes(search.toLowerCase())) {
                foundSubsnippetEntry = true;
              } else if (includeTags) {
                if (
                  it.tags.some((tag: string) => {
                    if (tag.toLowerCase() === search.toLowerCase()) {
                      return true;
                    }
                  })
                ) {
                  foundSubsnippetEntry = true;
                }
              }
            }
          });
        }
        let foundSnippetEntry = false;

        // look for search string in these fields
        const fields = ['textcontent', 'name', 'description'];
        for (const f of fields) {
          if (!item[f]) {
            continue;
          }
          if (item[f].toLowerCase().includes(search.toLowerCase())) {
            foundSnippetEntry = true;
          }
        }
        if (
          includeTags &&
          item.tags &&
          item.tags.some((_it: string) => {
            if (_it.toLowerCase() === search.toLowerCase()) {
              return true;
            }
          })
        ) {
          foundSnippetEntry = true;
        }
        if (foundSnippetEntry || foundSubsnippetEntry) {
          foundEntries++;
          if (foundEntries > skip) {
            snippetsFiltered.push(item);
          }
          if (foundEntries > limit + skip) {
            break;
          }
        }
      }

      return snippetsFiltered;
    }

    async findIndexInBuffer(
      id: ID,
      user: UserProfile,
      filter?: Filter<M>,
    ): Promise<number> {
      const snippets = await this.find(filter, {
        currentUser: user,
      });
      return snippets.findIndex((snippet: M) => snippet.id === id);
    }
  }

  return Mixed;
}

function ExportRepositoryMixin<
  M extends Entity & {
    ownerGroup: string;
    accessGroups: string[];
    parentId?: string;
    id: string;
  },
  ID,
  Relations extends object,
  R extends MixinTarget<DefaultCrudRepository<M, ID, Relations>>
>(superClass: R) {
  class Mixed extends superClass {
    exportDir: string;
    @repository.getter('JobRepository')
    readonly jobRepositoryGetter: Getter<JobRepository>;
    @inject.getter(EXPORT_SERVICE)
    readonly exportServiceGetter: Getter<ExportService>;

    async prepareExport(
      exportType: string,
      response: Response,
      user: UserProfile,
      filter?: Filter<M>,
    ): Promise<Response> {
      const createPDF = exportType === 'pdf';

      const snippets = await this.find(filter, {
        currentUser: user,
      });
      // console.log(filter);
      let job: Object = {};
      if (snippets.length > 0) {
        if (snippets[0]?.parentId) {
          const parent = await this.findById(
            (snippets[0].parentId as unknown) as ID,
            filter,
            {currentUser: user},
          );
          job = {
            ownerGroup: parent.ownerGroup,
            accessGroups: parent.accessGroups,
            parentId: parent.id,
            description: 'export',
            params: filter,
          };
        } else {
          job = {
            description: 'export',
            params: filter,
          };
        }
      } else {
        throw new HttpErrors.RangeNotSatisfiable();
      }

      const jobRepository =
        this.constructor.name === 'JobRepository'
          ? this
          : await this.jobRepositoryGetter();

      const jobEntity = await jobRepository.create(job, {
        currentUser: user,
      });
      const basePath = '/tmp/';
      const fs = require('fs');
      this.exportDir = basePath + jobEntity.id;
      if (!fs.existsSync(this.exportDir)) {
        fs.mkdirSync(this.exportDir, {recursive: true});
      }

      const exportService = await this.exportServiceGetter();
      await exportService.prepareLateXSourceFile(
        snippets,
        this.exportDir,
        user,
      );
      await exportService.compilePDF();
      let downloadFile = '';
      if (createPDF) {
        downloadFile = this.exportDir + '/export.pdf';
      } else {
        downloadFile = await exportService.createZipFile();
      }

      response.download(downloadFile, (err, path = this.exportDir) => {
        console.log('file transferred successfully', err);
        if (path.includes(basePath)) {
          fs.rmdirSync(path, {recursive: true});
        }
      });
      return response;
    }
  }
  return Mixed;
}

export function SnippetRepositoryMixin<
  M extends Entity & {
    expiresAt: Date;
    versionable?: boolean;
    parentId?: string;
    id: string;
    deleted?: boolean;
  },
  ID,
  Relations extends object,
  R extends MixinTarget<DefaultCrudRepository<M, ID, Relations>>
>(superClass: R) {
  return [
    UpdateAndDeleteRepositoryMixin,
    FindWithSearchRepositoryMixin,
    ExportRepositoryMixin,
  ].reduce(
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    (previousValue, currentValue: any) => currentValue(previousValue),
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    superClass as any,
  );
}
