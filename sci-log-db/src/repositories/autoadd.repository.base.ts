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
import {Logbook} from '../models';
import {Basesnippet} from '../models/basesnippet.model';
import {BasesnippetRepository} from './basesnippet.repository';

export class AutoAddRepository<
  T extends Entity,
  ID,
  Relations extends object = {}
> extends DefaultCrudRepository<T, ID, Relations> {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  public readonly parent: BelongsToAccessor<Entity, any>;

  public readonly subsnippets: HasManyRepositoryFactory<T, string>;

  private readonly acls = [
    'createACL',
    'readACL',
    'shareACL',
    'updateACL',
    'deleteACL',
    'shareACL',
    'adminACL',
  ];

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
      unsetAttribute: Function;
    },
  ) {
    const emptyAcls = this.acls.filter(acl => !data[acl as keyof Basesnippet]);
    if (emptyAcls) {
      const parent = await this.getParent(data);
      const ownerGroup = data.ownerGroup ? [data.ownerGroup] : [];
      await Promise.all(
        emptyAcls.map(async k => {
          const aclValue = (parent[k as keyof Basesnippet] ??
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ((this as any)[k]
              ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await (this as any)[k](data)
              : ownerGroup)) as string[];
          if (aclValue.length > 0)
            (data[k as keyof Basesnippet] as string[]) = aclValue;
        }),
      );
    }
    data.unsetAttribute('ownerGroup');
    data.unsetAttribute('accessGroups');
  }

  private aclDefaultOnUpdate(
    data: (Basesnippet | Logbook) & {
      ownerGroup?: string;
      unsetAttribute: Function;
      accessGroups?: string[];
    },
  ) {
    if (data.ownerGroup) {
      const ownerGroup = data.ownerGroup;
      data.updateACL = data.updateACL ?? [ownerGroup]; // ownergroup
      data.deleteACL = data.deleteACL ?? [ownerGroup]; // admin
      data.shareACL = data.shareACL ?? [ownerGroup]; // ownerGroup
      data.readACL = data.readACL ?? [ownerGroup];
    }
    delete data.ownerGroup;
    delete data.accessGroups;
  }

  private async getParent(
    data: (Basesnippet | Logbook) & {
      ownerGroup?: string | undefined;
      unsetAttribute: Function;
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
        parentACL = ((await baseSnippetRepository.findById(
          (parentId as unknown) as ID,
          {},
          {currentUser: {roles: ['admin']}},
        )) as unknown) as Basesnippet | Logbook;
      } catch {
        console.warn(
          `Cannot find snippet with ID from parentId or location: ${parentId}`,
        );
      }
    }
    return parentACL;
  }

  private async readACL(
    data: (Basesnippet | Logbook) & {ownerGroup?: string | undefined},
  ) {
    const result = await this.readOrDeleteACL(data, 'readACL', 'email');
    return result;
  }

  private async deleteACL(
    data: (Basesnippet | Logbook) & {ownerGroup?: string | undefined},
  ) {
    const result = await this.readOrDeleteACL(data, 'deleteACL', 'unxAccount');
    return result;
  }

  private async readOrDeleteACL(
    data: (Basesnippet | Logbook) & {ownerGroup?: string | undefined},
    type: string,
    field: string,
  ) {
    let acl: string[] = [];
    if (!data[type as keyof Basesnippet] && data.snippetType === 'location')
      acl = (
        await this.userRepository.find({
          where: {
            location: (data as Logbook).location,
          },
          fields: [field],
        })
      ).map(u => u[field]);
    return [...new Set((data.ownerGroup ? [data.ownerGroup] : []).concat(acl))];
  }

  private async adminACL() {
    return (
      await this.userRepository.find({
        where: {roles: 'admin'},
        fields: ['email'],
      })
    ).map(u => u.email);
  }

  private addOwnerGroupAccessGroups(data: {
    ownerGroup: string;
    accessGroups: string[];
    readACL: string[];
  }) {
    data.ownerGroup = data.readACL?.[0] ?? '';
    data.accessGroups = [];
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
        // drop any potential ACLs unless admin
        this.aclDefaultOnUpdate(ctx.data);
        if (this.acls.some(acl => ctx.data[acl])) {
          const adminCondition = {
            adminACL: {
              inq: [
                ...ctx?.options?.currentUser?.roles,
                ctx?.options?.currentUser?.email,
              ],
            },
          };
          ctx.where = this.addACLToFilter(ctx.where, adminCondition);
        }
        // if (
        //   ctx.data.createACL !== undefined ||
        //   ctx.data.readACL !== undefined ||
        //   ctx.data.updateACL !== undefined ||
        //   ctx.data.deleteACL !== undefined ||
        //   ctx.data.shareACL !== undefined ||
        //   ctx.data.adminACL !== undefined
        // ) {
        //   // get instance data to check admin rights
        //   const instance = ((await this.findById(
        //     ctx.where.id,
        //     {},
        //     {currentUser: currentUser},
        //   )) as unknown) as Basesnippet;
        //   // console.log("Got instance since someoone tried to change ACLS:",instance)
        //   if (
        //     currentUser.roles.filter((element: string) =>
        //       instance.adminACL.includes(element),
        //     ).length === 0
        //   ) {
        //     delete ctx.data.createACL;
        //     delete ctx.data.readACL;
        //     delete ctx.data.updateACL;
        //     delete ctx.data.deleteACL;
        //     delete ctx.data.shareACL;
        //     delete ctx.data.adminACL;
        //   }
        // }
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
      // console.log("roles:", currentUser?.roles);
      // console.log("access case:", JSON.stringify(ctx, null, 3));
      const groups = [
        ...ctx?.options?.currentUser?.roles,
        ctx?.options?.currentUser?.email,
      ];
      if (!groups.includes('admin')) {
        const groupCondition = {
          readACL: {
            inq: groups,
          },
        };
        ctx.query.where = this.addACLToFilter(ctx.query.where, groupCondition);
        console.log();
      }
      // console.log("query:", JSON.stringify(ctx.query, null, 3));
    });

    modelClass.observe('loaded', async ctx => {
      // console.log("========= Loaded Observe:", ctx?.options, ctx?.data)
      // TODO check if data field is single document or array
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      let currentUser: any;
      // eslint-disable-next-line  no-prototype-builtins
      if (!ctx?.options.hasOwnProperty('currentUser')) {
        throw new Error(
          'Unexpected user context: Current user cannot be retrieved.',
        );
      } else {
        currentUser = ctx.options.currentUser;
      }
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
      this.addOwnerGroupAccessGroups(ctx.data);
    });

    modelClass.observe('after save', async ctx => {
      this.addOwnerGroupAccessGroups(ctx.data ?? ctx.instance);
    });

    return modelClass;
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
