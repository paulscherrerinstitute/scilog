import {model, property} from '@loopback/repository';
import {Basesnippet} from './basesnippet.model';

enum LinkType {
  LOCATION = 'location',
  COMMENT = 'comment',
  QUOTE = 'quote'
}

export interface Filecontainer {
  className?: string,
  childTag?: string,
  style?: {
    width: string,
    height: string
  },
  fileId?: string;
}

@model({
  settings: {
    strict: true,
    scope: {
      where: {snippetType: 'location'}
    },
    mongodb: {collection: 'Basesnippet'}
  }
})
export class Location extends Basesnippet {

  @property({
    type: 'string',
    description: 'Markup contents in markdown (MD) syntax of this location'
  })
  textcontent?: string;

  @property.array(Object, {
    type: 'object',
    description: 'Information about the embedded files.'
  })
  files?: Filecontainer[];

  constructor(data?: Partial<Location>) {
    super(data);
  }
}

export interface LocationRelations {
  // describe navigational properties here
}

export type LocationWithRelations = Location & LocationRelations;
