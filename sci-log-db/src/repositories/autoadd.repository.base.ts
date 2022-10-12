import {Getter} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  Entity,
  HasManyRepositoryFactory,
  juggler,
  Model,
} from '@loopback/repository';

export class AutoAddRepository<
  T extends Entity,
  ID,
  Relations extends object = {}
> extends DefaultCrudRepository<T, ID, Relations> {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  public readonly parent: BelongsToAccessor<Entity, any>;

  public readonly subsnippets: HasManyRepositoryFactory<T, string>;

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

  definePersistedModel(entityClass: typeof Model) {
    const modelClass = super.definePersistedModel(entityClass);
    modelClass.observe('before save', async ctx => {
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
      // console.log(`going to save ${ctx.Model.modelName} ${ctx}`);
      // PATCH case
      if (ctx.data) {
        // console.error("PATCH case")
        ctx.data.updatedAt = new Date();
        ctx.data.updatedBy = currentUser?.email ?? 'unknown@domain.org';
      } else {
        if (ctx.isNewInstance) {
          // POST case
          // console.error("POST case")
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
        } else {
          // PUT case
          // console.error("PUT case")
          // TODO restore auto generated fields, which would otherwise be lost
          // ctx.instance.unsetAttribute('id')
        }
      }
      //console.error("going to save:" + JSON.stringify(ctx, null, 3))
    });

    modelClass.observe('access', async ctx => {
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
          or: [
            {
              ownerGroup: {
                inq: groups,
              },
            },
            {
              accessGroups: {
                inq: groups,
              },
            },
          ],
        };
        if (!ctx.query.where) {
          ctx.query.where = groupCondition;
        } else {
          ctx.query.where = {
            and: [ctx.query.where, groupCondition],
          };
        }
      }
      // console.log("query:",JSON.stringify(ctx.query,null,3));
    });
    return modelClass;
  }
}
