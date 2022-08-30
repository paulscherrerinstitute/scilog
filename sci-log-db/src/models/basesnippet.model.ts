import {belongsTo, Entity, hasMany, model, property} from '@loopback/repository';
import { ACL } from './acl.model';

@model({
  settings: {
    strict: false
  }
})
export class Basesnippet extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
    mongodb: {dataType: 'ObjectId'}
  })
  id: string;

  @property({
    type: 'string',
    default: 'base',
    description: 'Defines what type of information snippet is added, such as paragraph, image etc.',
    index: true,
  })
  snippetType: string;

  @property({
    type: 'boolean',
    default: false,
    description: 'Private snippets are meant not to be exported, e.g. as metadata to the data catalog. Often used for chat like communication'
  })
  isPrivate: boolean;

  @property({
    type: 'number',
    index: true,
    description: 'Default display order is given by createdAt Time in ms*1000. Override to allow to place snippet between existing other snippets created in the past'
  })
  defaultOrder: number;

  @property({
    type: 'date',
    index: true,
  })
  createdAt: Date;

  @property({
    type: 'string',
    jsonSchema: {
      format: 'email',
    },
    description: 'email of the user adding this view',
    index: true,
  })
  createdBy: string;

  @property({
    type: 'date',
    index: true,
  })
  updatedAt: Date;

  @property({
    type: 'date',
    index: true,
    description: 'Date after which the snippet becomes read only.',
  })
  expiresAt: Date;

  @property({
    type: 'string',
    jsonSchema: {
      format: 'email',
    },
    description: 'email of the user updating this view',
    index: true,
  })
  updatedBy: string;

  @hasMany(() => Basesnippet, {keyTo: 'parentId'})
  subsnippets?: Basesnippet[];

  @belongsTo(() => Basesnippet,
    {}, //relation metadata goes in here
    {// property definition goes in here
      mongodb: {dataType: 'ObjectId'}
    })
  parentId?: string;

  @belongsTo(() => ACL,
  {}, //relation metadata goes in here
  {// property definition goes in here
    mongodb: {dataType: 'ObjectId'}
  })
  aclId?: string;

  @property.array(String, {
    description: 'arbitrray strings meant as tags attached to this snippet'
  })
  tags?: string[];

  @property({
    type: 'string',
    description: 'Human readable name of single snippet',
    index: true,
  })
  dashboardName?: string;

  @property({
    type: 'boolean',
    description: 'Versionable snippets will create a new history entry upon update.',
    default: true,
  })
  versionable?: boolean;

  @property({
    type: 'boolean',
    description: 'Defines whether the snippet has been deleted. ',
    default: false,
  })
  deleted?: boolean;

  constructor(data?: Partial<Basesnippet>) {
    super(data);
  }
}

export interface BasesnippetRelations {
  // describe navigational properties here
  subsnippets?: BasesnippetWithRelations[];
  parent?: BasesnippetWithRelations;
}

export type BasesnippetWithRelations = Basesnippet & BasesnippetRelations;
