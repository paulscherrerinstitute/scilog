import { Getter, inject, MixinTarget } from '@loopback/core';
import {
  DefaultCrudRepository,
  Entity,
  Filter,
  Options,
  Where,
  WhereBuilder,
  FilterBuilder,
  Inclusion,
  Condition,
  OrClause,
} from '@loopback/repository';
import { Basesnippet } from '../models';
import { UserProfile } from '@loopback/security';
import { HttpErrors, Response } from '@loopback/rest';
import _ from 'lodash';
import { EXPORT_SERVICE } from '../keys';
import { ExportService } from '../services/export-snippets.service';

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
  R extends MixinTarget<DefaultCrudRepository<M, ID, Relations>>,
>(superClass: R) {
  class Mixed extends superClass {
    readonly baseSnippetRepository: Function;

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
        await this.updateById(id, basesnippet, options);
        if (snippet?.versionable) {
          await this.addToHistory(snippet, options?.currentUser);
        }
      } else await this.updateById(id, basesnippet, options);
    }

    async authorizedCreate(snippet: any, options?: Options) {
      let user = options?.currentUser;
      if (user == undefined) {
        throw new HttpErrors.Forbidden('Cannot create new entries without user info.')
      }
      const baseSnippetRepository = await this.baseSnippetRepository();

      // no need to check if we are dealing with an admin
      let isAdmin = user.roles.find((role: string) => role == "admin");
      if (isAdmin != undefined) {
        return baseSnippetRepository.create(snippet, { currentUser: user });
      }
      let roles = [...user.roles];
      let index = roles.indexOf('any-authenticated-user');
      if (index !== -1) {
        roles.splice(index, 1);
      }
      let roleContainers = ['ownerGroup', 'accessGroups', 'readACL', 'createACL', 'updateACL', 'shareACL', 'adminACL', 'deleteACL'];
      let requiredRoles: string[] = [];
      roleContainers.forEach((roleContainer: any) => {
        if (snippet.hasOwnProperty(roleContainer)) {
          requiredRoles = requiredRoles.concat(snippet[roleContainer])
          // requiredRoles.push(snippet[roleContainer]);
        }
      });
      console.log("Required roles: ", requiredRoles)
      if (requiredRoles.length == 0) {
        throw new HttpErrors.Forbidden('Cannot create new entry without defining access roles.')
      }
      requiredRoles.forEach((requiredRole: any) => {
        if (roles.find((role: any) => role == requiredRole) == undefined) {
          throw new HttpErrors.Forbidden('Permission denied to create entry for group ' + requiredRole)
        }
      });
      return baseSnippetRepository.create(snippet, { currentUser: user });
    }

    private async addToHistory(snippet: M, user: UserProfile): Promise<void> {
      const historySnippet = await this.getHistorySnippet(snippet, user);
      const snippetCopy = _.omit(snippet, 'id');
      snippetCopy.parentId = historySnippet.id;
      snippetCopy.snippetType = 'updated';
      const baseSnippetRepository = await this.baseSnippetRepository();
      await baseSnippetRepository.create(snippetCopy, { currentUser: user });
    }

    private async getHistorySnippet(
      snippet: M,
      user: UserProfile,
    ): Promise<Basesnippet> {
      const baseSnippetRepository = await this.baseSnippetRepository();
      let historySnippet = await baseSnippetRepository.findOne(
        { where: { snippetType: 'history', parentId: snippet.id } },
        { currentUser: user },
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
          { currentUser: user },
        );
      }
      return historySnippet;
    }

    async deleteByIdWithHistory(id: ID, options?: Options): Promise<void> {
      // Two steps:
      // 1. set snippet to 'deleted=true'
      // 2. inside websocket and after informing the clients, replace the parentId or delete the snippet
      await this.updateById(id as ID, { deleted: true }, options);
      const snippet = await this.findById(id, {}, options);
      if (snippet?.versionable) {
        if (snippet?.parentId) {
          const baseSnippetRepository = await this.baseSnippetRepository();
          const parent = await baseSnippetRepository.findById(
            snippet.parentId as unknown as ID,
            {},
            options,
          );
          const parentHistory = await this.getHistorySnippet(
            parent,
            options?.currentUser,
          );
          console.log('deleteById:parentHistory:', parentHistory);
          await this.updateById(
            id as ID,
            { parentId: parentHistory.id },
            options,
          );
        }
      } else {
        await this.deleteById(id as ID, options);
      }
    }

    async restoreDeletedId(id: ID, user: UserProfile): Promise<void> {
      const snippet = await this.findById(id, {}, { currentUser: user });
      if (snippet?.deleted && snippet.parentId) {
        const baseSnippetRepository = await this.baseSnippetRepository();
        const historySnippet = await baseSnippetRepository.findById(
          snippet.parentId as unknown as ID,
          {},
          { currentUser: user },
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
  M extends Entity & { id: ID; tags?: string[] },
  ID,
  Relations extends { subsnippets: M },
  R extends MixinTarget<DefaultCrudRepository<M, ID, Relations>>,
>(superClass: R) {
  class Mixed extends superClass {
    async findWithSearch(
      search: string,
      user: UserProfile,
      filter?: Filter<M>,
    ): Promise<M[]> {
      const includeTags =
        (filter?.fields as { [P in keyof M]: boolean })?.tags ?? false;

      delete filter?.fields;
      const searchRegex = { regexp: new RegExp(`.*?${search}.*?`, 'i') };
      const commonSearchableFields = {
        textcontent: {
          regexp: new RegExp(
            `(?<=<p>)((?!&).)*${search}((?!&).)*(?=<\/p>)`,
            'i',
          ),
        },
        tags: searchRegex,
        readACL: searchRegex,
      } as Condition<M>;

      const withSubsnippets = await this._searchForSubsnippets(
        filter,
        commonSearchableFields,
        includeTags,
        user,
      );

      const logbookSearchableFields = {
        ...commonSearchableFields,
        name: searchRegex,
        description: searchRegex,
        id: { inq: withSubsnippets.map(s => s.id) },
      };
      const snippets = await this._searchForSnippets(
        filter,
        logbookSearchableFields,
        includeTags,
        user,
      );
      return snippets;
    }

    private async _searchForSnippets(
      filter: Filter<M> | undefined,
      logbookSearchableFields: Condition<M>,
      includeTags: boolean,
      user: UserProfile,
    ) {
      const ors = this._searchConditionBuilder(
        logbookSearchableFields,
        includeTags,
      );

      filter = this._addSearchCondition(filter, ors);

      const snippets = await this.find(filter, {
        currentUser: user,
      });
      return snippets;
    }

    private async _searchForSubsnippets(
      filter: Filter<M> | undefined,
      commonSearchableFields: Condition<M>,
      includeTags: boolean,
      user: UserProfile,
    ) {
      const subsnippetsIncludeIndex = (filter?.include ?? []).findIndex(
        include =>
          (include as Inclusion).relation === 'subsnippets' ||
          include === 'subsnippets',
      ) as number;

      let withSubsnippets: (M & Relations)[] = [];
      if (filter?.include && subsnippetsIncludeIndex !== -1) {
        const includeOrs = this._searchConditionBuilder(
          commonSearchableFields,
          includeTags,
        );
        const includeFilter = this._addSearchCondition(
          (filter.include[subsnippetsIncludeIndex] as Inclusion)
            .scope as Filter<M>,
          includeOrs,
        );

        const filterCopy = JSON.parse(JSON.stringify(filter));
        if (filterCopy.include[subsnippetsIncludeIndex] === 'subsnippets')
          filterCopy.include[subsnippetsIncludeIndex] = {
            relation: 'subsnippets',
          };
        (filterCopy.include[subsnippetsIncludeIndex] as Inclusion).scope =
          includeFilter;
        withSubsnippets = await this.find(
          { ...filterCopy, fields: ['id'] },
          {
            currentUser: user,
          },
        );
      }
      return withSubsnippets.filter(s => s.subsnippets);
    }

    private _addSearchCondition(
      filter: Filter<M> | undefined,
      includeOrs: OrClause<M>,
    ) {
      const searchCondition = new WhereBuilder(filter?.where)
        .and(includeOrs)
        .build();
      return new FilterBuilder(filter).where(searchCondition).build();
    }

    private _searchConditionBuilder(
      commonSearchableFields: Condition<M>,
      includeTags: boolean,
    ) {
      return {
        or: Object.entries(commonSearchableFields).flatMap(([k, v]) => {
          if (!includeTags && k === 'tags') return [] as Where<M>;
          return { [k]: v } as Where<M>;
        }),
      };
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
  R extends MixinTarget<DefaultCrudRepository<M, ID, Relations>>,
>(superClass: R) {
  class Mixed extends superClass {
    exportDir: string;
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
            snippets[0].parentId as unknown as ID,
            filter,
            { currentUser: user },
          );
          job = {
            ownerGroup: parent.ownerGroup,
            accessGroups: parent.accessGroups,
            parentId: parent.id,
            description: 'export',
            params: filter,
            snippetType: 'job',
          };
        } else {
          job = {
            description: 'export',
            params: filter,
            snippetType: 'job',
          };
        }
      } else {
        throw new HttpErrors.RangeNotSatisfiable();
      }

      const jobEntity = await this.create(job, {
        currentUser: user,
      });
      const basePath = '/tmp/';
      const fs = require('fs');
      this.exportDir = basePath + jobEntity.id;
      if (!fs.existsSync(this.exportDir)) {
        fs.mkdirSync(this.exportDir, { recursive: true });
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
          fs.rmdirSync(path, { recursive: true });
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
  R extends MixinTarget<DefaultCrudRepository<M, ID, Relations>>,
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
