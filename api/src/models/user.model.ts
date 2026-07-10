// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Entity, hasOne, model, property} from '@loopback/repository';
import {UserCredentials} from './user-credentials.model';

@model({
  settings: {
    indexes: {
      uniqueEmail: {
        keys: {
          email: 1,
        },
        options: {
          unique: true,
        },
      },
    },
  },
})
export class User extends Entity {
  @property({
    type: 'string',
    id: true,
    mongodb: {dataType: 'ObjectID'},
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'string',
  })
  firstName?: string;

  @property({
    type: 'string',
  })
  lastName?: string;

  @property({
    type: 'string',
  })
  username?: string;

  @hasOne(() => UserCredentials)
  userCredentials: UserCredentials;

  @property({
    type: 'array',
    itemType: 'string',
  })
  roles?: string[];

  @property({
    type: 'string',
  })
  location?: string;

  @property({
    type: 'string',
  })
  unxGroup?: string;

  constructor(data?: Partial<User>) {
    super(data);
  }
}
