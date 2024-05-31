import {Getter, inject, MixinTarget} from '@loopback/core';
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
  InclusionFilter,
} from '@loopback/repository';
import {Basesnippet, Logbook, Paragraph} from '../models';
import {UserProfile} from '@loopback/security';
import {HttpErrors, Response} from '@loopback/rest';
import _ from 'lodash';
import {EXPORT_SERVICE} from '../keys';
import {ExportService} from '../services/export-snippets.service';
import {
  arrayOfUniqueFrom,
  concatOwnerAccessGroups,
  filterEmptySubsnippets,
  removeDeepBy,
  standardiseIncludes,
} from '../utils/misc';
import {AutoAddRepository} from '../repositories/autoadd.repository.base';
const fs = require('fs');

type ExpandedBasesnippet = Basesnippet & {
  ownerGroup: string;
  accessGroups: string[];
};

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

    get baseACLS() {
      const self = this as unknown as AutoAddRepository<M, ID, Relations>;
      return self.acls;
    }

    get expandedACLS() {
      return [...this.baseACLS, 'ownerGroup', 'accessGroups'] as const;
    }

    async updateByIdWithHistory(
      id: ID,
      basesnippet: ExpandedBasesnippet,
      options?: Options,
      checkExpiration = true,
    ): Promise<void> {
      const baseSnippetRepository = await this.baseSnippetRepository();
      const snippet = await baseSnippetRepository.findById(id, {}, options);
      const patches = await this.applyFromOwnerAccessAndGetChanged(
        basesnippet,
        snippet,
      );
      if (Object.keys(patches).length === 0) return;
      if (!basesnippet.deleted) {
        if (
          checkExpiration &&
          !this.isSharing(patches) &&
          (snippet.expiresAt?.getTime() < Date.now() || !snippet?.expiresAt)
        ) {
          throw new HttpErrors.Forbidden('Cannot modify expired data snippet.');
        }
        await baseSnippetRepository.updateById(id, patches, options);
        if (snippet?.versionable) {
          await this.addToHistory(snippet, options?.currentUser);
        }
        if (this.isSharing(patches))
          await this.applyACLSToChildren(
            {
              ...patches,
              id: snippet.id,
              snippetType: snippet.snippetType,
            } as Basesnippet,
            options?.currentUser,
          );
      } else await baseSnippetRepository.updateById(id, patches, options);
    }

    private async applyACLSToChildren(
      basesnippet: Basesnippet,
      user: UserProfile,
    ) {
      if (
        !basesnippet ||
        basesnippet?.snippetType === 'location' ||
        !basesnippet.id
      )
        return;
      const currentUser = {currentUser: user};
      const baseSnippetRepository = await this.baseSnippetRepository();
      const children = await baseSnippetRepository.find(
        {where: {parentId: basesnippet.id, snippetType: 'paragraph'}},
        currentUser,
      );
      for (const child of children) {
        await this.applyACLSToChild(basesnippet, child, currentUser);
      }
    }

    private async applyACLSToChild(
      basesnippet: Basesnippet,
      child: Basesnippet,
      currentUser: {currentUser: UserProfile},
    ) {
      const updateAcls = this.baseACLS.reduce((currentValue, previousValue) => {
        if (basesnippet[previousValue])
          currentValue[previousValue] = arrayOfUniqueFrom(
            basesnippet[previousValue],
            child[previousValue],
          );
        return currentValue;
      }, {} as ExpandedBasesnippet);
      await this.updateByIdWithHistory(child.id as ID, updateAcls, currentUser);
    }

    private async applyFromOwnerAccessAndGetChanged(
      basesnippet: ExpandedBasesnippet,
      snippet: M & Relations,
    ) {
      const self = this as unknown as AutoAddRepository<M, ID, Relations>;
      const merge: typeof basesnippet = {
        ..._.omit(snippet, this.expandedACLS),
        ...basesnippet,
      };
      concatOwnerAccessGroups(merge);
      if (
        ['ownerGroup', 'accessGroups'].some(
          acl => basesnippet[acl as keyof typeof basesnippet],
        )
      )
        await self['aclDefaultOnCreation'](merge);
      return this.getChanged(merge, snippet);
    }

    private getChanged(merge: ExpandedBasesnippet, snippet: M & Relations) {
      return _.pickBy(
        merge,
        (v, k: keyof M) => JSON.stringify(snippet[k]) !== JSON.stringify(v),
      );
    }

    private isSharing(patches: Partial<Basesnippet>) {
      if (Object.keys(patches).length === 0) return false;
      return Object.keys(patches).every(d =>
        this.expandedACLS.includes(d as typeof this.expandedACLS[number]),
      );
    }

    private async addToHistory(snippet: M, user: UserProfile): Promise<void> {
      const historySnippet = await this.getHistorySnippet(snippet, user);
      const snippetCopy = _.omit(snippet, 'id');
      snippetCopy.parentId = historySnippet.id;
      snippetCopy.snippetType = 'updated';
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
      await this.updateById(id as ID, {deleted: true}, options);
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
            {parentId: parentHistory.id},
            options,
          );
        }
      } else {
        await this.deleteById(id as ID, options);
      }
    }

    async restoreDeletedId(id: ID, user: UserProfile): Promise<void> {
      const snippet = await this.findById(id, {}, {currentUser: user});
      if (snippet?.deleted && snippet.parentId) {
        const baseSnippetRepository = await this.baseSnippetRepository();
        const historySnippet = await baseSnippetRepository.findById(
          snippet.parentId as unknown as ID,
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
  M extends Entity & {id: ID; tags?: string[]},
  ID,
  Relations extends {subsnippets: M},
  R extends MixinTarget<DefaultCrudRepository<M, ID, Relations>>,
>(superClass: R) {
  type DeepBy = keyof M;
  class Mixed extends superClass {
    user: UserProfile;
    private _deepBy: DeepBy[] = [];
    private _filter: Filter<M>;
    private _searchCondition: Condition<M>;
    private _deepCondition: Where<M>;

    private extractDeepCondition(where: Where<M> | undefined) {
      if (!where) return;
      this._deepCondition = JSON.parse(JSON.stringify(where));
      removeDeepBy(
        this._deepCondition,
        (key: string) =>
          ![
            ...this._deepBy,
            ...Object.getOwnPropertyNames(WhereBuilder.prototype),
          ].includes(key),
      );
    }

    async recursivelyApplySearchCondition(
      filter: Filter<M> | undefined,
      snippets: {[id: string]: Basesnippet} = {},
      depth = 1,
    ) {
      const whereCopy = JSON.parse(JSON.stringify(filter?.where ?? {}));
      this.enrichFilter(filter);
      const snippet = await this.find(this._filter, {currentUser: this.user});
      this.removeEmptySubsnippets(snippet, depth, snippets);
      this.resetWhere(filter, whereCopy);
      if (!filter?.include || filter.include.length === 0) return snippets;
      for (const relation of filter?.include as Inclusion[]) {
        relation.scope = relation.scope ?? {};
        await this.recursivelyApplySearchCondition(
          relation.scope as Filter<M>,
          snippets,
          depth + 1,
        );
      }
    }

    private enrichFilter(filter: Filter<M> | undefined) {
      this.addSearchToFilter(filter);
      this.addDeepToFilter(filter);
    }

    private removeEmptySubsnippets(
      snippet: (M & Relations)[],
      depth: number,
      snippets: {[id: string]: Basesnippet},
    ) {
      const fakeFirstLevel = {subsnippets: snippet} as unknown as Basesnippet;
      filterEmptySubsnippets(fakeFirstLevel, depth);
      fakeFirstLevel.subsnippets?.map(snip => {
        if (!_.has(snippets, snip.id)) snippets[snip.id] = snip;
      });
    }

    private resetWhere(filter: Filter<M> | undefined, whereCopy: Where<M>) {
      if (filter) {
        filter.where = whereCopy;
        this.extractDeepCondition(filter.where);
        removeDeepBy(filter.where as Where<M>, (key: DeepBy) =>
          this._deepBy.includes(key),
        );
      }
    }

    async findWithSearch(
      search: string,
      user: UserProfile,
      filter: Filter<M> = {},
      deepBy: DeepBy[] = [],
    ): Promise<Basesnippet[]> {
      this.init(filter, search, user, deepBy);
      const snippets: {[id: string]: Basesnippet} = {};
      await this.recursivelyApplySearchCondition(filter, snippets);
      const desc = filter.order?.[0] === 'defaultOrder DESC';
      return Object.values(snippets).sort((first, second) =>
        desc
          ? second.defaultOrder - first.defaultOrder
          : first.defaultOrder - second.defaultOrder,
      );
    }

    private init(
      filter: Filter<M>,
      search: string,
      user: UserProfile,
      deepBy: (keyof M)[],
    ) {
      delete filter?.fields;
      standardiseIncludes(filter);
      this._filter = filter;
      this._searchCondition = this.buildSearchCondition(search);
      this.user = user;
      this._deepBy = deepBy;
    }

    private addSearchToFilter(filter: Filter<M> | undefined) {
      this._addCondition(filter, this._searchCondition);
    }

    private addDeepToFilter(filter: Filter<M> | undefined) {
      this._addCondition(filter, this._deepCondition);
    }

    private _addCondition(
      filter: Filter<M> | undefined,
      additionalWhere: Where<M>,
    ) {
      if (_.isEmpty(additionalWhere)) return;
      let additionalCondition = additionalWhere;
      if (filter?.where)
        additionalCondition = {and: [additionalWhere, filter.where]};
      return new FilterBuilder(filter).where(additionalCondition).build();
    }

    private buildSearchCondition(search: string) {
      if (!search || encodeURIComponent(search) === '%00') return {};
      const searchRegex = {regexp: new RegExp(`.*${search}.*`, 'i')};
      return {
        or: [
          {name: searchRegex},
          {description: searchRegex},
          {htmlTextcontent: searchRegex},
        ],
      } as Condition<M>;
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
    @inject.getter(EXPORT_SERVICE)
    readonly exportServiceGetter: Getter<ExportService>;

    private exportFile = 'export.pdf';
    private basePath = '/tmp/';

    async prepareExport(
      exportType: string,
      response: Response,
      user: UserProfile,
      filter?: Filter<M>,
    ): Promise<Response> {
      this.excludeHistorySnippets(filter);
      const snippets = await this.find(filter, {
        currentUser: user,
      });
      const parentName = await this.getParentName(filter, snippets, user);
      const jobEntity = await this.createExportJob(snippets, filter, user);
      const {exportFile, exportDir} = this.createPathsFromJob(jobEntity);
      const exportService = await this.exportServiceGetter();
      const outFile = await exportService.exportToPdf(
        snippets as unknown as Paragraph[],
        {exportFile, exportDir},
        _.pick(response?.req?.headers, 'authorization'),
        parentName,
      );
      response.download(outFile, (err, path = exportDir) => {
        console.log('file transferred successfully', err);
        if (path.includes(this.basePath)) {
          fs.rmSync(path, {recursive: true});
        }
      });
      return response;
    }

    private excludeHistorySnippets(filter: Filter<M> | undefined) {
      filter?.include?.map((i: InclusionFilter) => {
        if (i === 'subsnippets') i = {relation: 'subsnippets'};
        i = i as Inclusion;
        if (i.relation === 'subsnippets') {
          i.relation = 'subsnippets';
          const sub = {snippetType: {nin: ['history', 'updated']}};
          if (!i.scope) i.scope = {where: sub};
          else if (i.scope.where) i.scope.where = {and: [i.scope.where, sub]};
          else i.scope.where = sub;
        }
      });
    }

    private async getParentName(
      filter: Filter<M> | undefined,
      snippets: (M & Relations)[],
      user: UserProfile,
    ) {
      if (!JSON.stringify(filter ?? '').includes('parentId')) return;
      const parentSnippet = await this.findById(
        snippets[0].parentId as ID,
        undefined,
        {currentUser: user},
      );
      return (parentSnippet as unknown as Logbook)?.name;
    }

    private async createExportJob(
      snippets: (M & Relations)[],
      filter: Filter<M> | undefined,
      user: UserProfile,
    ) {
      let job: Object = {};
      if (snippets.length > 0) {
        if (snippets[0]?.parentId) {
          const parent = await this.findById(
            snippets[0].parentId as unknown as ID,
            filter,
            {currentUser: user},
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
      return jobEntity;
    }

    private createPathsFromJob(jobEntity: M) {
      const exportDir = this.basePath + jobEntity.id;
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, {recursive: true});
      }
      const exportFile = `${exportDir}/${this.exportFile}`;
      return {exportFile, exportDir};
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
