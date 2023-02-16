// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-passport-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Profile} from 'passport';
import {User} from '../models';
import {UserProfile, securityId} from '@loopback/security';
import {UserRepository} from '../repositories';
import {roles} from './roles';

type ProfileUser = {
  email: string;
  firstName: string;
  lastName: string;
  username: string | undefined;
  roles: string[];
};

export type OIDCOptions = {
  session: boolean;
  provider: string;
  authScheme: string;
  module: string;
  failureFlash: boolean;
  issuer: string;
  authorizationURL: string;
  tokenURL: string;
  userInfoURL: string;
  clientID: string;
  clientSecret: string;
  callbackURL: string;
  scope: string[];
  successRedirect: string;
  skipUserProfile: boolean;
  endSessionEndpoint: string;
  postLogoutRedirectUri: string;
};

export type VerifyFunction = (
  claimIss: string,
  profile: Profile,
  idProfile: ProfileUser,
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  context: any,
  idToken: string,
  accessToken: string,
  refreshToken: string,
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
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
    profile: Profile,
    idProfile: ProfileUser,
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    context: any,
    idToken: string,
    accessToken: string,
    refreshToken: string,
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    params: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    done: (error: any, user?: any, info?: any) => void,
  ) {
    // look up a linked user for the profile
    if (!profile?.emails?.length) {
      throw new Error('email-id is required in returned profile to login');
    }
    const {firstName, lastName} = extractFirstLastName(profile);
    const user = {
      email: profile.emails[0].value,
      firstName: firstName,
      lastName: lastName,
      username: profile.username,
      roles: [
        ...roles(profile),
        'any-authenticated-user',
        profile.emails[0].value,
      ],
    };
    findOrCreateUser(userRepo, user)
      .then((u: User) => {
        done(null, u);
      })
      .catch((err: Error) => {
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
    email: user.email,
  };
  return userProfile;
};

export const findOrCreateUser = async function (
  userRepo: UserRepository,
  user: ProfileUser,
): Promise<User> {
  let foundUser = await userRepo.findOne({
    where: {username: user.username},
  });
  if (!foundUser) {
    console.log('User not yet known, create it', JSON.stringify(user, null, 3));
    foundUser = await userRepo.create(user);
  } else {
    // update roles for current user
    await userRepo.updateById(foundUser.id, {
      roles: user.roles,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
    }); // username can be removed later
  }
  return foundUser;
};

export const extractFirstLastName = function (profile: Profile): {
  firstName: string;
  lastName: string;
} {
  const displayNameSplit: string[] = (profile.displayName ?? '').split(' ');
  const lastName = profile.name?.familyName ?? displayNameSplit.pop() ?? '';
  const firstName = profile.name?.givenName ?? displayNameSplit.join(' ');
  return {firstName, lastName};
};
