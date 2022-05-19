// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {UserService} from '@loopback/authentication';
import {inject} from '@loopback/context';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {PasswordHasherBindings} from '../keys';
import {User} from '../models';
import {Credentials, UserRepository} from '../repositories';
import {PasswordHasher} from './hash.password.bcryptjs';

import {UserIdentityService} from '@loopback/authentication';
import {Profile as PassportProfile} from 'passport';
import {UserIdentityRepository} from '../repositories/user-identity.repository';


export class MyUserService implements UserService<User, Credentials> {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
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

  convertToUserProfile(user: User): UserProfile {
    //console.error("Inside convertToUserProfile:"+JSON.stringify(user,null,4))
    // since first name and lastName are optional, no error is thrown if not provided
    let userName = '';
    if (user.firstName) userName = `${user.firstName}`;
    if (user.lastName)
      userName = user.firstName
        ? `${userName} ${user.lastName}`
        : `${user.lastName}`;
    const userProfile = {
      [securityId]: user.id,
      name: userName,
      id: user.id,
      roles: user.roles,
      email: user.email
    };
    // console.error("convertToUserProfile:",user,userProfile)
    return userProfile;
  }
}

/**
 * User service to accept a 'passport' user profile and save it locally
 */
 export class PassportUserIdentityService
 implements UserIdentityService<PassportProfile, User>
{
 constructor(
   @repository(UserRepository)
   public userRepository: UserRepository,
   @repository(UserIdentityRepository)
   public userIdentityRepository: UserIdentityRepository,
 ) {}

 /**
  * find a linked local user for an external profile
  * create a local user if not created yet.
  * @param email
  * @param profile
  * @param token
  */
 async findOrCreateUser(profile: PassportProfile): Promise<User> {
   if (!profile.emails || !profile.emails.length) {
     throw new Error('email-id is required in returned profile to login');
   }

   const email = profile.emails[0].value;

   const users: User[] = await this.userRepository.find({
     where: {
       email: email,
     },
   });
   let user: User;
   if (!users || !users.length) {
     const name = profile.name?.givenName
       ? profile.name.givenName + ' ' + profile.name.familyName
       : profile.displayName;
     const [firstName, lastName] = (name || JSON.stringify(profile.name)).split('')
     user = await this.userRepository.create({
       email: email,
       firstName: firstName,
       lastName: lastName,
       username: email,
     });
   } else {
     user = users[0];
   }
   user = await this.linkExternalProfile('' + user.id, profile);
   return user;
 }

 /**
  * link external profile with local user
  * @param userId
  * @param userIdentity
  */
 async linkExternalProfile(
   userId: string,
   userIdentity: PassportProfile,
 ): Promise<User> {
   let profile;
   try {
     profile = await this.userIdentityRepository.findById(userIdentity.id);
   } catch (err) {
     // no need to throw an error if entity is not found
     if (!(err.code === 'ENTITY_NOT_FOUND')) {
       throw err;
     }
   }

   if (!profile) {
     await this.createUser(userId, userIdentity);
   } else {
     await this.userIdentityRepository.updateById(userIdentity.id, {
       profile: {
         emails: userIdentity.emails,
       },
       created: new Date(),
     });
   }
   if (!userId) console.log('user id is empty');
    throw 'user id is empty'
 }

 /**
  * create a copy of the external profile
  * @param userId
  * @param userIdentity
  */
 async createUser(
   userId: string,
   userIdentity: PassportProfile,
 ): Promise<void> {
   await this.userIdentityRepository.create({
     id: userIdentity.id,
     provider: userIdentity.provider,
     authScheme: userIdentity.provider,
     userId: parseInt(userId),
     profile: {
       emails: userIdentity.emails,
     },
     created: new Date(),
   });
 }
}
