import { Getter } from '@loopback/core';
import { BelongsToAccessor, DefaultCrudRepository, Entity, HasManyRepositoryFactory, juggler, Model } from '@loopback/repository';
import { BasesnippetRepository } from '.';
import { Basesnippet } from '../models/basesnippet.model';

export class AutoAddRepository<
    T extends Entity,
    ID,
    Relations extends object = {}
    > extends DefaultCrudRepository<T, ID, Relations> {

    public readonly parent: BelongsToAccessor<
        Entity,
        any
    >;


    public readonly subsnippets: HasManyRepositoryFactory<
        T,
        string
    >;

    constructor(
        entityClass: typeof Entity & {
            prototype: T;
        },
        dataSource: juggler.DataSource,
    ) {
        super(entityClass, dataSource)
        this.subsnippets = this.createHasManyRepositoryFactoryFor(
            'subsnippets',
            Getter.fromValue(this),
        );

        this.parent = this.createBelongsToAccessorFor(
            'parent',
            Getter.fromValue(this) ,
        );

        // add these lines to register inclusion resolver.
        this.registerInclusionResolver('subsnippets', this.subsnippets.inclusionResolver);
        this.registerInclusionResolver('parent', this.parent.inclusionResolver);
    }

    definePersistedModel(entityClass: typeof Model) {
        const modelClass = super.definePersistedModel(entityClass);
        modelClass.observe('before save', async ctx => {
            // console.log("=============== before save:", entityClass.modelName, JSON.stringify(ctx, null, 3))
            let currentUser: any;
            if (!ctx?.options.hasOwnProperty('currentUser')) {
                throw new Error("Unexpected user context: Current user cannot be retrieved.")
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
                delete ctx.data.createdAt
                delete ctx.data.createdBy
                delete ctx.data.expiresAt
                // drop any potential ACLs unless admin
                if (ctx.data.createACL !== undefined ||
                    ctx.data.readACL !== undefined ||
                    ctx.data.updateACL !== undefined ||
                    ctx.data.deleteACL !== undefined ||
                    ctx.data.shareACL !== undefined ||
                    ctx.data.adminACL !== undefined) {
                    // get instance data to check admin rights
                    const instance = await this.findById(ctx.where.id, {}, { currentUser: currentUser }) as unknown as Basesnippet
                    // console.log("Got instance since someoone tried to change ACLS:",instance)
                    if (currentUser.roles.filter((element: string) => instance.adminACL.includes(element)).length = 0) {
                        delete ctx.data.createACL
                        delete ctx.data.readACL
                        delete ctx.data.updateACL
                        delete ctx.data.deleteACL
                        delete ctx.data.shareACL
                        delete ctx.data.adminACL
                    }
                }

            } else {
                if (ctx.isNewInstance) {
                    // POST case
                    // console.log("POST case")
                    ctx.instance.defaultOrder = ctx.instance.defaultOrder ?? Date.now() * 1000;
                    // only admin may override createdAt/updateAt etc fields
                    if (currentUser.roles.includes('admin')) {
                        ctx.instance.createdAt = ctx.instance.createdAt ?? new Date();
                        ctx.instance.createdBy = ctx.instance.createdBy ?? currentUser?.email ?? 'unknown@domain.org';
                        ctx.instance.updatedAt = ctx.instance.updatedAt ?? new Date();
                        ctx.instance.updatedBy = ctx.instance.updatedBy ?? currentUser?.email ?? 'unknown@domain.org';
                    } else {
                        ctx.instance.createdAt = new Date();
                        ctx.instance.createdBy = currentUser?.email ?? 'unknown@domain.org';
                        ctx.instance.updatedAt = new Date();
                        ctx.instance.updatedBy = currentUser?.email ?? 'unknown@domain.org';
                    }

                    if (typeof ctx.instance.expiresAt == 'undefined') {
                        // default expiration time is 3 days
                        ctx.instance.expiresAt = new Date()
                        ctx.instance.expiresAt.setDate(ctx.instance.expiresAt.getDate() + 3);
                    }
                } else {
                    // PUT case not supported
                    // console.log("PUT case")
                    // TODO restore auto generated fields, which would otherwise be lost
                    // ctx.instance.unsetAttribute('id')
                }

            }
            console.log("going to save:" + JSON.stringify(ctx, null, 3))

        });

        modelClass.observe('access', async ctx => {
            // console.log("=========Access Observe:", ctx?.options)
            let currentUser: any;
            if (ctx?.options.hasOwnProperty('openAccess') && ctx.options.openAccess) {
                return;
            }
            if (!ctx?.options.hasOwnProperty('currentUser')) {
                throw new Error("Unexpected user context: Current user cannot be retrieved.")
            } else {
                currentUser = ctx.options.currentUser;
            }
            // console.log("roles:", currentUser?.roles);
            // console.log("access case:", JSON.stringify(ctx, null, 3));
            let groups = [...ctx?.options?.currentUser?.roles]
            if (!groups.includes('admin')) {
                var groupCondition = {
                    readACL: {
                        inq: groups
                    }
                };
                if (!ctx.query.where) {
                    ctx.query.where = groupCondition;
                } else {
                    ctx.query.where = {
                        and: [ctx.query.where, groupCondition]
                    };
                }
            }
            // console.log("query:", JSON.stringify(ctx.query, null, 3));
        })

        modelClass.observe('loaded', async ctx => {
            // console.log("========= Loaded Observe:", ctx?.options, ctx?.data)
            // TODO check if data field is single document or array
            let currentUser: any;
            if (!ctx?.options.hasOwnProperty('currentUser')) {
                throw new Error("Unexpected user context: Current user cannot be retrieved.")
            } else {
                currentUser = ctx.options.currentUser;
            }
            var calculatedACLs = ""
            if ((currentUser.roles.filter((element: string) => ctx.data.updateACL?.includes(element))).length > 0) {
                calculatedACLs += "U"
            }
            if ((currentUser.roles.filter((element: string) => ctx.data.deleteACL?.includes(element))).length > 0) {
                calculatedACLs += "D"
            }
            if ((currentUser.roles.filter((element: string) => ctx.data.shareACL?.includes(element))).length > 0) {
                calculatedACLs += "S"
            }
            if ((currentUser.roles.filter((element: string) => ctx.data.adminACL?.includes(element))).length > 0) {
                calculatedACLs += "A"
            }
            ctx.data["calculatedACLs"]=calculatedACLs
        })

        return modelClass;
    }
}
