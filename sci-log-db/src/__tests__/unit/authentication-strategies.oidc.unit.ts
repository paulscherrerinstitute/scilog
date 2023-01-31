import {createStubInstance, expect} from '@loopback/testlab';
import {Suite} from 'mocha';
import {Profile} from 'passport';
import {roles} from '../../authentication-strategies/roles';
import {
  extractFirstLastName,
  findOrCreateUser,
} from '../../authentication-strategies/types';
import {UserRepository} from '../../repositories';
import _ from 'lodash';

describe('Authentication strategies roles', function (this: Suite) {
  it('Should return an empty list', () => {
    const emptyRoles = roles({} as Profile);
    expect(emptyRoles).to.be.eql([]);
  });

  it('Should return an empty list since json is undefined', () => {
    const profile = {} as Profile;
    const emptyRoles = roles({...profile, _json: undefined});
    expect(emptyRoles).to.be.eql([]);
  });

  it('Should return an empty list since roles is undefined', () => {
    const profile = {} as Profile;
    const emptyRoles = roles({...profile, _json: {roles: undefined}});
    expect(emptyRoles).to.be.eql([]);
  });

  it('Should return the list of roles', () => {
    const profile = {} as Profile;
    const emptyRoles = roles({
      ...profile,
      _json: {roles: ['g12345', 'g78910']},
    });
    expect(emptyRoles).to.be.eql(['g12345', 'g78910']);
  });

  it('Should return the list of roles without applying any regex', () => {
    const profile = {} as Profile;
    const emptyRoles = roles({
      ...profile,
      _json: {roles: ['g12345', 'g78910', 'e98765']},
    });
    expect(emptyRoles).to.be.eql(['g12345', 'g78910', 'e98765']);
  });

  it('Should return the list of roles including the p-group from e group', () => {
    const profile = {} as Profile;
    const emptyRoles = roles({
      ...profile,
      _json: {roles: ['g12345', 'g78910']},
      username: 'e98765',
    });
    expect(emptyRoles).to.be.eql(['g12345', 'g78910', 'p98765']);
  });

  it('Should return the list of roles not including the p-group from e group as smaller than 5 digits', () => {
    const profile = {} as Profile;
    const emptyRoles = roles({
      ...profile,
      _json: {roles: ['g12345', 'g78910']},
      username: 'e9876',
    });
    expect(emptyRoles).to.be.eql(['g12345', 'g78910']);
  });

  it('Should return the list of roles not including the p-group from e group as not made of digits only', () => {
    const profile = {} as Profile;
    const emptyRoles = roles({
      ...profile,
      _json: {roles: ['g12345', 'g78910']},
      username: 'e987a',
    });
    expect(emptyRoles).to.be.eql(['g12345', 'g78910']);
  });

  it('Should return the list of roles not including the p-group from e group as longer than 5 digits', () => {
    const profile = {} as Profile;
    const emptyRoles = roles({
      ...profile,
      _json: {roles: ['g12345', 'g78910']},
      username: 'e987654',
    });
    expect(emptyRoles).to.be.eql(['g12345', 'g78910']);
  });

  [
    {
      profile: {
        name: {familyName: 'aFamilyName', givenName: 'aFirstName aSecondName'},
      },
      expected: {firstName: 'aFirstName aSecondName', lastName: 'aFamilyName'},
    },
    {
      profile: {name: {familyName: 'aFamilyName', givenName: 'aFirstName'}},
      expected: {firstName: 'aFirstName', lastName: 'aFamilyName'},
    },
    {
      profile: {displayName: 'aFirstName aSecondName aFamilyName'},
      expected: {firstName: 'aFirstName aSecondName', lastName: 'aFamilyName'},
    },
    {
      profile: {displayName: 'aFirstName aFamilyName'},
      expected: {firstName: 'aFirstName', lastName: 'aFamilyName'},
    },
  ].forEach((test, i) => {
    it(`Should return the first name and last name splitted accordingly ${i}`, () => {
      expect(extractFirstLastName(test.profile as Profile)).to.be.eql(
        test.expected,
      );
    });
  });

  it('Should create a user', async () => {
    const stubUserRepo = createStubInstance(UserRepository);
    const user = {
      email: 'anEmail',
      firstName: 'firstName',
      lastName: 'lastName',
      username: 'username',
      roles: ['role1', 'role2'],
    };
    const finOneStub = (stubUserRepo.findOne as sinon.SinonStub).resolves([
      false,
    ]);
    const createStub = (stubUserRepo.create as sinon.SinonStub).resolves();
    const updateById = (stubUserRepo.updateById as sinon.SinonStub).resolves();
    await findOrCreateUser(stubUserRepo, user);
    // eslint-disable-next-line no-unused-expressions
    expect(createStub.calledWith(user)).to.be.true;
    // eslint-disable-next-line no-unused-expressions
    expect(finOneStub.calledWith({where: {username: user.username}})).to.be
      .true;
    // eslint-disable-next-line no-unused-expressions
    expect(updateById.notCalled).to.be.true;
  });

  it('Should update a user', async () => {
    const stubUserRepo = createStubInstance(UserRepository);
    const user = {
      email: 'anEmail',
      firstName: 'firstName',
      lastName: 'lastName',
      username: 'username',
      roles: ['role1', 'role2'],
    };
    const finOneStub = (stubUserRepo.findOne as sinon.SinonStub).resolves(
      '123',
    );
    const createStub = (stubUserRepo.create as sinon.SinonStub).resolves();
    const updateById = (stubUserRepo.updateById as sinon.SinonStub).resolves();
    await findOrCreateUser(stubUserRepo, user);
    // eslint-disable-next-line no-unused-expressions
    expect(createStub.notCalled).to.be.true;
    // eslint-disable-next-line no-unused-expressions
    expect(finOneStub.calledWith({where: {username: user.username}})).to.be
      .true;
    // eslint-disable-next-line no-unused-expressions
    expect(
      updateById.calledWith(
        '123',
        _.pick(user, ['roles', 'username', 'firstname', 'lastname']),
      ),
    ).to.be.true;
  });
});
