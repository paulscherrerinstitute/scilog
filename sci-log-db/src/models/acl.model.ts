import { belongsTo, Entity, hasMany, model, property } from '@loopback/repository';

@model({
  settings: {
    strict: false
  }
})
export class ACL extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
    mongodb: { dataType: 'ObjectId' }
  })
  id: string;

  @property.array(String, {
    description: 'principals who can create items. Principals can be groups or emails.',
    index: true,
  })
  create: string[];

  @property.array(String, {
    description: 'principals who can read items connected to this ACL',
    index: true,
  })
  read: string[];

  @property.array(String, {
    description: 'principals who can update items connected to this ACL',
    index: true,
  })
  update: string[];

  @property.array(String, {
    description: 'principals who can delete items connected to this ACL',
    index: true,
  })
  delete: string[];

  @property.array(String, {
    description: 'principals who can share items connected to this ACL',
    index: true,
  })
  share: string[];

  @property.array(String, {
    description: 'principals who can administrate ACLs',
    index: true,
  })
  admin: string[];

  @hasMany(() => ACL, { keyTo: 'parentId' })
  subAcls?: ACL[];

  @belongsTo(() => ACL,
    {}, //relation metadata goes in here
    {// property definition goes in here
      mongodb: { dataType: 'ObjectId' }
    })
  parentId?: string;

  constructor(data?: Partial<ACL>) {
    super(data);
  }
}

export interface ACLRelations {
  // describe navigational properties here
  subsnippets?: ACLWithRelations[];
  parent?: ACLWithRelations;
}

export type ACLWithRelations = ACL & ACLRelations;
