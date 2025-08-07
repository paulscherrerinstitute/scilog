import {model, property} from '@loopback/repository';
import {Basesnippet} from './basesnippet.model';

@model({
  settings: {
    strict: false,
    scope: {
      where: {snippetType: 'logbook'},
    },
    mongodb: {collection: 'Basesnippet'},
  },
})
export class Logbook extends Basesnippet {
  @property({
    type: 'string',
    default: 'logbook',
  })
  snippetType: string;

  @property({
    type: 'string',
    required: true,
    description: 'Name of logbook as presented to user in GUI',
    index: true,
  })
  name: string;

  @property({
    type: 'string',
    description:
      'Optional detailed definition of contents and purpose of this logbook',
    index: true,
  })
  description?: string;

  @property({
    type: 'string',
    description: 'Optional image/logo associated to this logbook',
  })
  thumbnail?: string;

  @property({
    type: 'string',
    required: true,
    description:
      'A logbook is usually connected to a location, such as beamline or instrument',
  })
  location: string;

  @property({
    type: 'date',
    index: true,
  })
  touchedAt: Date;

  constructor(data?: Partial<Logbook>) {
    super(data);
  }
}

export interface LogbookRelations {
  // describe navigational properties here
}

export type LogbookWithRelations = Logbook & LogbookRelations;
