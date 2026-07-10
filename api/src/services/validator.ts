// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Credentials} from '../repositories/user.repository';
import isemail from 'isemail';
import {HttpErrors} from '@loopback/rest';

export function validateCredentials(credentials: Credentials) {
  // Validate Email: only if principal seems to be an email:

  if (credentials.principal.includes('@')) {
    if (!isemail.validate(credentials.principal)) {
      throw new HttpErrors.UnprocessableEntity('invalid email');
    }
  }

  // Validate Password Length
  if (!credentials.password || credentials.password.length < 8) {
    throw new HttpErrors.UnprocessableEntity(
      'password must be minimum 8 characters',
    );
  }
}
