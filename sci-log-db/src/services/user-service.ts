// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {UserService} from '@loopback/authentication';
import {inject} from '@loopback/context';
import { asLifeCycleObserver } from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {PasswordHasherBindings} from '../keys';
import {User} from '../models';
import {ACLRepository, Credentials, UserRepository} from '../repositories';
import {PasswordHasher} from './hash.password.bcryptjs';


export class MyUserService implements UserService<User, Credentials> {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @repository(ACLRepository) public aclRepository: ACLRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
  ) {}

  async verifyCredentials(credentials: Credentials): Promise<User> {
    const {principal, password} = credentials;
    const invalidCredentialsError = 'Invalid email or password.';

    if (!principal) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }
    const foundUser = await this.userRepository.findOne({
      where: {email: principal},
    });
    if (!foundUser) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    const credentialsFound = await this.userRepository.findCredentials(
      foundUser.id,
    );
    if (!credentialsFound) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    const passwordMatched = await this.passwordHasher.comparePassword(
      password,
      credentialsFound.password,
    );

    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    return foundUser;
  }

  async convertToUserProfile(user: User): Promise<UserProfile> {
    console.error("Inside convertToUserProfile:"+JSON.stringify(user,null,4))
    // since first name and lastName are optional, no error is thrown if not provided
    let userName = '';
    if (user.firstName) userName = `${user.firstName}`;
    if (user.lastName)
      userName = user.firstName
        ? `${userName} ${user.lastName}`
        : `${user.lastName}`;
    let acls=await this.aclRepository.find({where:{ read: {inq: user.roles}},fields:{id:true}})
    console.log("ACLs:",acls)
    const userProfile = {
      [securityId]: user.id,
      name: userName,
      id: user.id,
      roles: user.roles,
      email: user.email,
      readACLs : acls.map(item=>item.id)
    };
    console.error("convertToUserProfile:",user,userProfile)

    return userProfile;
  }
}
