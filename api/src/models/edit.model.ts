import {model, property} from '@loopback/repository';
import {Basesnippet} from './basesnippet.model';

@model({
  settings: {
    strict: false,
    scope: {
      where: {snippetType: 'edit'},
    },
    mongodb: {collection: 'Basesnippet'},
  },
})
export class Edit extends Basesnippet {
  @property({
    type: 'string',
    default: 'edit',
  })
  snippetType: string;

  @property({
    type: 'boolean',
    description:
      'Versionable snippets will create a new history entry upon update.',
    default: false,
  })
  toDelete: boolean;

  constructor(data?: Partial<Edit>) {
    super(data);
  }
}

export interface EditRelations {
  // describe navigational properties here
}

export type EditWithRelations = Edit & EditRelations;
