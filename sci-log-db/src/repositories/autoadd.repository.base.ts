import {UserRepository} from '@loopback/authentication-jwt';
import {Getter} from '@loopback/core';
import {
  AndClause,
  BelongsToAccessor,
  Condition,
  DefaultCrudRepository,
  Entity,
  HasManyRepositoryFactory,
  juggler,
  Model,
  repository,
  Where,
} from '@loopback/repository';
import {Location, Logbook, User} from '../models';
import {Basesnippet} from '../models/basesnippet.model';
import {arrayOfUniqueFrom, defaultSequentially} from '../utils/misc';
import {BasesnippetRepository} from './basesnippet.repository';
import _ from 'lodash';
import {HttpErrors} from '@loopback/rest';

export class AutoAddRepository<
  T extends Entity,
  ID,
  Relations extends object = {},
> extends DefaultCrudRepository<T, ID, Relations> {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  public readonly parent: BelongsToAccessor<Entity, any>;

  public readonly subsnippets: HasManyRepositoryFactory<T, string>;

  readonly acls = [
    'createACL',
    'readACL',
    'shareACL',
    'updateACL',
    'deleteACL',
    'adminACL',
  ] as const;

  @repository('UserRepository')
  readonly userRepository: UserRepository;
  @repository.getter('BasesnippetRepository')
  readonly baseSnippetRepositoryGetter: Getter<BasesnippetRepository>;

  private async baseSnippetRepository(): Promise<BasesnippetRepository> {
    const basesnippetRepository =
      this.constructor.name === 'BasesnippetRepository'
        ? this
        : await this.baseSnippetRepositoryGetter();
    return basesnippetRepository as BasesnippetRepository;
  }

  constructor(
    entityClass: typeof Entity & {
      prototype: T;
    },
    dataSource: juggler.DataSource,
  ) {
    super(entityClass, dataSource);
    this.subsnippets = this.createHasManyRepositoryFactoryFor(
      'subsnippets',
      Getter.fromValue(this),
    );

    this.parent = this.createBelongsToAccessorFor(
      'parent',
      Getter.fromValue(this),
    );

    // add these lines to register inclusion resolver.
    this.registerInclusionResolver(
      'subsnippets',
      this.subsnippets.inclusionResolver,
    );
    this.registerInclusionResolver('parent', this.parent.inclusionResolver);
  }

  private async aclDefaultOnCreation(
    data: (Basesnippet | Logbook) & {
      ownerGroup?: string;
      accessGroups?: string[];
    },
  ) {
    const emptyAcls = this.acls.filter(acl => !data[acl as keyof Basesnippet]);
    if (emptyAcls) {
      const parent = await this.getParent(data);
      if (data.snippetType === 'location')
        await this.addToACLIfNotEmpty(
          emptyAcls,
          data,
          this.defaultLocationACL.bind(this),
        );
      else if (data.snippetType === 'logbook') {
        const users = await this.getUnxGroupsEmail(
          (parent as Location).location ?? '',
        );
        await this.addToACLIfNotEmpty(
          emptyAcls,
          data,
          _.partial(this.defaultLogbookACL.bind(this), users),
        );
      } else
        await this.addToACLIfNotEmpty(
          emptyAcls,
          data,
          _.partial(this.defaultAllButLocationLogbookACL.bind(this), parent),
        );
    }
    delete data.ownerGroup;
    delete data.accessGroups;
  }

  private async addToACLIfNotEmpty(
    emptyAcls: string[],
    data: (Basesnippet | Logbook) & {ownerGroup?: string | undefined},
    callableFunction: Function,
  ) {
    await Promise.all(
      emptyAcls.map(async k => {
        const aclValue = defaultSequentially(
          await callableFunction(k, data),
          [],
        ) as string[];
        if (aclValue.length > 0)
          (data[k as keyof Basesnippet] as string[]) = aclValue;
      }),
    );
  }

  private async getParent(
    data: (Basesnippet | Logbook) & {
      ownerGroup?: string | undefined;
      accessGroups?: string[];
    },
  ) {
    const parentId =
      data.snippetType !== 'location'
        ? (data as Logbook).location ?? data.parentId
        : false;
    let parentACL = {} as Basesnippet;
    if (parentId) {
      const baseSnippetRepository = await this.baseSnippetRepository();
      try {
        parentACL = (await baseSnippetRepository.findById(
          parentId as unknown as ID,
          {},
          {currentUser: {roles: ['admin']}},
        )) as unknown as Basesnippet | Logbook;
      } catch {
        console.warn(
          `Cannot find snippet with ID from parentId or location: ${parentId}`,
        );
      }
    }
    return parentACL;
  }

  private async defaultLocationACL(aclType: string, data: Location) {
    if (aclType === 'readACL') return ['any-authenticated-user'];
    if (aclType === 'updateACL') {
      const users = await this.getUnxGroupsEmail(data.location);
      return arrayOfUniqueFrom(users.unxGroup, users.email);
    }
    if (aclType === 'deleteACL') return ['admin'];
    if (aclType === 'adminACL') return ['admin'];
  }

  private defaultAllButLocationLogbookACL(
    parent: Basesnippet,
    aclType: string,
    data: {accessGroups?: string[]},
  ) {
    if (aclType === 'shareACL')
      return arrayOfUniqueFrom(parent.shareACL, parent.readACL);
    if (aclType === 'readACL')
      return arrayOfUniqueFrom(parent.readACL, data.accessGroups);
    return parent[aclType as keyof Basesnippet];
  }

  private defaultLogbookACL(
    users: {unxGroup: string[]; email: string[]},
    aclType: string,
    data: Basesnippet,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = (this as any)[aclType](data, users);
    return results;
  }

  private readACL(
    data: {
      ownerGroup?: string | undefined;
      accessGroups?: string[];
    },
    users: {unxGroup: string[]; email: string[]},
  ) {
    return arrayOfUniqueFrom(
      data.ownerGroup,
      data.accessGroups,
      users.email,
      users.unxGroup,
    );
  }

  private deleteACL(
    data: {
      ownerGroup?: string | undefined;
    },
    users: {unxGroup: string[]; email: string[]},
  ) {
    return arrayOfUniqueFrom('admin', data.ownerGroup, users.unxGroup);
  }

  private createACL(
    data: {
      ownerGroup?: string | undefined;
    },
    users: {unxGroup: string[]; email: string[]},
  ) {
    return arrayOfUniqueFrom(data.ownerGroup, users.email, users.unxGroup);
  }

  private updateACL(
    data: {
      ownerGroup?: string | undefined;
    },
    users: {unxGroup: string[]; email: string[]},
  ) {
    return arrayOfUniqueFrom(data.ownerGroup, users.email, users.unxGroup);
  }

  private shareACL(data: {}, users: {unxGroup: string[]; email: string[]}) {
    return arrayOfUniqueFrom(users.email, users.unxGroup);
  }

  private adminACL(data: {}, users: {unxGroup: string[]; email: string[]}) {
    return arrayOfUniqueFrom('admin', users.unxGroup);
  }

  private async getUnxGroupsEmail(location: string) {
    const acl = await this.userRepository.find({
      where: {
        location: location,
      },
      fields: ['unxGroup', 'email'],
    });
    return acl.reduce(
      (previousValue, currentValue) => (
        previousValue.unxGroup.push(currentValue.unxGroup),
        previousValue.email.push(currentValue.email),
        previousValue
      ),
      {unxGroup: [] as string[], email: [] as string[]},
    );
  }

  private addOwnerGroupAccessGroups(data: {
    ownerGroup: string;
    accessGroups: string[];
    readACL: string[];
  }) {
    if (data.readACL?.length > 0) {
      data.ownerGroup = data.readACL[0];
      data.accessGroups = data.readACL;
    } else {
      data.ownerGroup = data.ownerGroup ?? '';
      data.accessGroups = data.accessGroups ?? [];
    }
  }

  definePersistedModel(entityClass: typeof Model) {
    const modelClass = super.definePersistedModel(entityClass);
    modelClass.observe('before save', async ctx => {
      // console.log("=============== before save:", entityClass.modelName, JSON.stringify(ctx, null, 3))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let currentUser: any;
      // eslint-disable-next-line  no-prototype-builtins
      if (!ctx?.options.hasOwnProperty('currentUser')) {
        throw new Error(
          'Unexpected user context: Current user cannot be retrieved.',
        );
      } else {
        currentUser = ctx.options.currentUser;
      }
      // console.log(`going to save ${ctx.Model.modelName} ${ctx}`);
      // PATCH case
      if (ctx.data) {
        // console.log("PATCH case")
        ctx.data.updatedAt = new Date();
        ctx.data.updatedBy = currentUser?.email ?? 'unknown@domain.org';
        // remove all auto generated fields
        delete ctx.data.createdAt;
        delete ctx.data.createdBy;
        delete ctx.data.expiresAt;
        if (currentUser?.roles?.includes('admin')) return;
        const updateCondition = this.updateACLCondition(
          currentUser,
          'updateACL',
        );
        ctx.where = this.addACLToFilter(ctx.where, updateCondition);
        if (this.acls.some(acl => acl !== 'readACL' && ctx.data[acl])) {
          const adminCondition = this.updateACLCondition(
            currentUser,
            'adminACL',
          );
          ctx.where = this.addACLToFilter(ctx.where, adminCondition);
        }
      } else {
        if (ctx.isNewInstance) {
          // POST case
          // console.log("POST case")
          ctx.instance.defaultOrder =
            ctx.instance.defaultOrder ?? Date.now() * 1000;
          // only admin may override createdAt/updateAt etc fields
          if (currentUser.roles.includes('admin')) {
            ctx.instance.createdAt = ctx.instance.createdAt ?? new Date();
            ctx.instance.createdBy =
              ctx.instance.createdBy ??
              currentUser?.email ??
              'unknown@domain.org';
            ctx.instance.updatedAt = ctx.instance.updatedAt ?? new Date();
            ctx.instance.updatedBy =
              ctx.instance.updatedBy ??
              currentUser?.email ??
              'unknown@domain.org';
          } else {
            ctx.instance.createdAt = new Date();
            ctx.instance.createdBy = currentUser?.email ?? 'unknown@domain.org';
            ctx.instance.updatedAt = new Date();
            ctx.instance.updatedBy = currentUser?.email ?? 'unknown@domain.org';
          }

          if (typeof ctx.instance.expiresAt == 'undefined') {
            // default expiration time is 3 days
            ctx.instance.expiresAt = new Date();
            ctx.instance.expiresAt.setDate(
              ctx.instance.expiresAt.getDate() + 3,
            );
          }
          await this.aclDefaultOnCreation(ctx.instance);
          if (
            ctx.instance.snippetType === 'logbook' &&
            ctx.instance.readACL?.includes('any-authenticated-user')
          )
            throw new HttpErrors.UnprocessableEntity(
              'Cannot create logbook with readACL containing any-authenticated-user',
            );
        } else {
          // PUT case not supported
          // console.log("PUT case")
          // TODO restore auto generated fields, which would otherwise be lost
          // ctx.instance.unsetAttribute('id')
        }
      }
      console.log('going to save:' + JSON.stringify(ctx, null, 3));
    });

    modelClass.observe('access', async ctx => {
      // console.log("=========Access Observe:", ctx?.options)
      // eslint-disable-next-line  no-prototype-builtins
      if (ctx?.options.hasOwnProperty('openAccess') && ctx.options.openAccess) {
        return;
      }
      // eslint-disable-next-line  no-prototype-builtins
      if (!ctx?.options.hasOwnProperty('currentUser')) {
        throw new Error(
          'Unexpected user context: Current user cannot be retrieved.',
        );
      }
      this.groupsToAclFilter(ctx.query.where);
      // console.log("roles:", currentUser?.roles);
      // console.log("access case:", JSON.stringify(ctx, null, 3));
      const groups = ctx?.options?.currentUser?.roles;
      if (!groups.includes('admin')) {
        const groupCondition = {
          readACL: {
            inq: groups,
          },
        };
        ctx.query.where = this.addACLToFilter(ctx.query.where, groupCondition);
      }
      // console.log("query:", JSON.stringify(ctx.query, null, 3));
    });

    modelClass.observe('loaded', async ctx => {
      // console.log("========= Loaded Observe:", ctx?.options, ctx?.data)
      // TODO check if data field is single document or array
      if (ctx?.options?.currentUser) {
        const currentUser = ctx.options.currentUser;
        let calculatedACLs = '';
        if (
          currentUser.roles.filter((element: string) =>
            ctx.data.updateACL?.includes(element),
          ).length > 0
        ) {
          calculatedACLs += 'U';
        }
        if (
          currentUser.roles.filter((element: string) =>
            ctx.data.deleteACL?.includes(element),
          ).length > 0
        ) {
          calculatedACLs += 'D';
        }
        if (
          currentUser.roles.filter((element: string) =>
            ctx.data.shareACL?.includes(element),
          ).length > 0
        ) {
          calculatedACLs += 'S';
        }
        if (
          currentUser.roles.filter((element: string) =>
            ctx.data.adminACL?.includes(element),
          ).length > 0
        ) {
          calculatedACLs += 'A';
        }
        ctx.data['calculatedACLs'] = calculatedACLs;
      }
      this.addOwnerGroupAccessGroups(ctx.data);
    });

    modelClass.observe('after save', async ctx => {
      this.addOwnerGroupAccessGroups(ctx.data ?? ctx.instance);
    });

    return modelClass;
  }

  private updateACLCondition(currentUser: User, acl: string) {
    return {
      [acl]: {
        inq: [...(currentUser?.roles ?? []), currentUser?.email],
      },
    };
  }

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  private groupsToAclFilter(object: any) {
    if (!object) return;
    if (object.ownerGroup && object.accessGroups) {
      object.and = [
        {readACL: object.ownerGroup},
        {readACL: object.accessGroups},
      ];
      delete object.ownerGroup;
      delete object.accessGroups;
    } else if (object.ownerGroup) {
      object.readACL = object.ownerGroup;
      delete object.ownerGroup;
    } else if (object.accessGroups) {
      object.readACL = object.accessGroups;
      delete object.accessGroups;
    }

    for (const objKey of Object.keys(object)) {
      if (typeof object[objKey] === 'object') {
        this.groupsToAclFilter(object[objKey]);
      }
    }
  }

  private addACLToFilter(
    where: Where<Basesnippet>,
    additionalCondition: Condition<Basesnippet>,
  ) {
    let outWhere: Where<Basesnippet>;
    if (!where || Object.keys(where).length === 0) {
      outWhere = additionalCondition;
    } else if (!(where as AndClause<Basesnippet>).and) {
      outWhere = {
        and: [where, additionalCondition],
      };
    } else {
      outWhere = {
        and: (where as AndClause<Basesnippet>).and.concat(additionalCondition),
      };
    }
    return outWhere;
  }
}
