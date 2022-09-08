import {model, property} from '@loopback/repository';
import {Basesnippet} from './basesnippet.model';

@model({
  settings: {
    strict: true,
    scope: {
      where: {snippetType: 'view'}
    },
    mongodb: {collection: 'Basesnippet'}
  }
})
export class View extends Basesnippet {
  @property({
    type: 'string',
    default: 'view',
  })
  snippetType: string;

  @property({
    type: 'string',
    required: true,
    description:
      'Unique name of view, presented to the user in the GUI for view selection',
  })
  name: string;

  @property({
    type: 'string',
    description:
      'Optional more detailed tooltip like description for this view',
  })
  description?: string;

  @property({
    type: 'string',
    description:
      'Optional linking to a location to enable finding views dedicated to a certain location, beamline or instrumnet',
  })
  location?: string;

  @property({
    type: 'object',
    required: true,
    description:
      'JSON object defining the details of the view, e.g. which filter parameters to be used in navigation and which presentation types, like table, grid etc should be used.',
  })
  configuration: object;

  constructor(data?: Partial<View>) {
    super(data);
  }
}

export interface ViewRelations {
  // describe navigational properties here
}

export type ViewWithRelations = View & ViewRelations;
