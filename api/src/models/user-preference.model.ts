import {belongsTo, Entity, Model, model, property} from '@loopback/repository';
import {User} from './user.model';

@model({settings: {strict: false}})
export class Collection extends Model {
  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  filter: string;

  @property({
    type: 'string',
  })
  description?: string;

  constructor(data?: Partial<Collection>) {
    super(data);
  }
}

@model({settings: {strict: false}})
export class UserPreference extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  // Each user preference belongs to a user, indentified by its id (userId)
  @belongsTo(
    () => User,
    {},
    {
      mongodb: {dataType: 'ObjectId'},
    },
  )
  userId?: string;

  @property.array(Collection)
  collections?: Collection[];

  constructor(data?: Partial<UserPreference>) {
    super(data);
  }
}

export interface UserPreferenceRelations {
  // describe navigational properties here
}

export type UserPreferenceWithRelations = UserPreference &
  UserPreferenceRelations;
