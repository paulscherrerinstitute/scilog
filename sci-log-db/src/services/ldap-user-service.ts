// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import { UserService } from '@loopback/authentication';
import { inject } from '@loopback/context';
import { repository } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';
import { securityId, UserProfile } from '@loopback/security';
import { PasswordHasherBindings } from '../keys';
import { User } from '../models/user.model';
import { Credentials, UserRepository } from '../repositories/user.repository';
import { PasswordHasher } from './hash.password.bcryptjs';

const ldap = require('ldapjs-promise');

// TODO allow for customizable isOwnerGroup method
// the following is PSI specific

function isOwnerGroup(element: string) {
  return (element.startsWith("CN=a-") || element.startsWith("CN=p") || element.startsWith("CN=unx"));
}

// TODO make these constant configurable
// const basedn = "OU=x12sa,OU=Users,OU=Experiment,OU=IT,DC=d,DC=psi,DC=ch"; //"OU=users,OU=psi,DC=d,DC=psi,DC=ch"
const basedn = "OU=users,OU=psi,DC=d,DC=psi,DC=ch"; //"OU=users,OU=psi,DC=d,DC=psi,DC=ch"
const ldapserver = "d.psi.ch"
const adSuffix = "dc=d,dc=psi,dc=ch";
const basednBeamline = "OU=Users,OU=Experiment,OU=IT,DC=d,DC=psi,DC=ch"
// needed because one has to get this information *before* eaccount login
const bindAdminSubject = "CN=linux_ldap,OU=Services,OU=IT,DC=d,DC=psi,DC=ch"
const bindAdminPassword = "insertAdminPasswordHere"

// for eaccounts the linked beamline needs to be found
async function findLinkedBeamline(client: any, eaccount: string) {
  try {
    // TODO can client bind to 2 users ?
    await client.bind(bindAdminSubject, bindAdminPassword)
    const searchSubject = basednBeamline;
    const searchOptions = {
      scope: 'sub',
      filter: `(cn=${eaccount})`
    };
    const results = await client.searchReturnAll(searchSubject, searchOptions);
    return results.entries[0].dn
  } catch (err) {
    console.log("Failed to find eaccount:", eaccount)
    return ""
  }
}

export class LDAPUserService implements UserService<User, Credentials> {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER) public passwordHasher: PasswordHasher,
  ) { }

  async verifyCredentials(credentials: Credentials): Promise<User> {
    const { principal, password } = credentials;
    const invalidCredentialsError = 'Invalid principal or password.';

    if (!principal) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }
    const client = ldap.createClient({
      url: `ldaps://${ldapserver}/`,
      reconnect: true
    });

    var searchOptions = {}
    var bindSubject = ""
    var searchSubject = ""

    // check if principal is an email or account name, also support eaccounts
    if (principal.includes('@')) {
      bindSubject = principal;
      searchSubject = adSuffix
      searchOptions = {
        scope: 'sub',
        filter: `(userPrincipalName=${principal})`,
      }
    } else if (/^e[0-9]{5}$/.test(principal)) {
      // find beamline linked to eaccount
      // example DN: CN=e16298,OU=X12SA,OU=Users,OU=Experiment,OU=IT,DC=d,DC=psi,DC=ch
      //  memberOf: 'CN=X12SA,OU=Beamlines,OU=Experiment,OU=IT,DC=d,DC=psi,DC=ch',
      const dn = await findLinkedBeamline(client, principal)
      bindSubject = dn
      searchSubject = bindSubject;
      searchOptions = {
        scope: 'sub',
      };
    } else {
      bindSubject = `CN=${principal},${basedn}`;
      searchSubject = bindSubject;
      searchOptions = {
        scope: 'sub',
      };
    }

    var u: any;
    var repo = this.userRepository;

    try {
      await client.bind(bindSubject, password)
    } catch (err) {
      // try as local user
      console.log(err);
      const foundUser = await repo.findOne({
        where: { email: principal },
      });
      if (!foundUser) {
        throw new HttpErrors.Unauthorized(invalidCredentialsError);
      }

      const credentialsFound = await repo.findCredentials(
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
      console.log("Succesfully logged in as local user:", principal)
      client.destroy();
      return foundUser;
    }

    try {
      const results = await client.searchReturnAll(searchSubject, searchOptions);
      for (let entry of results.entries) {
        var ownerGroups = [...entry.memberOf].filter(isOwnerGroup).map(
          (value: string) => value.substring(3, value.indexOf(","))
        )
        ownerGroups.push('customer')
        // add linked pgroup to eaccounts
        if (/^e[0-9]{5}$/.test(principal)) {
          ownerGroups.push("p" + principal.substring(1))
        }
        // add user itself to allow for single user ownership
        // always take login account name, not email
        ownerGroups.push(entry.cn)
        u = {
          email: entry.userPrincipalName || entry.mail,  // eaccount only have mail field
          firstName: entry.givenName,
          lastName: entry.sn,
          username: entry.cn,
          roles: ownerGroups,
        }
      };
      var foundUser = await repo.findOne({
        where: { username: u.username },
      });
      if (!foundUser) {
        console.log("User not yet known, create it", JSON.stringify(u, null, 3))
        foundUser = await repo.create(u);
      } else {
        // update roles for current user
        await repo.updateById(foundUser.id, { 'roles': u.roles, 'username': u.username }); // username can be removed later
      }

      console.log("Succesfully logged in as AD user:", principal)
      client.destroy();
      return foundUser

    } catch (err) {
      console.log("Failed to find user:", searchSubject)
      client.destroy();
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }
  }

  convertToUserProfile(user: User): UserProfile {
    // console.error("Inside convertToUserProfile:" + JSON.stringify(user, null, 4))
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
    // console.error("convertToUserProfile:", user, userProfile)
    return userProfile;
  }
}
