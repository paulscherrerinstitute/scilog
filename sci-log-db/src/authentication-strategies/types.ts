// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-passport-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Profile} from 'passport';
import {User} from '../models';
import {UserProfile, securityId} from '@loopback/security';
import {UserRepository} from '../repositories';

type ProfileUser = {
  email: string,
  firstName: string,
  lastName: string,
  username: string | undefined,
  roles: string[]
} 

type UserRolesProfile = Profile & {_json: {roles: string[]}}

export type VerifyFunction = (
  claimIss: string,
  profile: UserRolesProfile,
  idProfile: ProfileUser,
  context: any,
  idToken: string,
  accessToken: string,
  refreshToken: string,
  params: any,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  done: (error: any, user?: any, info?: any) => void,
) => void;

/**
 * provides an appropriate verify function for oauth2 strategies
 * @param accessToken
 * @param refreshToken
 * @param profile
 * @param done
 */

export const verifyFunctionFactory = function (
  userRepo: UserRepository,
): VerifyFunction {
  return function (
    claimIss: string,
    profile: UserRolesProfile,
    idProfile: ProfileUser,
    context: any,
    idToken: string,
    accessToken: string,
    refreshToken: string,
    params: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    done: (error: any, user?: any, info?: any) => void,
  ) {
    // look up a linked user for the profile
    if (!profile.emails || !profile.emails.length) {
      throw new Error('email-id is required in returned profile to login');
    } 
    const name = profile.name?.givenName
    ? profile.name.givenName + ' ' + profile.name.familyName
    : profile.displayName;
    const [firstName, lastName] = (name || JSON.stringify(profile.name)).split(' ')
    const user = {
      email: profile.emails[0].value,
      firstName: firstName,
      lastName: lastName,
      username: profile.username,
      roles: [...profile._json.roles ?? [], 'any-authenticated-user', profile.username as string]
    }
    findOrCreateUser(userRepo, user).then((user: User) => {
      done(null, user);
    }).catch((err: Error) => {
      done(err);
    });
  };
};

/**
 * map passport profile to UserProfile in `@loopback/security`
 * @param user
 */
export const mapProfile = function (user: User): UserProfile {
  const userProfile: UserProfile = {
    [securityId]: user.id,
    name: `${user.firstName} ${user.lastName}`.trim(),
    id: user.id,
    roles: user.roles,
    email: user.email
  };
  return userProfile;
};

export const findOrCreateUser = async function (userRepo: UserRepository, user: ProfileUser): Promise<User> {
  var foundUser = await userRepo.findOne({
    where: { username: user.username },
  });
  if (!foundUser) {
    console.log("User not yet known, create it", JSON.stringify(user, null, 3))
    foundUser = await userRepo.create(user);
  } else {
    // update roles for current user
    await userRepo.updateById(foundUser.id, { 'roles': user.roles, 'username': user.username }); // username can be removed later
  }
  return foundUser
}
