import {model, property} from '@loopback/repository';
import {Basesnippet} from './basesnippet.model';

export interface Filecontainer {
  className?: string;
  childTag?: string;
  style?: {
    width: string;
    height: string;
  };
  fileId?: string;
}

@model({
  settings: {
    strict: false,
    scope: {
      where: {snippetType: 'location'},
    },
    mongodb: {collection: 'Basesnippet'},
  },
})
export class Location extends Basesnippet {
  @property({
    type: 'string',
    default: 'location',
  })
  snippetType: string;

  @property({
    type: 'string',
    description: 'Name of the location, e.g. X12SA',
  })
  name: string;

  @property({
    type: 'string',
    description: 'Location string, e.g. /PSI/SLS/X12SA',
  })
  location: string;

  @property.array(Object, {
    type: 'object',
    description: 'Information about the embedded files.',
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
