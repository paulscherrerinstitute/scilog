import {UserRepository} from '@loopback/authentication-jwt';
import {Getter} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  Entity,
  HasManyRepositoryFactory,
  juggler,
  Model,
  repository,
} from '@loopback/repository';
import {Logbook} from '../models';
import {Basesnippet} from '../models/basesnippet.model';

export class AutoAddRepository<
  T extends Entity,
  ID,
  Relations extends object = {}
> extends DefaultCrudRepository<T, ID, Relations> {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  public readonly parent: BelongsToAccessor<Entity, any>;

  public readonly subsnippets: HasManyRepositoryFactory<T, string>;

  @repository('UserRepository')
  readonly userRepository: UserRepository;

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

  private async aclDefault(
    data: (Basesnippet | Logbook) & {ownerGroup?: string},
  ) {
    if (data.snippetType === 'location') return;
    const aclObj = {} as {
      createACL: string[];
      readACL: string[];
      updateACL: string[];
      deleteACL: string[];
      shareACL: string[];
      adminACL: string[];
    };
    const acls = [
      'createACL',
      'readACL',
      'shareACL',
      'updateACL',
      'deleteACL',
      'shareACL',
      'adminACL',
    ];
    const parentId = (data as Logbook).location ?? data.parentId;
    if (parentId && acls.some(acl => data[acl as keyof Basesnippet])) {
      const parentAcl = ((await this.findById(
        parentId as ID,
        {},
        {currentUser: ['admin']},
      )) as unknown) as Basesnippet | Logbook;
      const ownerGroup = data.ownerGroup;
      aclObj.createACL = data.createACL ?? parentAcl.createACL ?? [ownerGroup]; // potentially remove it
      aclObj.readACL = (
        data.readACL ??
        parentAcl.readACL ??
        (await this.readACLfromLocation(data, parentAcl))
      ).concat(ownerGroup ?? []); // ownergroup + location (beamline account as function of location )
      aclObj.updateACL = data.updateACL ?? parentAcl.updateACL ?? [ownerGroup]; // ownergroup
      aclObj.deleteACL = data.deleteACL ?? parentAcl.deleteACL ?? [ownerGroup]; // admin
      aclObj.shareACL = data.shareACL ?? parentAcl.shareACL ?? [ownerGroup]; // ownerGroup
      aclObj.adminACL =
        data.adminACL ?? parentAcl.adminACL ?? (await this.adminACLfromUsers());
    }
    return aclObj;
  }

  private async readACLfromLocation(
    data: (Basesnippet | Logbook) & {ownerGroup?: string | undefined},
    parentAcl: Basesnippet,
  ) {
    if (parentAcl.snippetType === 'location')
      return (
        await this.userRepository.find({
          where: {
            location: (parentAcl as Logbook).location,
          },
          fields: ['username'],
        })
      ).map(u => u.username) as string[];
  }

  private async adminACLfromUsers() {
    return (
      await this.userRepository.find({
        where: {roles: 'admin'},
        fields: ['username'],
      })
    ).map(u => u.username);
  }

  //   if (filter?.aclId)
  //     await this.updateAllAclFromDefault(filter, aclObj as ACL);
  //   else if (data.ownerGroup) {
  //     if (!data.aclId)
  //       data.aclId = await this.createAclFromDefault(aclObj as ACL);
  //     else await this.replaceAclFromDefault(data.aclId, aclObj as ACL);
  //     data.unsetAttribute('ownerGroup');
  //     data.unsetAttribute('accessGroups');
  //   }
  // }

  // private async replaceAclFromDefault(aclId: string, aclObj: ACL) {
  //   await this.aclRepository.replaceById(aclId, aclObj);
  // }

  // private async createAclFromDefault(aclObj: ACL) {
  //   const acl = await this.aclRepository.create(aclObj);
  //   return acl.id;
  // }

  // private async updateAllAclFromDefault(
  //   filter: Condition<Basesnippet>,
  //   aclObj: ACL,
  // ) {
  //   const aclFilter = {id: filter.aclId} as Condition<ACL>;
  //   if (filter.id) {
  //     const aclId = ((await this.find(
  //       // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  //       {where: filter} as any,
  //     )) as unknown) as Basesnippet;
  //     aclFilter.id = aclId.aclId;
  //   }
  //   const updateCondition = aclObj.admin
  //     ? aclObj
  //     : ({
  //         // $addToSet: {read: {$each: aclObj.read}},
  //         $set: _.omit(aclObj, 'read'),
  //         read: {$concatSets: [aclObj, '$create']},
  //         // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  //       } as any);

  //   await this.aclRepository.updateAll(updateCondition, aclFilter);
  // }

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
        if (
          ctx.data.createACL !== undefined ||
          ctx.data.readACL !== undefined ||
          ctx.data.updateACL !== undefined ||
          ctx.data.deleteACL !== undefined ||
          ctx.data.shareACL !== undefined ||
          ctx.data.adminACL !== undefined
        ) {
          // get instance data to check admin rights
          const instance = ((await this.findById(
            ctx.where.id,
            {},
            {currentUser: currentUser},
          )) as unknown) as Basesnippet;
          // console.log("Got instance since someoone tried to change ACLS:",instance)
          if (
            currentUser.roles.filter((element: string) =>
              instance.adminACL.includes(element),
            ).length === 0
          ) {
            delete ctx.data.createACL;
            delete ctx.data.readACL;
            delete ctx.data.updateACL;
            delete ctx.data.deleteACL;
            delete ctx.data.shareACL;
            delete ctx.data.adminACL;
          }
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
          const aclDefault = await this.aclDefault(ctx.instance);
          ctx.instance = {...ctx.instance, ...aclDefault};
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
      const groups = [...ctx?.options?.currentUser?.roles];
      if (!groups.includes('admin')) {
        const groupCondition = {
          readACL: {
            inq: groups,
          },
        };
        if (!ctx.query.where) {
          ctx.query.where = groupCondition;
        } else {
          ctx.query.where = {
            and: [ctx.query.where, groupCondition],
          };
        }
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
    });

    return modelClass;
  }
}
