import {hasMany, model, property} from '@loopback/repository';
import {Basesnippet} from './basesnippet.model';
import {Image} from './image.model';

@model({
  settings: {
    strict: true,
    scope: {
      where: {snippetType: 'image'}
    },
    mongodb: {collection: 'Basesnippet'}
  }
})
export class Filesnippet extends Basesnippet {

  @property({
    type: 'string',
    description: 'Optional name of file as presented to user in GUI'
  })
  name?: string;

  @property({
    type: 'string',
    description: 'Optional detailed definition of contents and purpose of this file'
  })
  description?: string;

  @property({
    type: 'string',
    description: 'Name of the file'
  })
  filename?: string;

  @property({
    type: 'string',
    description: 'File extension of the file'
  })
  fileExtension: string;

  @property({
    type: 'string',
    description: 'Content type of the file, e.g. image/jpeg'
  })
  contentType: string;

  @property({
    type: 'string',
    description: 'File id of the file'
  })
  _fileId: string;

  @hasMany(() => Image, {keyTo: 'fileId'})
  subsnippets?: Image[];

  constructor(data?: Partial<Filesnippet>) {
    super(data);
  }
}

export interface FileRelations {
  // describe navigational properties here
}

export type FileWithRelations = File & FileRelations;
