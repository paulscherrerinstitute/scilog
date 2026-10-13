// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-passport-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Profile} from 'passport';
import OIDCStrategy from 'passport-openidconnect';
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
  rolesClaims?: string[];
};

/**
 * Login callback for passport-openidconnect. The library decides which
 * arguments to pass by counting the parameters this function declares;
 * only with 9 does it pass the user info profile separately, and position
 * 9 is `done`. Keep all 9, even the unused ones.
 *
 * The user info profile comes from an extra request to the identity
 * provider, and is undefined when skipUserProfile turns that request off.
 */
export type VerifyFunction = (
  claimIss: string,
  profile: object | undefined,
  idProfile: unknown,
  context: unknown,
  idToken: unknown,
  accessToken: unknown,
  refreshToken: unknown,
  params: unknown,
  done: OIDCStrategy.VerifyCallback,
) => void;

/**
 * The user info profile as passport-openidconnect builds it, with the email
 * address that login needs.
 */
type UserInfoProfile = Profile & {
  emails: [{value: string}, ...{value: string}[]];
  _json?: Record<string, unknown>;
};

function isUserInfoProfile(profile: unknown): profile is UserInfoProfile {
  if (typeof profile !== 'object' || profile === null) return false;
  if (!('emails' in profile) || !Array.isArray(profile.emails)) return false;
  return typeof profile.emails[0]?.value === 'string';
}

/**
 * provides an appropriate verify function for oauth2 strategies
 * @param accessToken
 * @param refreshToken
 * @param profile
 * @param done
 */

export const verifyFunctionFactory = function (
  userRepo: UserRepository,
  rolesClaims?: string[],
): VerifyFunction {
  return function (
    claimIss,
    profile,
    idProfile,
    context,
    idToken,
    accessToken,
    refreshToken,
    params,
    done,
  ) {
    // look up a linked user for the profile
    if (!isUserInfoProfile(profile)) {
      throw new Error('email-id is required in returned profile to login');
    }
    const {firstName, lastName} = extractFirstLastName(profile);
    const user = {
      email: profile.emails[0].value,
      firstName: firstName,
      lastName: lastName,
      username: profile.username,
      roles: [
        ...roles(profile, rolesClaims),
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
