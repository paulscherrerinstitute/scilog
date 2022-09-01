// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  authenticate,
  TokenService,
  UserService
} from '@loopback/authentication';
import { TokenServiceBindings } from '@loopback/authentication-jwt';
import { authorize } from '@loopback/authorization';
import { inject } from '@loopback/core';
import { model, property, repository } from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  post,
  put,
  requestBody,
} from '@loopback/rest';
import { SecurityBindings, securityId, UserProfile } from '@loopback/security';
import _ from 'lodash';
import { PasswordHasherBindings, UserServiceBindings } from '../keys';
import { ACL, User } from '../models';
import { ACLRepository, UserRepository } from '../repositories';
import { Credentials } from '../repositories/user.repository';
import { basicAuthorization } from '../services/basic.authorizor';
import { PasswordHasher } from '../services/hash.password.bcryptjs';
import { validateCredentials } from '../services/validator';
import { OPERATION_SECURITY_SPEC } from '../utils/security-spec';
import {
  CredentialsRequestBody,
  UserProfileSchema,
} from './specs/user-controller.specs';

@model()
export class NewUserRequest extends User {
  @property({
    type: 'string',
    required: true,
  })
  password: string;
}

export class UserController {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: UserService<User, Credentials>,
    @repository(ACLRepository) public aclRepository: ACLRepository,
  ) { }

  @post('/users', {
    responses: {
      '200': {
        description: 'User',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': User,
            },
          },
        },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(NewUserRequest, {
            title: 'NewUser',
          }),
        },
      },
    })
    newUserRequest: NewUserRequest,
  ): Promise<User> {
    // All new users have the "any-authenticated-user" role by default
    newUserRequest.roles?.push('any-authenticated-user');

    // ensure a valid email value and password value
    validateCredentials({ principal: newUserRequest.email, password: newUserRequest.password });

    // encrypt the password
    const password = await this.passwordHasher.hashPassword(
      newUserRequest.password,
    );

    try {
      // create the new user
      const savedUser = await this.userRepository.create(
        _.omit(newUserRequest, 'password'),
      );

      // set the password
      await this.userRepository
        .userCredentials(savedUser.id)
        .create({ password });

      return savedUser;
    } catch (error: any) {
      // MongoError 11000 duplicate key
      if (error.code === 11000 && error.errmsg.includes('index: uniqueEmail')) {
        throw new HttpErrors.Conflict('Email value is already taken');
      } else {
        throw error;
      }
    }
  }

  @put('/users/{userId}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'User',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': User,
            },
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({
    allowedRoles: ['admin', 'any-authenticated-user'],
    voters: [basicAuthorization],
  })
  async set(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @param.path.string('userId') userId: string,
    @requestBody({ description: 'update user' }) user: User,
  ): Promise<void> {
    try {
      // Only admin can assign roles
      if (!currentUserProfile.roles.includes('admin')) {
        delete user.roles;
      }
      const updatedUser = await this.userRepository.updateById(userId, user);
      return updatedUser;
    } catch (e: any) {
      return e;
    }
  }

  @get('/users/{userId}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'User',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': User,
            },
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({
    allowedRoles: ['admin', 'support', 'any-authenticated-user'],
    voters: [basicAuthorization],
  })
  async findById(@param.path.string('userId') userId: string): Promise<User> {
    return this.userRepository.findById(userId);
  }

  @get('/users/me', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'The current user profile',
        content: {
          'application/json': {
            schema: UserProfileSchema,
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async printCurrentUser(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<User> {
    // (@jannyHou)FIXME: explore a way to generate OpenAPI schema
    // for symbol property

    const userId = currentUserProfile[securityId];
    return this.userRepository.findById(userId);
  }
  @post('/users/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody(CredentialsRequestBody) credentials: Credentials,
  ): Promise<{ token: string }> {
    console.log("Inside login")
    // ensure the user exists, and the password is correct
    const user = await this.userService.verifyCredentials(credentials);
    console.log("Inside login", user)

    // convert a User object into a UserProfile object (reduced set of properties)
    const userProfile = this.userService.convertToUserProfile(user);
    console.log("Inside login", userProfile)
    // user.roles
    // let role="p18539"
    const acls = await this.aclRepository.find({ where: {read: { inq: user.roles }} })
    console.log("Found acls:", acls)
    //read: { inq: user.roles 
    // const acls = await new Promise<ACL[]>((resolve, reject) => {
    // function cb(err:any, data:any) {  if (err) reject(err);  else resolve(data.toArray());   }
    // const filter={"where": { "read": { "$in": user.roles }}}
    // this.userRepository.dataSource.connector?.execute?('ACL', 'find', filter   ]);
    //let acls=this.aclRepository.find({where:{ read: {inq: user.roles}},fields:{id:true}})
    // let readACLs=acls.map (item => item.id)
    userProfile["readACLs"] = acls.map(item => item.id) //datasetIngestor"p12345"

    console.log("updated user profile", userProfile)


    // create a JSON Web Token based on the user profile
    const token = await this.jwtService.generateToken(userProfile);

    return { token };
  }
}
