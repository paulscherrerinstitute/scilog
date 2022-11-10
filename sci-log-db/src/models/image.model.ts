import {belongsTo, model, property} from '@loopback/repository';
import {Basesnippet} from './basesnippet.model';

@model({
  settings: {
    strict: true,
    scope: {
      where: {snippetType: 'image'},
    },
    mongodb: {collection: 'Basesnippet'},
  },
})
export class Image extends Basesnippet {
  @property({
    type: 'string',
    default: 'image',
  })
  snippetType: string;

  @property({
    type: 'string',
    description: 'Name of uploaded file',
  })
  filename?: string;

  @property({
    type: 'string',
    description: 'optional title of the image',
  })
  title?: string;

  @property({
    type: 'string',
    description: 'optional caption for the image',
  })
  caption?: string;

  @property({
    type: 'string',
    description: 'width of image in percent',
  })
  width?: string;

  @property({
    type: 'string',
    description: 'height of image in percent',
  })
  height?: string;

  @property({
    type: 'string',
    jsonSchema: {
      pattern: '^(https?|wss?|ftp)://',
    },
    description: 'URI from which image can be downloaded',
  })
  url?: string;

  @property({
    type: 'string',
    description: 'file extension',
  })
  fileExtension?: string;

  @belongsTo(
    () => Basesnippet,
    {}, //relation metadata goes in here
    {
      // property definition goes in here
      mongodb: {dataType: 'ObjectId'},
    },
  )
  fileId?: string;

  constructor(data?: Partial<Image>) {
    super(data);
  }
}

export interface ImageRelations {
  // describe navigational properties here
}

export type ImageWithRelations = Image & ImageRelations;
